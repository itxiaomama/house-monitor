<?php

namespace app\admin\controller\exception;

use app\common\controller\Backend;
use think\Db;
use app\admin\model\Engineering as EngineeringModel;

/**
 * 报警统计管理
 *
 * @icon fa fa-circle-o
 */
class CensusAlarm extends Backend
{

    /**
     * CensusAlarm模型对象
     * @var \app\admin\model\CensusAlarm
     */
    protected $model = null;
    protected $noNeedRight = ['alarm']; //无需鉴权的方法,但需要登录


    public function _initialize()
    {
        parent::_initialize();
        $this->model = new \app\admin\model\CensusAlarm;

    }

    public function import()
    {
        parent::import();
    }

    /**
     * 默认生成的控制器所继承的父类中有index/add/edit/del/multi五个基础方法、destroy/restore/recyclebin三个回收站方法
     * 因此在当前控制器中可不用编写增删改查的代码,除非需要自己控制这部分逻辑
     * 需要将application/admin/library/traits/Backend.php中对应的方法复制到当前控制器,然后进行修改
     */



    /**
     * 对所有的工程进行统计：预警，报警,控制  总数
     */
    public function index()
    {
        //设置过滤方法
        $this->request->filter(['strip_tags', 'trim']);
        if ($this->request->isAjax()) {
            //如果发送的来源是Selectpage，则转发到Selectpage
            if ($this->request->request('keyField')) {
                return $this->selectpage();
            }
            list($where, $sort, $order, $offset, $limit) = $this->buildparams();

            //查询有权限的工程列表
            $adminIds = $this->auth->getChildrenAdminIds(true);

            $engineering_staff = Db::name('engineering_staff')
                ->field('id,engineering_id')
                ->where('adminid','in',$adminIds)
                ->select();

            $engineering_ids = [];
            foreach ($engineering_staff as $v)
            {
                $engineering_ids[] = $v['engineering_id'];
            }

            $engineering = EngineeringModel::all($engineering_ids);
            $engineering = collection($engineering) ->toArray();

            $exceptionAlarmModel = new \app\admin\model\ExceptionAlarm;

            //数据统计
            foreach ($engineering as $k=>$v){
                $engineering[$k]['alarm_warn'] = $exceptionAlarmModel
                    ->where('alarm_status',1)
                    ->where('engineering_id',$v['id'])
                    ->count();

                $engineering[$k]['alarm_error'] = $exceptionAlarmModel
                    ->where('engineering_id',$v['id'])
                    ->where('alarm_status',2)
                    ->count();

                $engineering[$k]['alarm_control'] = $exceptionAlarmModel
                    ->where('engineering_id',$v['id'])
                    ->where('alarm_status',3)
                    ->count();

                $engineering[$k]['alarm_num'] = $engineering[$k]['alarm_control'] + $engineering[$k]['alarm_error'] + $engineering[$k]['alarm_warn'];
            }

            $result = array("total" => count($engineering), "rows" => $engineering);

            return json($result);
        }
        return $this->view->fetch();
    }


    /**
     *  表格所需要的数据:
     *     一年之内  每个月的报警次数
     *
     */
    public function alarm()
    {

         $time = $this->request->request('time');
         if(!empty($time)) {
             $x_row  =  explode(" ", $time);
             unset($x_row[1]);
             $x_row = $this->getTimeInterval($x_row[0],$x_row[2]);
         }else{
             $x_row = $this->getTimePeriod();
         }

        $control = $this ->getAlarmByRow($x_row,3);
        $error   = $this ->getAlarmByRow($x_row,2);
        $warning = $this ->getAlarmByRow($x_row,1);

        $data = [
            'code' =>1,
            'control' => $control,
            'error' => $error,
            'warning' => $warning,
            'x_row' => $x_row,
        ];

        return json($data);
    }

    /**
     * 获取最近一年的时间段
     * @return array
     */
    public function getTimePeriod()
    {
        $time = [];
        for ($i= 12; $i>=0; $i--)
        {
           $time[] = date('Y-m',time()-86400*$i*30);
        }

        return $time;
    }


    /**
     * 获取两个时间段之间的月份
     * @param $mix 最小的月份   e.g:2020-06
     * @param $max 最大的月份   e.g:2021-06
     * @return array
     */
    public function getTimeInterval($mix,$max)
    {
        $start_time = strtotime($mix);
        $end_time = strtotime($max);
        $month_arr = [];
        for($start_time; $start_time <= $end_time;  $start_time = strtotime('+1 month', $start_time)){
            $month_arr[] = date('Y-m',$start_time); // 取得递增月;
        }

        return $month_arr;
    }

    /**
     * 根据时间获取告警数据
     * @param $x_row array 时间段   ['2020-07','2020-08']
     * @param $alarm_status 告警状态
     * @return mixed
     */
    public function getAlarmByRow($x_row,$alarm_status)
    {
        $exceptionAlarmModel = new \app\admin\model\ExceptionAlarm;

        //当前管理员可以查看的数据权限
        $adminIds = $this->auth->getChildrenAdminIds(true);

        $engineering_staff = Db::name('engineering_staff')
            ->field('id,engineering_id')
            ->where('adminid','in',$adminIds)
            ->select();

        $engineering_ids = [];
        foreach ($engineering_staff as $v)
        {
            $engineering_ids[] = $v['engineering_id'];
        }

        $num = [];
        foreach ($x_row as $v){
            $num[] = $exceptionAlarmModel
                ->where('alarm_time','between time',[$v.'-1',$v.'-31'])
                ->where('alarm_status',$alarm_status)
                ->where('engineering_id','in',$engineering_ids)
                ->count();
        }
        return $num;
    }


}
