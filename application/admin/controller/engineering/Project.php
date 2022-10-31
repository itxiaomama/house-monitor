<?php

namespace app\admin\controller\engineering;

use app\admin\model\ConfigApi;
use app\admin\model\MonCategory;
use app\admin\model\MonType as MonTypeModel;
use app\admin\model\Engineering as EngineeringModel;
use app\admin\model\Staff as StaffModel;
use app\admin\model\Agency as AgencyModel;
use app\common\controller\Backend;
use Exception;
use fast\Random;
use think\Config;
use think\Db;
use think\exception\PDOException;
use think\exception\ValidateException;
use think\Cache;

/**
 *
 *
 * @icon fa fa-circle-o
 */
class Project extends Backend
{

    /**
     * Project模型对象
     * @var \app\admin\model\Project
     */
    protected $model = null;
//    protected $dataLimit = 'auth'; //表示显示当前自己和所有子级管理员的所有数据
//    protected $dataLimitField = 'admin_id'; //数据关联字段,当前控制器对应的模型表中必须存在该字段
    protected $alarm_ids = [];
    protected $point_ids = [];

    //不需要授权的方法
    protected $noNeedRight = ['getMonCategory' ,'get_plans','getMonCategory','getMonTypeByProjectId'];

    //快熟搜索字段
    protected $searchFields = 'item_name,serial';

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new \app\admin\model\Project;

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
     * 项目下的项目列表
     * @params engineering_id 项目id
     * @return mixed
     */
    public function index()
    {
        $engineering_id = $this->request->get('engineering_id');
        $engineering    = EngineeringModel::get($engineering_id);

        //当前是否为关联查询
        $this->relationSearch = false;
        //设置过滤方法
        $this->request->filter(['strip_tags', 'trim']);
        if ($this->request->isAjax()) {
            //如果发送的来源是Selectpage，则转发到Selectpage
            if ($this->request->request('keyField')) {
                return $this->selectpage();
            }
            list($where, $sort, $order, $offset, $limit) = $this->buildparams();

            $list = $this->model
                ->where($where)
                ->where('engineering_id',$engineering_id)
                ->order($sort, $order)
                ->paginate($limit);

            $mon_category = Db::name('mon_category')->select();
            $mon_category = array_select($mon_category,'mon_item_name');

            foreach ($list as $row) {
                $row->visible(['id', 'item_name', 'status', 'alarm_state', 'serial','createtime','mon_item_name','show_status']);
                //监测类型id 改为 监测类型名称
                $row->mon_item_name = $mon_category[$row->mon_category_id];

                $row->show_status  = $engineering->project_type === 1 ? 0 : 1;

            }

            $result = array("total" => $list->total(), "rows" => $list->items());

            return json($result);
        }
        $this->assign('engineering_id',$engineering_id);
        return $this->view->fetch();
    }


    /**
     * 添加项目
     * @param 项目名称
     * @param 监测类型
     * @param 监测设备
     * @param 监测类型
     *
     */
    public function add($ids = null)
    {
        $engineering_id = $this->request->get("engineering_id");
        if ($this->request->isPost()) {
            $params = $this->request->post("row/a");
            if ($params) {
                $params = $this->preExcludeFields($params);

                //厂商配置 必须选择
                $config_api_id = $params['config_api_id'];
                if ($config_api_id == 0){
                    $this->error('请选择厂商配置');
                }

                //项目id
                $engineering_id = $this->request->post('engineering_id');
                $params['engineering_id'] = $engineering_id;


                //监测内容id,多选，查询麻烦~废弃
                $types     = $this->request->post('types/a');
                if(!empty($types)){
                    $mon_types = implode(',',array_values($types));
                    $params['mon_types'] = $mon_types;
                }


                //监测设备ids，多选的
                $device_ids     = $this->request->post('device_ids/a');
                $device_ids = implode(',',array_values($device_ids));
                $params['device_ids'] = $device_ids;

                //生成流水号
                $params['serial'] = $this->createSerial();



                if ($this->dataLimit && $this->dataLimitFieldAutoFill) {
                    $params[$this->dataLimitField] = $this->auth->id;
                }
                $result = false;
                Db::startTrans();
                try {
                    //是否采用模型验证
                    if ($this->modelValidate) {
                        $name     = str_replace("\\model\\", "\\validate\\", get_class($this->model));
                        $validate = is_bool($this->modelValidate) ? ($this->modelSceneValidate ? $name . '.add' : $name) : $this->modelValidate;
                        $this->model->validateFailException(true)->validate($validate);
                    }
                    $result = $this->model->allowField(true)->save($params);

                    Db::commit();
                    //查询 监控内容
                    if(!empty($mon_types)){
                        $mon_type_old = MonTypeModel::all($mon_types);

                        $mon_type = [];
                        foreach($mon_type_old as $mon_v){
                            $mon_type[$mon_v['id']] = $mon_v['mon_type_name'];
                        }

                        //监测内容 报警方案
                        $plans = $this->request->post('plans/a');


                        //监测内容添加
                        foreach ($types as $key =>$type){
                            $pro_mon_data = [
                                'engineering_id' => $engineering_id,
                                'project_id'     => $this->model->id,
                                'mon_type_id'    => $type,
                                'createtime'     => time(),
                                'mon_type_name'  => $mon_type[$type],
                                'plan_id' => $plans[$key],
                                'config_api_id' => $this->model->config_api_id,
                            ];
                            $res  = Db::name('project_mon_type')->insert($pro_mon_data);
                        }
                    }


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

        //项目类型 MonCategory
        $mon_category_old  = MonCategory::all();
        $mon_category_list = [
            0 => '请选择监测类型'
        ];
        foreach ($mon_category_old as $v) {
            $mon_category_list[$v['id']] = $v['mon_item_name'];
        }

         //collector 采集仪表   device_model 采集仪分类
        $deviceListOld = Db::name('collector')
            ->alias('c')
            ->join('device_model d','d.id = c.mod_id')
            ->field('c.id,c.dev_code,d.model,c.dev_name')
            ->select();

        //监测设备：后期改成和类型相关联的
        $deviceList = [];
        foreach ($deviceListOld as $val) {
            $deviceList[$val['id']] = $val['dev_name'] .' - '.$val['model'] .' - '. $val['dev_code'];
        }

        //场景值参数
        $config_api_array = Db::name('config_api')
        ->field('id,name')
        ->select();

        $config_api[0] = '未选择';
        foreach($config_api_array  as $k3 => $v3){
            $config_api[$v3['id']] =  $v3['name'];
        }


        $this->assign('mon_category_list', $mon_category_list);
        $this->assign('engineering_id', $engineering_id);
        $this->assign('deviceList', $deviceList);
        $this->assign('config_api', $config_api);
        return $this->view->fetch();
    }

    /**
     *  根据 监测类型  来选择 监测设备
     * @已废弃  由页面打开改为下拉多选
     * @param $engineering_id 项目id
     * @param $mon_category_id  监测类型id
     * @return mixed
     */
    public function get_devs()
    {
        $this->request->filter(['strip_tags', 'trim']);

        $engineering_id  = $this->request->get('engineering_id');
        $mon_category_id = $this->request->get('mon_category_id');

        //@time 2021-4-28 14：05 根据项目类型来 返回  设备列表  的关系还是不可知的，先返回所有的设备列表
        $adminIds  = $this->getDataLimitAdminIds();

        $collector = Db::name('collector')
            ->field('id,mod_id,dev_code')
//            ->where('admin_id', 'in', $adminIds)
            ->select();

        $this ->assign('controller',$collector);

        return $this ->view->fetch('devs');
    }


    //稍微有难点哦   页面的管理    还是多动手吧   这个样子的状态可不行
    //分类管理- 添加 - 图片    选择和上传
    //链接 - 选择链接   ==》 cms-cms管理-区块管理-链接


    /**
     * 根据 监测类型获取 监测内容
     * @params mon_category_id  监测类型id
     * @return mixed
     */
    public function getMonCategory()
    {
        $mon_category_id = $this->request->get('mon_category_id');
        $mon_type        = MonTypeModel::getMonTypeByCategoryId($mon_category_id);

        return json_encode($mon_type);
    }


    /**
     *  项目流水号生成
     *
     */
    public function createSerial()
    {
        list($usec, $sec) = explode(" ", microtime());
        $millisecond =  ((float)$usec + (float)$sec);

        $millisecond = str_pad($millisecond,3,'0',STR_PAD_RIGHT);
        $str = substr($millisecond,strpos($millisecond,'.')+1);

        return date("YmdH").$str;
    }

    /**
     *
     *添加员工 接口 ，已废弃
     */
    public function staff()
    {
        // 添加的员工  可以查看到这个项目
        //流程：创建项目时，将当前的admin_id  加入  项目员工表中 ；其他的使用这个方法添加
        $engineering_id = $this->request->get('engineering_id');

        if ($this->request->isPost()) {
            //参数:staff_id 员工id
            $params = $this->request->post("");

            //添加员工逻辑操作
            $staff_ids = explode(",", $params['staff_ids']);
            foreach($staff_ids as $staff_id) {
                $staff = StaffModel::get($staff_id);
                $data  = [
                    'engineering_id' => $params['engineering_id'],
                    'admin_id'       => $staff->admin_id,
                    'staff_id'       => $staff_id,
                    'createtime'     => time(),
                ];
                $res = Db::name('engineering_staff')->insert($data);
            }
            if($res){
                $this->win(200,'successful');
            }else{
                $this->error('add error');
            }

        }



        //查询监测机构的信息
        $engineering = EngineeringModel::get($engineering_id);
        $agency_id   = $engineering['monitor_id'];
        $staffs       = StaffModel::getStaffListByAgencyId($agency_id);
        $staff = [];
        foreach ($staffs as $v){
            $staff[$v['id']] = $v['staff_name'].' - '.$v['phone'].' - '.$v['email'];
        }

        $this ->assign('staff',$staff);
        $this ->assign('engineering_id',$engineering_id);
        return $this->fetch();
    }



    //项目  =》 项目 ==》监控内容  ==>测点
    //内容测点表 point  ：
        //监测内容id  测点编号  采集仪编号
         //  动态参数 ：警情设置   设备参数
        //赘余字段: 项目id  项目id
    /**
     * 编辑
     */
    public function edit($ids = null)
    {
        $row               = $this->model->get($ids);
        $row['device_ids'] = explode(',', $row['device_ids']);
        $row['frequency']  = (ConfigApi::get(['id' => $row->config_api_id]))->frequency;

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
            if ($params) {
                $params = $this->preExcludeFields($params);

                //厂商配置必须选择
                $config_api_id    = $params['config_api_id'];
                $oldConfig_api_id = $row->config_api_id;
                if ($config_api_id == 0) {
                    $this->error('请选择厂商配置');
                }
                //处理数据
                $types = $this->request->post('types/a');

                if (!empty($types)) {
                    $mon_types           = implode(',', array_values($types));
                    $params['mon_types'] = $mon_types;
                }

                //监测设备  （多选，ids）
                $device_ids           = $this->request->post('device_ids/a');
                $device_ids           = implode(',', array_values($device_ids));
                $params['device_ids'] = $device_ids;

                $result = false;
                Db::startTrans();
                try {
                    //是否采用模型验证
                    if ($this->modelValidate) {
                        $name     = str_replace("\\model\\", "\\validate\\", get_class($this->model));
                        $validate = is_bool($this->modelValidate) ? ($this->modelSceneValidate ? $name . '.edit' : $name) : $this->modelValidate;
                        $row->validateFailException(true)->validate($validate);
                    }

                    $value  = $row['frequency'];
                    $result = $row->allowField(true)->save($params);
                    Db::commit();


                    //修改拉取数据频率
                    //判断频率是否修改 修改则更新
                    if ($params['frequency'] != $value['frequency']) {

                        ConfigApi::update([
                            'frequency' => $params['frequency']
                        ], [
                            'id' => $row->config_api_id
                        ]);

                    }

                    //查询 监控内容
                    if (!empty($mon_types)) {
                        $mon_type_old = MonTypeModel::all($mon_types);

                        $mon_type = [];
                        foreach ($mon_type_old as $mon_v) {
                            $mon_type[$mon_v['id']] = $mon_v['mon_type_name'];
                        }


                        //监测内容 报警方案
                        $plans = $this->request->post('plans/a');
                        //监测内容添加
                        foreach ($types as $key => $type) {
                            //判断$plan[$key]
                            $plan_id = 0;
                            if (isset($plans[$key])) {
                                $plan_id = $plans[$key];
                            }
                            $pro_mon_data = [
                                'engineering_id' => $row->engineering_id,
                                'project_id'     => $row->id,
                                'mon_type_id'    => $type,
                                'createtime'     => time(),
                                'mon_type_name'  => $mon_type[$type],
                                'plan_id'        => $plan_id,////7.6 这里报了个bug  未定义的key
                                'config_api_id'  => $config_api_id
                            ];
                            $res          = Db::name('project_mon_type')->insert($pro_mon_data);
                        }
                    }

                    //如果厂商配置发生改变的话， 项目检测config_api_id 也发生改变
                    if ($oldConfig_api_id != $config_api_id && $config_api_id != 0) {
                        $res2 = Db::name('project_mon_type')
                            ->where('project_id', $row->id)
                            ->update(['config_api_id' => $config_api_id]);
                    }
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
        $this->view->assign("row", $row);

        //项目类型 MonCategory
        $mon_category_old  = MonCategory::all();
        $mon_category_list = [];
        foreach ($mon_category_old as $v) {
            $mon_category_list[$v['id']] = $v['mon_item_name'];
        }

        $deviceListOld = Db::name('collector')
            ->alias('c')
            ->join('device_model d', 'd.id = c.mod_id')
            ->field('c.id,c.dev_code,c.dev_name,d.model')
            ->select();

        //监测设备：后期改成和类型相关联的
        $deviceList = [];
        foreach ($deviceListOld as $val) {
            $deviceList[$val['id']] = $val['model'] . '-' . $val['dev_name'] . ' - ' . $val['dev_code'];
        }

        //场景值参数
        $config_api_array = Db::name('config_api')
            ->field('id,name')
            ->select();

        $config_api[0] = '未选择';
        foreach ($config_api_array as $k3 => $v3) {
            $config_api[$v3['id']] = $v3['name'];
        }

        $this->assign('mon_category_list', $mon_category_list);
        $this->assign('deviceList', $deviceList);
        $this->assign('config_api', $config_api);

        return $this->view->fetch();
    }

    /**
     * 删除
     */
    public function del($ids = "")
    {
        if (!$this->request->isPost()) {
            $this->error(__("Invalid parameters"));
        }
        $ids = $ids ? $ids : $this->request->post("ids");
        if ($ids) {
            $pk = $this->model->getPk();
            $adminIds = $this->getDataLimitAdminIds();
            if (is_array($adminIds)) {
                $this->model->where($this->dataLimitField, 'in', $adminIds);
            }
            $list = $this->model->where($pk, 'in', $ids)->select();

            $this->delExceptionAlarm($ids); //删除该项目下的告警管理
            $this->delExceptionAlarmLog(); //删除该项目下的告警管理
            $this->delProjectMonType($ids); //删除该项目下 相关联的监测内容
            $this->delPoint($ids); //删除该项目下 相关联的测点信息 7-27
            $this->delData(); //删除该项目下 相关联的测点信息 7-27



            $count = 0;
            Db::startTrans();
            try {
                foreach ($list as $k => $v) {
                    $count += $v->delete();
                }
                Db::commit();
            } catch (PDOException $e) {
                Db::rollback();
                $this->error($e->getMessage());
            } catch (Exception $e) {
                Db::rollback();
                $this->error($e->getMessage());
            }
            if ($count) {
                $this->success();
            } else {
                $this->error(__('No rows were deleted'));
            }
        }
        $this->error(__('Parameter %s can not be empty', 'ids'));
    }


    /**
     * 根据厂商获取拉取数据频率
     *
     * @return \think\response\Json
     * @throws \think\exception\DbException
     */
    public function getConfigFrequency()
    {
        $config_id = $this->request->get("config_id");
        $frequency = (ConfigApi::get(['id'=>$config_id]))->frequency;
        return json(['code' => 1, 'data' => $frequency]);
    }



    /**
     *  以项目id 查询监测内容
     * @param $project_id 项目id
     * @return mixed
     */
    public function getMonTypeByProjectId()
    {
        $project_id = $this->request->get("project_id");

        $mon_type = MonTypeModel::getMonTypeByProjectId($project_id);

        return json(['code' => 1 ,'data' => $mon_type]);
    }


    /**
     * 根据 监测内容 获取报警方案
     * @params $mon_type  监测内容id
     * @params $engineering_id  项目id
     *
     */
    public function get_plans()
    {
        $mon_type = $this->request->get('mon_type');
        $engineering_id = $this->request->get('engineering_id');

        //获取同家公司的报警方案
        $this->request->filter(['strip_tags', 'trim']);
        if ($this->request->isAjax()) {
            //查找同一机构下的设备id  先查询所有
            $plan = Db::name('plan')
            ->where('mon_type_id',$mon_type)
//            ->where()
                ->select();
            $result = array("total" => count($plan), "rows" => $plan);

            return json($result);
        }
        $this->assign('mon_type',$mon_type);
        return $this->view->fetch();
    }



    /**
     * 删除项目下的报警管理
     *
     */
    public function delExceptionAlarm($project_ids)
    {
        $alarm = Db::name('exception_alarm')
            ->field('id,project_id')
            ->where('project_id','in',$project_ids)
            ->select();

        $alarm_ids = [];
        foreach ($alarm as $v){
            $alarm_ids[] = $v['id'];
        }
        $this->alarm_ids = $alarm_ids;

        $res = Db::name('exception_alarm')
            ->where('project_id','in',$project_ids)
            ->delete();

        return $res;
    }

    /**
     * 删除项目下的报警管理记录
     *
     */
    public function delExceptionAlarmLog()
    {
        $res = Db::name('exception_alarm_log')
            ->where('exception_alarm_id','in',$this->alarm_ids)
            ->delete();

        $this->alarm_ids = [];
        return $res;
    }

    /**
     * 删除项目下相关联的监测内容
     *
     */
    public function delProjectMonType($project_ids)
    {
        $res = Db::name('project_mon_type')
            ->where('project_id','in',$project_ids)
            ->delete();

        return $res;
    }

    /**
     * 删除项目下相关联的测点
     *
     */
    public function delPoint($project_ids)
    {
        $point = Db::name('point')
            ->field('id')
            ->where('project_id','in',$project_ids)
            ->select();

        $point_ids = [];
        foreach ($point as $v){
            $point_ids[] = $v['id'];
        }
        $this->point_ids = $point_ids;

        $res = Db::name('point')
            ->where('project_id','in',$project_ids)
            ->delete();

        return $res;
    }

    /**
     * 删除项目下相关联的数据
     *
     */
    public function delData()
    {
        $res = Db::name('data')
            ->where('point_id','in',$this->point_ids)
            ->delete();

        $this->point_ids = [];
        return $res;
    }












}
