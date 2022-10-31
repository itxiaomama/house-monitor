<?php

namespace app\admin\controller\exception;

use app\admin\model\Data as DataModel;
use app\admin\model\ExceptionAlarm as ExceptionAlarmModel;
use app\admin\model\Engineering as EngineeringModel;
use app\admin\model\ExceptionAlarmRecord as ExceptionAlarmRecordModel;
use app\admin\model\ExceptionAlarmLog as ExceptionAlarmLogModel;
use app\admin\model\Agency as AgencyModel;
use app\admin\model\Point;
use app\admin\model\Point as PointModel;
use app\admin\model\Staff as StaffModel;
use app\common\controller\Backend;
use think\Db;

/**
 * 报警管理管理
 *
 * @icon fa fa-circle-o
 */
class ExceptionAlarm extends Backend
{

    /**
     * ExceptionAlarm模型对象
     * @var \app\admin\model\ExceptionAlarm
     */
    protected $model = null;
    protected $noNeedRight = ['detail','get_alarm_log','get_alarm_record','judge','record' ,'apply'  ,'cancel']; //无需鉴权的方法,但需要登录

    protected $data_ids = ""; //ids的字符串
    protected $alarm_ids = [];
    protected $point_ids = [];
    protected $updatePointTrue = false;
    protected $alarm_state = 0; //正常

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new \app\admin\model\ExceptionAlarm;

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
     * 查看
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

            $list = $this->model
                ->where($where)
                ->where('engineering_id','in',$engineering_ids)
                ->order($sort, $order)
                ->paginate($limit);

            $result = array("total" => $list->total(), "rows" => $list->items());

            return json($result);
        }
        //清除垃圾数据   可以只使用一次
        $this->delGarbage();

        return $this->view->fetch();
    }

    /**
     * 清除垃圾数据  需要时执行
     *
     */
    public function delGarbage()
    {
        $exception_alarm = Db::name('exception_alarm')
            ->select();

        $engineering = Db::name('engineering')
            ->field('id,name')
            ->select();

        $engineeringIds = array_select($engineering,'name');
        $engineering_ids = [];
        foreach ($exception_alarm as $k=>$v){
            if(!isset( $engineeringIds[$v['engineering_id']])){
                $engineering_ids[$v['engineering_id']] = $v['engineering_id'];
            }
        }
        if(!empty($engineering_ids)){
            $res = Db::name('exception_alarm')
                ->where('engineering_id','in',$engineering_ids)
                ->delete();
        }
    }


    /**
     *  警情管理：报警详情&报警记录
     * @param $ids  integer 报警管理id
     * @return mixed
     */
    public function detail($ids = null)
    {
        //项目数据
         $exception_alarm_id = $ids;

        $keyword = $this->request->get("keyword");

        //报警详情
        $exception_alarm = ExceptionAlarmModel::get($exception_alarm_id);
        $exception_alarm = $exception_alarm-> toArray();

        //所属机构
        $engineering = EngineeringModel::get($exception_alarm['engineering_id']);
        $exception_alarm['agency_name'] = "";
        if(!empty($engineering))
        {
            $agency = AgencyModel::get($engineering->monitor_id);
            $exception_alarm['agency_name'] = $agency->agency_name;
        }



        $this->assign('keyword', $keyword);
        $this->assign('exception_alarm', $exception_alarm);

        return $this->view->fetch();
    }

    /**
     * 获取 告警记录
     *
     */
    public function get_alarm_log()
    {
        $this->delGarbageLog();
        $model = new \app\admin\model\ExceptionAlarmLog;

        $exception_alarm_id = $this->request->request('id');
        //设置过滤方法
        $this->request->filter(['strip_tags', 'trim']);
        if ($this->request->isAjax()) {
            //如果发送的来源是Selectpage，则转发到Selectpage
            if ($this->request->request('keyField')) {
                return $this->selectpage();
            }
            list($where, $sort, $order, $offset, $limit) = $this->buildparams();

            //需要知道 测点的 项目监测内容id
            $list = $model
                ->where($where)
                ->where('exception_alarm_id',$exception_alarm_id)
                ->order($sort, $order)
                ->paginate($limit);

            $row  = $list->items();
            foreach ($row as &$v){
                $point = PointModel::get($v['point_id']);
                $project_mon_type_id = "";
                if(!empty($point))  //防止测点不存在的情况下报错
                {
                    $project_mon_type_id =  $point->project_mon_type_id;
                }
                $v['project_mon_type_id'] = $project_mon_type_id;
            }

            $result = array("total" => $list->total(), "rows" => $row);

            return json($result);
        }
        return $this->view->fetch();
    }



    /**
     * 清除垃圾数据-告警记录  需要时执行
     *
     */
    public function delGarbageLog()
    {
        $exception_alarm_log = Db::name('exception_alarm_log')
            ->select();

        $engineering = Db::name('engineering')
            ->field('id,name')
            ->select();

        $engineeringIds = array_select($engineering,'name');
        $engineering_ids = [];
        foreach ($exception_alarm_log as $k=>$v){
            if(!isset( $engineeringIds[$v['engineering_id']])){
                $engineering_ids[$v['engineering_id']] = $v['engineering_id'];
            }
        }
        if(!empty($engineering_ids)){
            $res = Db::name('exception_alarm_log')
                ->where('engineering_id','in',$engineering_ids)
                ->delete();
        }
    }


/**
 *需要的数据
 alarm_id: 160     告警管理id
create_time: "2021-06-04 08:37:26"
id: 34
remark: "警情确认：误报；报警测点：[]；报警原因：试验测试。"
staff_id: 1
staff_name: "卓明明"
state: 2
 */


    /**
     * 报警处理记录
     *
     */
    public function get_alarm_record()
    {
        $model = new \app\admin\model\ExceptionAlarmRecord;

        $alarm_id = $this->request->get('id');
        //设置过滤方法
        $this->request->filter(['strip_tags', 'trim']);
        if ($this->request->isAjax()) {
            //如果发送的来源是Selectpage，则转发到Selectpage
            if ($this->request->request('keyField')) {
                return $this->selectpage();
            }
            list($where, $sort, $order, $offset, $limit) = $this->buildparams();

            $list = $model
                ->where('alarm_id',$alarm_id)
                ->where($where)
                ->order($sort, $order)
                ->paginate($limit);

            $result = array("total" => $list->total(), "rows" => $list->items());

            return json($result);
        }
        return $this->view->fetch();
    }


    /**
     * 警情确认
     * @param  $id  告警管理id
     * @return mixed
     */
    public function judge($id)
    {
        $alarm_id = $id;
        //设置过滤方法
        $this->request->filter(['strip_tags', 'trim']);
        if ($this->request->isAjax()) {

            $row = $this->model->get($alarm_id);
            $params['updatetime']   = time();
            $params['judge_status'] = 1;
            $params['judge_time'] = time();
            $params['record_status'] = 1;
            $result = $row->allowField(true)->save($params);

            $row = $this->model->get($alarm_id);

            //添加警情确认记录
            $staff = StaffModel::get(['admin_id' => $this->auth->id]);
            $isSuperAdmin = $this->auth->isSuperAdmin();
            $staff_name = $staff['staff_name'];
            if($isSuperAdmin){
                $staff_name = '超级管理员';
            }
            $recordParams = [
                'alarm_id' => $alarm_id,
                'staff_id' => $staff['id'] ,
                'staff_name' => $staff_name,
                'status' => 1,
                'createtime' => time(),
                'remark'=>'警情确认'
            ];
            $record = ExceptionAlarmRecordModel::create($recordParams);

            $data = [
                'code' =>1,
                'msg' =>'确认成功',
                'data'=> $row
            ];
            return json($data);

        }

        $this->assign('alarm_id', $alarm_id);
        return $this->view->fetch();
    }


    /**
     * 警情处理
     * @param  $id  告警管理id
     * @return mixed
     */
    public function record($id)
    {
        $alarm_id = $id;
        $row = $this->model->get($alarm_id);

        //设置过滤方法
        $this->request->filter(['strip_tags', 'trim']);
        if ($this->request->isAjax()) {

            $params = $this->request->post("row/a");

            $params['updatetime']   = time();
            $params['record_time'] = time();
            //1=>'误报', 5 =>'已处理'
            if($params['record_status'] == 5){
                $params['judge_status'] = 4;
                $params['judge_time'] = time();
                $remark = "警情处理：已处理；报警测点：[]；误报原因：". $params['record_case'] ;
                $status = 6;
            }else{
                $remark = "警情处理：误报；报警测点：[]；误报原因：". $params['record_case'];
                $status = 2;
            }

            $result = $row->allowField(true)->save($params);
            $row = $this->model->get($alarm_id);

            //添加警情确认记录
            $staff = StaffModel::get(['admin_id' => $this->auth->id]);

            $isSuperAdmin = $this->auth->isSuperAdmin();
            $staff_name = $staff['staff_name'];
            if($isSuperAdmin){
                $staff_name = '超级管理员';
            }
            $recordParams = [
                'alarm_id' => $alarm_id,
                'staff_id' => $staff['id'] ,
                'staff_name' => $staff_name,
                'status' => $status,
                'createtime' => time(),
                'remark'=>$remark
            ];
            $record = ExceptionAlarmRecordModel::create($recordParams);

            if($params['record_status'] == 5)
            {
                $this->out($alarm_id);
            }

                $data = [
                'code' =>1,
                'msg' =>'确认成功',
                'data'=> $row
            ];
            return json($data);

        }

        $this->assign('row', $row);
        $this->assign('alarm_id', $alarm_id);
        return $this->view->fetch();
    }


    /**
     * 申请消警
     * @param  $id  告警管理id
     * @return mixed
     */
    public function apply($id)
    {
        $alarm_id = $id;
        $row = $this->model->get($alarm_id);

        //设置过滤方法
        $this->request->filter(['strip_tags', 'trim']);
        if ($this->request->isAjax()) {

            $params = $this->request->post("row/a");

            $params['updatetime']   = time();
            $params['record_time'] = time();
            $params['judge_status'] = 2;
            $result = $row->allowField(true)->save($params);

            $row = $this->model->get($alarm_id);

            //添加警情确认记录
            $staff = StaffModel::get(['admin_id' => $this->auth->id]);
            $isSuperAdmin = $this->auth->isSuperAdmin();
            $staff_name = $staff['staff_name'];
            if($isSuperAdmin){
                $staff_name = '超级管理员';
            }
            $recordParams = [
                'alarm_id' => $alarm_id,
                'staff_id' => $staff['id'] ,
                'staff_name' => $staff_name,
                'status' => 3,
                'createtime' => time(),
                'remark'=> "申请消警：发出申请；报警测点：[]；误报原因：". $params['record_case'],
            ];
            $record = ExceptionAlarmRecordModel::create($recordParams);

            $data = [
                'code' =>1,
                'msg' =>'确认成功',
                'data'=> $row
            ];
            return json($data);

        }

        $this->assign('alarm_id', $alarm_id);
        $this->assign('row', $row);
        return $this->view->fetch();
    }

    /**
     *
     */
    /**
     * 消警确认
     * @params  $id  告警管理id
     * @return mixed
     */
    public function cancel($id)
    {
        $alarm_id = $id;
        $row = $this->model->get($alarm_id);

        //设置过滤方法
        $this->request->filter(['strip_tags', 'trim']);
        if ($this->request->isAjax()) {

            $params = $this->request->post("row/a");

            $params['updatetime']   = time();
            $params['record_time'] = time();
            //3 =>'确认消警', 4=>'驳回消警'
            if($params['record_status'] == 3){
                $params['judge_status'] = 3;
                $params['judge_time'] = time();
                $remark = "消警确认：确认消警";
                $status = 4;
            }else{
                //驳回消警   回到警情处理
                $remark = "消警确认：驳回消警；报警测点：[]；驳回原因：". $params['rejected'];
                $status = 5;

                $params['judge_status'] = 1;
                $params['judge_time'] = time();

            }
            $result = $row->allowField(true)->save($params);

            $row = $this->model->get($alarm_id);

            //添加警情确认记录
            $staff = StaffModel::get(['admin_id' => $this->auth->id]);
            $isSuperAdmin = $this->auth->isSuperAdmin();
            $staff_name = $staff['staff_name'];
            if($isSuperAdmin){
                $staff_name = '超级管理员';
            }
            $recordParams = [
                'alarm_id' => $alarm_id,
                'staff_id' => $staff['id'] ,
                'staff_name' => $staff_name,
                'status' => $status,
                'createtime' => time(),
                'remark'=>$remark,
            ];
            $record = ExceptionAlarmRecordModel::create($recordParams);

            //消警后告警状态的处理
            $this->out($alarm_id);

            $data = [
                'code' =>1,
                'msg' =>'确认成功',
                'data'=> $row
            ];
            return json($data);

        }

        $this->assign('alarm_id', $alarm_id);
        $this->assign('row', $row);
        return $this->view->fetch();
    }



    /**
     * 消警后告警状态的处理
     * @params  integer $alarm_id 告警管理id
     * @return mixed
     *
     */
    public function out($alarm_id)
    {
        $res = $this->model->out($alarm_id);
        //1.预警告警表的处理
        Db::name('predict_alarm_log')->where('exception_alarm_id',$alarm_id)->delete();
        //2.数据 告警状态改变
        $alarm_logs =   Db::name('exception_alarm_log')
            ->field('data_id')
            ->where('exception_alarm_id',$alarm_id)
            ->select();
        $data_ids = [];
        foreach($alarm_logs as $alarm_log){
            $data_ids[] = $alarm_log['data_id'];
        }

        $this->outData($data_ids);
    }



    /**
     * 数据删除后，告警状态的改变
     * @params $ids 数据ids
     * @return mixed
     *
     */
    public function outData($ids)
    {
        $this->data_ids = $ids;
        //告警记录
        $this->delExceptionAlarmLog();
        //告警管理
        $this->delExceptionAlarm();
        //测点表
        $this->updatePoint();
        //项目表
        $this->updateProject();
    }


    /**
     * 删除告警
     *@params  ids integer 数据ids
     *@return mixed
     */
    public function delExceptionAlarm()
    {
        $res = Db::name('exception_alarm')
            ->where('id','in',$this->alarm_ids)
            ->delete();
    }

    /**
     * 删除告警记录
     *@params  ids integer 数据ids
     *@return mixed
     */
    public function delExceptionAlarmLog()
    {
        $data_ids = $this->data_ids;

        $alarm_log  = Db::name('exception_alarm_log')
            ->where('data_id','in',$data_ids)
            ->select();
        $alarm_ids = [];
        foreach ($alarm_log as $v){
            $alarm_ids[$v['exception_alarm_id']] = $v['exception_alarm_id'];
        }
        sort($alarm_ids);
        $this->alarm_ids = $alarm_ids;


        //删除
        $res = Db::name('exception_alarm_log')
            ->where('data_id','in',$data_ids)
            ->delete();
    }


    /**
     *  测点修改
     */
    public function updatePoint()
    {
        //判断测点下的所有数据是否还有报警的
        $data  = \app\admin\model\Data::all($this->data_ids);
        $point_ids = [];
        foreach ($data as $key => $val){
            $point_ids[] = $val['point_id'];
        }
        $this->point_ids = $point_ids;
        //错误了
        $hasData = Db::name('data')
            ->where('id','not in', $this->data_ids)
            ->where('point_id','in', $point_ids)
            ->where('alarm_state','in', [1,2] ) //预警和告警的
            ->count();

        if($hasData == 0){
            $res = Db::name('point')
                ->where('id','in',$point_ids)
                ->update(['alarm_status'=>$this->alarm_state,'updatetime'=>time()]);
            $this->updatePointTrue = true;
        }
    }


    /**
     *  项目修改
     */
    public function updateProject()
    {
        if($this->updatePointTrue == false)
        {
            return false;
        }

        //判断测点下的所有数据是否还有报警的
        $point = Point::all($this->point_ids);
        $project_ids = [];
        foreach ($point as $key => $val){
            $project_ids[] = $val['project_id'];
        }

        $hasProject = Db::name('point')
            ->where('id','not in', $this->point_ids  )
            ->where('project_id','in', $project_ids)
            ->where('alarm_status','in', [1,2] ) //预警和告警的
            ->count();

        if($hasProject == 0){
            $res = Db::name('project')
                ->where('id','in',$project_ids)
                ->update(['alarm_state'=> 0,'updatetime'=>time()]);  //项目的告警状态改为正常
        }

    }
}
