<?php

namespace app\admin\controller\engineering;

use app\common\controller\Backend;
use app\admin\model\MonType as MonTypeModel;
use Exception;
use think\Db;
use think\exception\PDOException;
use think\exception\ValidateException;


/**
 * 报警方案表
 *
 * @icon fa fa-circle-o
 */
class Plan extends Backend
{

    /**
     * Plan模型对象
     * @var \app\admin\model\Plan
     */
    protected $model = null;
    protected $noNeedRight = ['mon_type','monitor_type_fields','getAlarmSet','detail','select_type_list']; //无需鉴权的方法,但需要登录


    //数据权限
    protected $dataLimit = 'auth'; //表示显示当前自己和所有子级管理员的所有数据
    protected $dataLimitField = 'admin_id'; //数据关联字段,当前控制器对应的模型表中必须存在该字段


    public function _initialize()
    {
        parent::_initialize();
        $this->model = new \app\admin\model\Plan;

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
     * 添加
     */
    public function add()
    {
        if ($this->request->isPost()) {
            $params = $this->request->post("row/a");
            $alarm = $this->request->post("alarm/a");
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

                    $mon_type = MonTypeModel::get($params['mon_type']);

                    $params['mon_type_id'] =  $params['mon_type'];
                    $params['mon_type_name'] =  $mon_type->mon_type_name;
                    $params['createtime'] =  time();
                    $result = $this->model->allowField(true)->save($params);

                    //警情设置
                    //1.每个都截掉_后部分    组成一个数组_arr，去掉重复的
                    $alarmSet = $this ->getAlarmSet($params['mon_type']);
                    $key      = array_keys($alarmSet); //data1 ,data1_this,data1_total,data1_rate,data2
                    $key[]    = 'data888';

                    //2.当前的值 包含_arr中的，放到一个数组中
                    //以结尾相同的放到同一数组中，并以该结尾为key
                    $new = [];
                    foreach($key as $k =>$v)
                    {
                        foreach ($alarm as $k1 => $v1)  //提交过来的参数   ['state_data1'=>0,'warn_data1'=>0]
                        {
                            if( strstr($k1,'_') == '_'.$v )
                            {
                                $new[$v][$k1] = $v1;
                            }
                        }
                    }
                    //处理好的数据
                    $point_alarm_data = [];
                    foreach ($new as $k =>$v)
                    {
                        $point_alarm_data['mon_type_id']   = $params['mon_type_id'];
                        $point_alarm_data['plan_id']       = $this->model->id; //告警方案id

                        $point_alarm_data['item']          = $k;
                        $point_alarm_data['item_name']     = $alarmSet[$k];
                        $point_alarm_data['state']         = $v['state_'.$k];
                        $point_alarm_data['warn']          = $v['warn_'.$k];
                        $point_alarm_data['error']         = $v['error_'.$k];
                        $point_alarm_data['control']       = $v['control_'.$k];
                        $point_alarm_data['createtime']    = time();

                        $res = Db::name('plan_alarm')->insert($point_alarm_data);
                    }

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
        return $this->view->fetch();
    }

    /**
     * 编辑
     */
    public function edit($ids = null)
    {
        $row = $this->model->get($ids);
        if (!$row) {
            $this->error(__('No Results were found'));
        }
        $adminIds = $this->getDataLimitAdminIds();
        if (is_array($adminIds)) {
            if (!in_array($row[$this->dataLimitField], $adminIds)) {
                $this->error(__('You have no permission'));
            }
        }
        if ($this->request->isPost()) {
            $params = $this->request->post("row/a");
            $paramsAlarm         =  $this->request->post("alarm/a");

            //处理参数 分类
            //1.每个都截掉_后部分    组成一个数组_arr，去掉重复的
            $alarmSet = $this ->getAlarmSet($row ->mon_type_id);
            $key      = array_keys($alarmSet);

            //2.当前的值 包含_arr中的，放到一个数组中
            $new = [];
            foreach($key as $k =>$v)
            {
                foreach ($paramsAlarm as $k1 => $v1)
                {
                    if( strstr($k1,'_') == '_'.$v )
                    {
                        $new[$v][$k1] = $v1;
                    }
                }
            }


            if ($params) {
                $params = $this->preExcludeFields($params);
                $result = false;
                Db::startTrans();
                try {
                    //是否采用模型验证
                    if ($this->modelValidate) {
                        $name = str_replace("\\model\\", "\\validate\\", get_class($this->model));
                        $validate = is_bool($this->modelValidate) ? ($this->modelSceneValidate ? $name . '.edit' : $name) : $this->modelValidate;
                        $row->validateFailException(true)->validate($validate);
                    }
                    $result = $row->allowField(true)->save($params);

                    //修改警情设置
                    $plan_alarm_data = [];
                    foreach ($new as $k =>$v)
                    {
                        $plan_alarm_data['state']         = $v['state_'.$k];
                        $plan_alarm_data['warn']          = $v['warn_'.$k];
                        $plan_alarm_data['error']         = $v['error_'.$k];
                        $plan_alarm_data['control']       = $v['control_'.$k];
                        $plan_alarm_data['updatetime']    = time();

                        $res = Db::name('plan_alarm')
                            ->where('id',$v['id_'.$k])
                            ->update($plan_alarm_data);
                    }



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
                    $this->error(__('No rows were updated'));
                }
            }
            $this->error(__('Parameter %s can not be empty', ''));
        }

        $mon_type = MonTypeModel::all(['status' => 1]);
        $mon_type = array_select($mon_type, 'mon_type_name');

        //告警参数
        $plan_alarm = Db::name('plan_alarm')
            ->where('plan_id',$ids)
            ->select();

        $this->assign('plan_alarm',$plan_alarm);
        $this->assign('mon_type',$mon_type);
        $this->view->assign("row", $row);
        return $this->view->fetch();
    }

    /**
     * 获取监测内容
     *
     */
    public function mon_type()
    {
        $mon_type_old = MonTypeModel::all(['status' => 1]);

        $mon_type = [];
        foreach ($mon_type_old as $k => $v)
        {
            $mon_type[$k]['name'] = $v['mon_type_name'];
            $mon_type[$k]['value'] = $v['id'];
        }

        return $this->win(1,"","",$mon_type);
    }

    /**
     * 根据监测内容获取告警参数
     *
     */
    public function monitor_type_fields()
    {
        $id = $this->request->post("id");
        //告警设置的参数
        $alarmSet = $this ->getAlarmSet($id);

        return $this->win(1,"","",$alarmSet);

    }

    /**
     * 根据 监测内容id 获取 告警内容
     * @param integer $mon_type_id
     * @return mixed
     */
    public function getAlarmSet($mon_type_id)
    {
        $mon_type = MonTypeModel::get($mon_type_id) ->toArray();
        //剔除空的数组
        foreach($mon_type as $k=>$v){
            if(empty($v)){
                unset($mon_type[$k]);
            }
        }

        unset($mon_type['id']);
        unset($mon_type['mon_type_name']);
        unset($mon_type['status']);



        return $mon_type;
    }

    /**
     * 报警方案详情
     *
     */
    public function detail($ids = null)
    {
        $plan_id = $ids;
        $engineering_id = $this->request->get('engineering_id');

        $plan = Db::name('plan')
            ->where('id',$plan_id)
            ->find();
        $plan_alarm = Db::name('plan_alarm')
            ->where('plan_id',$plan_id)
            ->select();
        $this->assign('row',$plan);
        $this->assign('plan_alarm',$plan_alarm);
        $this->assign('plan_id',$plan_id);
        return $this->view->fetch();
    }

    /**
     *
     * 获取下拉的监测类型
     */
    public function select_type_list()
    {
        $list = Db::name('mon_category')
            ->select();
        $list = array_select($list,'mon_item_name');
        return json($list);
    }




}
