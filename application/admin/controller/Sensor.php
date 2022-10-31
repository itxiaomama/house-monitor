<?php

namespace app\admin\controller;

use app\admin\common\Hardware;
use app\common\controller\Backend;
use Exception;
use think\Db;
use think\exception\PDOException;
use think\exception\ValidateException;

/**
 * 传感器管理
 *
 * @icon fa fa-circle-o
 */
class Sensor extends Backend
{

    /**
     * Sensor模型对象
     * @var \app\admin\model\Sensor
     */
    protected $model = null;
    protected $noNeedRight = ['allot']; //无需鉴权的方法,但需要登录

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new \app\admin\model\Sensor;

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
        //当前是否为关联查询
        $this->relationSearch = true;
        //设置过滤方法
        $this->request->filter(['strip_tags', 'trim']);
        if ($this->request->isAjax()) {
            //如果发送的来源是Selectpage，则转发到Selectpage
            if ($this->request->request('keyField')) {
                return $this->selectpage();
            }
            list($where, $sort, $order, $offset, $limit) = $this->buildparams();

            $list = $this->model
                    ->with(['montype'])
                    ->where($where)
                    ->order($sort, $order)
                    ->paginate($limit);

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


            foreach ($list as $row) {
                $row->visible(['name','id','count']);
                $row->visible(['montype']);
				$row->getRelation('montype')->visible(['mon_type_name']);


                //使用数量
                $row->count = Db::name('point')
                    ->where('sensor_id',$row->id)
                    ->where('engineering_id','in',$engineering_ids)
                    ->count();

//				if($row->name == '应变计'){ //应变计的设备和其他传感器数量的计算方式不一样
//                    $count = $this->getGaugeNum($row->id);
//                    $row->count = $count;
//                }


            }


            $result = array("total" => $list->total(), "rows" => $list->items());

            return json($result);
        }
        return $this->view->fetch();
    }



    /**
     * 添加
     */
    public function add()
    {
        if ($this->request->isPost()) {
            $params = $this->request->post("row/a");
            if ($params) {
                $params = $this->preExcludeFields($params);

                if ($this->dataLimit && $this->dataLimitFieldAutoFill) {
                    $params[$this->dataLimitField] = $this->auth->id;
                }
                $result = false;
                Db::startTrans();
                try {
                    //是否采用模型验证
                    if ($this->modelValidate) {
                        $name = str_replace("\\model\\", "\\validate\\", get_class($this->model));
                        $validate = is_bool($this->modelValidate) ? ($this->modelSceneValidate ? $name . '.add' : $name) : $this->modelValidate;
                        $this->model->validateFailException(true)->validate($validate);
                    }
                    $result = $this->model->allowField(true)->save($params);
                    Db::commit();
                } catch (ValidateException $e) {
                    Db::rollback();
                    $this->error($e->getMessage());
                } catch (PDOException $e) {
                    Db::rollback();
                    $this->error($e->getMessage());
                } catch (Exception $e) {
                    Db::rollback();
                    $this->error($e->getMessage());
                }
                if ($result !== false) {
                    $this->success();
                } else {
                    $this->error(__('No rows were inserted'));
                }
            }
            $this->error(__('Parameter %s can not be empty', ''));
        }

        //监控内容
        $mon_type  = Db::name('mon_type')
            ->where('status',1)
            ->select();

        $mon_type = array_select($mon_type,'mon_type_name');

        $this->assign('mon_type',$mon_type);

        return $this->view->fetch();
    }


    /**
     *  绑定监测内容
     *
     */
    public function allot($ids = null)
    {
        $sensor_id  = $ids;
        if ($this->request->isPost())
        {
            //监测内容id
            $mon_type = $this->request->post('row/a')['mon_types'];
            //删除数据
            $res = Db::name('sensor_mon_type')
                ->where('sensor_id',$sensor_id)
                ->delete();
            $data = [];
            foreach ($mon_type as $v){
               $param['mon_type_id'] = $v;
               $param['sensor_id'] = $sensor_id;
               $param['createtime'] = time();
               $data[] = $param;
            }

            Db::name('sensor_mon_type')->insertAll($data);

            $this->success();
            return true;
        }

        $mon_type_list= Db::name('mon_type')
            ->where('status',1)
            ->field('id,mon_type_name')
            ->select();


        $mon_type_list = array_select($mon_type_list,'mon_type_name');

        //获取默认值
         $sensor_mon_type = Db::name('sensor_mon_type')
            ->where('sensor_id',$sensor_id)
            ->select();

         $mon_type_ids = [];
         foreach($sensor_mon_type as $k=>$v){
             $mon_type_ids[] = $v['mon_type_id'];
         }

        $this->assign('sensor_id',$sensor_id);
        $this->assign('mon_type_list',$mon_type_list);
        $this->assign('mon_type_ids',$mon_type_ids);
        return $this->view->fetch();
    }

//    /**
//     * 应变计 使用数量的算法
//     * $id  传感器id
//     * return mixed
//     */
//    public function getGaugeNum($id)
//    {
//
//        $point = Db::name('point')
//            ->where('sensor_id',$id)
//            ->find();
//
//        $mon_type = Db::name('mon_type')
//            ->where('id',$point['mon_type_id'])
//            ->find();
//
//        //剔除空的数组
//        foreach($mon_type as $k=>$v){
//            if(empty($v)){
//                unset($mon_type[$k]);
//            }
//        }
//
//        unset($mon_type['id']);
//        unset($mon_type['mon_type_name']);
//        unset($mon_type['status']);
//        return count($mon_type);
//    }

}
