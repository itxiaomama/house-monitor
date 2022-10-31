<?php

namespace app\admin\controller\engineering;

use app\admin\model\AlarmNotice;
use app\admin\model\House;
use app\api\model\ConfigApi as ConfigApiModel;
use app\common\controller\Backend;
use app\console\common\CommandProcess;
use Exception;
use think\Db;
use think\exception\PDOException;
use think\exception\ValidateException;
use app\admin\model\Project as ProjectModel;
use app\admin\model\Engineering as EngineeringModel;
use app\admin\model\Staff as StaffModel;
use app\admin\model\Sensor as SensorModel;
use app\admin\model\engineering\ProjectMonType as ProjectMonTypeModel;
use app\admin\model\ExceptionAlarm as ExceptionAlarmModel;


/**
 * 工程管理
 *
 * @icon fa fa-circle-o
 */
class Engineering extends Backend
{

    /**
     * Engineering模型对象
     * @var \app\admin\model\Engineering
     */
    protected $model = null;

    //数据权限
//    protected $dataLimit = 'auth'; //表示显示当前自己和所有子级管理员的所有数据
//    protected $dataLimitField = 'admin_id'; //数据关联字段,当前控制器对应的模型表中必须存在该字段

    protected $noNeedRight = ['getAgency', 'getStaffByAgencyId', 'device_census', 'type_census', 'alarm_census', 'map', 'getLalByIdS','projectDistributed']; //无需鉴权的方法,但需要登录

    protected $engineering = [0=>'安全监测',1=>'人工巡检'];


    public function _initialize()
    {
        parent::_initialize();
        $this->model = new \app\admin\model\Engineering;

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
     * 显示需求:参与的人员才能显示项目
     * 完成:查询出所有的工程列表   筛选出本账号参与了的
     */
    public function index()
    {

//
//        $configs = ConfigApiModel::all();
//        foreach ($configs as $config)
//        {
//            $msg = CommandProcess::syncSensorCloud($config);
//
//        }
//        echo rand();
//exit();
//        $arr = [
//            'createtime'          => '1655436102',
//            'point_id'            => '66',
//            'project_mon_type_id' => '84',
//            'dev_type'            => 9,
//            'data'                => 1,
//            'mon_type'            => 123,
//            'point_name'          => 'CJ-03',
//            'dev_id'              => 8,
//            'record_time'         => '2022-06-17 11:21:42',
//            'upload_code'         => 33,
//            'is_test'             => 1,
//            'data1'               => 623.55,
//            'data2'               => 26.91,
//            'data1_total'         => 4.01,
//            'data1_this'          => 0.08,
//            'data1_rate'          => 623.55,
//            'updatetime'          => 1655436105,
//            'id'                  => 579359,
//        ];

//        $arr = [
//            'data1'               => -2.1,
//            'data1_rate'          => '1号沉降液位高',
//            'data1_total'         => 3999137,
//            'record_time'         => '2022-10-10 00:47:10',
//            'dev_id'              => 9,
//            'point_id'            => 108,
//            'dev_type'            => 14,
//            'mon_type'            => 129,
//            'point_name'          => '1号沉降计',
//            'project_mon_type_id' => 121,
//            'createtime'          => 1665388733,
//            'id'                  => 703,
//        ];
//
//
//
//        $a = new \app\admin\model\Data();
//        $a->compare($arr,$arr['id']);
//        exit;

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

            $engineering_staff_ids = $this->authMethod();
            $isSuperAdmin = $this->auth->isSuperAdmin();
            $field        = ['id','name','city','createtime','address','plan_file_file','item_map_image','monitor_id','monitor_staff_id','project_type'];


            if(!$isSuperAdmin){
                $list = $this->model
                    ->field($field)
                    ->where($where)
                    ->where('id', 'in', $engineering_staff_ids)
                    ->order($sort, $order)
                    ->paginate($limit);

            }else{
                $list = $this->model
                    ->field($field)
                    ->where($where)
                    ->order($sort, $order)
                    ->paginate($limit);
            }



            $agency     = Db::name('agency')->where(['id'=>['in',array_column($list->toArray()['data'],'monitor_id')]])->select();

            $agency_new = isset($agency) ? array_column($agency,'agency_name','id') : [];

            $staff      = Db::name('staff')->where(['id'=>['in',array_column($list->toArray()['data'],'monitor_staff_id')]])->select();

            $staff_new  = isset($staff) ? array_column($staff,'staff_name','id') : [];


            foreach ($list->toArray()['data'] as $key => $value){
                $list->items()[$key]['agency_name']       = isset($agency_new) ? $agency_new[$value['monitor_id']]      : '';
                $list->items()[$key]['staff_name']        = isset($staff_new)  ? $staff_new[$value['monitor_staff_id']] : '';
                $list->items()[$key]['project_type_name'] = '';

                if(isset($value['project_type'])){
                    if(strstr($value['project_type'],',')){

                        foreach (explode(',',$value['project_type']) as $v){

                            $list->items()[$key]['project_type_name'] .= $this->engineering[$v].',';
                        }
                        $list->items()[$key]['project_type_name'] = rtrim($list->items()[$key]['project_type_name'],',');
                    }else{
                        $list->items()[$key]['project_type_name'] = $this->engineering[$value['project_type']];
                    }
                }
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
                        $name     = str_replace("\\model\\", "\\validate\\", get_class($this->model));
                        $validate = is_bool($this->modelValidate) ? ($this->modelSceneValidate ? $name . '.add' : $name) : $this->modelValidate;
                        $this->model->validateFailException(true)->validate($validate);
                    }
                    $result = $this->model->allowField(true)->save($params);
                    //修复二级权限不能查看本人添加数据的问题
                    $isSuperAdmin = $this->auth->isSuperAdmin();
                    if (!$isSuperAdmin) {
                        //通过admin_id  查询员工id
                        $admin_id = $this->auth->id;
                        $staff    = StaffModel::get(['admin_id' => $admin_id]);
                        $staff_id = $staff->id;

                        $staffParam = [
                            'engineering_id' => $this->model->id,
                            'staff_id'       => $staff_id,
                            'admin_id'       => $admin_id,
                            'createtime'     => time(),
                            'adminid'        => $admin_id
                        ];
                        $res        = Db::name('engineering_staff')
                            ->insert($staffParam);
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

//        //查询机构数据   自己和子类添加的机构数据
//        $agencyArray = Db::name('agency')
//            ->where('admin_id', 'in', $this->auth->getChildrenAdminIds(true))
//            ->select();
//
//        $agencyList = [];
//        foreach ($agencyArray as $k => $v) {
//            $agencyList[$v['id']] = $v['agency_name'];
//        }
//

        $this->assign('engineering', $this->engineering);

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
            if ($params) {
                $params = $this->preExcludeFields($params);
                $result = false;
                Db::startTrans();
                try {
                    //是否采用模型验证
                    if ($this->modelValidate) {
                        $name     = str_replace("\\model\\", "\\validate\\", get_class($this->model));
                        $validate = is_bool($this->modelValidate) ? ($this->modelSceneValidate ? $name . '.edit' : $name) : $this->modelValidate;
                        $row->validateFailException(true)->validate($validate);
                    }
                    $result = $row->allowField(true)->save($params);
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

        //对经纬度进行操作
        if ($row['lal']){
            $r = array();
            $lal_array = json_decode($row['lal'],true);
            if (is_array($lal_array)){
                foreach ($lal_array as $lal) {
                    if ($lal) {
                        $r[] = array($lal['lng'],$lal['lat']);
                    }
                }
                $row['lal'] = json_encode($r);
            }
        }

        $this->assign('engineering', $this->engineering);
        $this->view->assign("row", $row);
        return $this->view->fetch();
    }

    /**
     *  工程详情  - 项目列表 - 获取经纬度
     */
    public function getLalByIdS(House $house)
    {

        try {
            $type     = $this->request->param('type', 1); // 1工程id  2房屋id
            $ids      = $this->request->param('ids');
            $location = [];

            if($type ==1 ){
                $row = $this->model->get($ids);

                if (!$row) {
                    throw new Exception('No Results were found');
                }

                if(!empty(json_decode($row['lal'],true))){
                    foreach (json_decode($row['lal'],true) as $lal) {
                        if ($lal) {
                            $location[] = array($lal['lng'],$lal['lat']);
                        }
                    }
                }


            }else{
                $row = $house::get($ids);

                if (!$row) {
                    throw new Exception('No Results were found');
                }

                $location = [$row->lng,$row->lat];
            }

            //对经纬度进行操作

            $arr=[
                'status'  => 1,
                'message' => 'success',
                'data'    => $location
            ];
        }catch (Exception $exception){
            $arr=[
                'status'  => 0,
                'message' => $exception->getMessage(),
                'data'    => []
            ];
        }

        return json($arr);exit;
    }

    /**
     *  工程详情  - 项目列表
     *  使用自定义的页面
     * @param $ids  integer 工程id
     * @return mixed
     */
    public function detail($ids = null)
    {
        //项目数据
        $engineering_id = $ids;

        $keyword     = $this->request->get("keyword");
        $projectList = ProjectModel::getProjectByEngId($engineering_id, $keyword);

        //工程信息
        $engineeringInfo = EngineeringModel::getEngineeringInfo($engineering_id);
        if (empty($engineeringInfo)) {
            $this->error('该工程信息已被删除');
        }
        //负责人信息
        $staff      = StaffModel::get($engineeringInfo['monitor_staff_id']);
        $staff_name = "";
        if ($staff) {
            $staff_name = $staff->staff_name;
        }
        //布点图
        $this->assignconfig('item_map_image', $engineeringInfo['item_map_image']);


        $this->assign('keyword', $keyword);
        $this->assign('projectList', $projectList);
        $this->assign('engineering_id', $engineering_id);
        $this->assign('engineeringInfo', $engineeringInfo);
        $this->assign('staff_name', $staff_name);

        return $this->view->fetch();
    }

    /**
     * 下拉选择
     * @param   $agency_id   机构id
     * @return  mixed
     * @待优化的点：根据机构的类型id来查询机构
     */
    public function getAgency()
    {
        //type:4=监测机构，12=安监机构,1=监理机构,2=建筑单位,3=施工单位
        $type     = $this->request->get("type");
        $keyValue = $this->request->post("keyValue");
        $keyField = $this->request->post("keyField");
        $where    = [];
        if (!empty($keyValue)) {
            $where[$keyField] = $keyValue;
        }

        $isSuperAdmin = $this->auth->isSuperAdmin();
        if ($isSuperAdmin) {
            //一级管理员: 可以选择所有数据 查询机构数据   自己和子类添加的机构数据吧
            $agencyArray = Db::name('agency')
                ->where('admin_id', 'in', $this->auth->getChildrenAdminIds(true))
                ->where('agency_category_id', $type)
                ->where($where)
                ->select();
        } else {
            //需求:2级管理员的话    只显示自己所属的机构

            if ($type == 4) {
                //所属的机构下管理员所添加的数据
                $affiliation = StaffModel::getAffiliation($this->auth->getChildrenAdminIds(true));
                $agency_ids  = [];
                if (!empty($affiliation)) {
                    foreach ($affiliation as $k => $v) {
                        $agency_ids[] = $v['agency_id'];
                    }
                }
                $agencyArray = Db::name('agency')
                    ->where('id', 'in', $agency_ids)
                    ->where('agency_category_id', $type)
                    ->select();
            } else {
                //需求:2级管理员的话    只显示自己所属的机构
//               7-16 ：出现的问题  二级管理员 监测机构可以显示自己所属的机构，但是其他的机构查询不到信息
                $staff    = StaffModel::get(['admin_id' => $this->auth->id]);
                $staffNew = StaffModel::all(['agency_id' => $staff->agency_id]);

                $admin_ids = [];
                if (!empty($staffNew)) {
                    foreach ($staffNew as $k => $v) {
                        $admin_ids[] = $v['admin_id'];
                    }
                }
                $agencyArray = Db::name('agency')
                    ->where('admin_id', 'in', $admin_ids)
                    ->where('agency_category_id', $type)
                    ->where($where)
                    ->select();
            }

        }


//       自己和子类添加的机构信息

        $data = [
            'list'  => $agencyArray,
            'total' => count($agencyArray)
        ];
        return $data;
    }

    /**
     * 根据机构id获取  员工
     * @params  agency_id 机构id
     * @return mixed
     */
    public function getStaffByAgencyId()
    {
        $agency_id = $this->request->post('monitor_id');
        $staffList = Db::name('staff')
            ->where('agency_id', $agency_id)
            ->select();
        $data      = [
            'list'  => $staffList,
            'total' => count($staffList)
        ];
        return $data;
    }


    /**
     * 使用设备统计信息
     *  传感器的使用统计
     * @param engineering_id int 工程id
     * @return mixed
     */
    public function device_census()
    {
        $engineering_id = $this->request->post('engineering_id');

        $sensorModel = new SensorModel();
        $list        = $sensorModel->getDeviceCensus($engineering_id);
//        halt($list);
        $series = $xAxis = [];
        foreach ($list as $k => $v) {
            $series[] = $v['count'];
            $xAxis[]  = $v['name'];
        }


        $data = [
            'code'   => 1,
            'series' => $series,
            'xAxis'  => $xAxis
        ];
        return json($data);

    }

    /**
     *
     * 检测内容
     */
    public function type_census()
    {
        $engineering_id = $this->request->post('engineering_id');
        $model          = new ProjectMonTypeModel();
        $list           = $model->getTypeCensus($engineering_id);

        $series = $xAxis = [];
        foreach ($list as $k => $v) {
            $series[] = $v;
            $xAxis[]  = $k;
        }

        $data = [
            'code'   => 1,
            'series' => $series,
            'xAxis'  => $xAxis
        ];
        return json($data);
    }

    /**
     *
     * 报警记录 统计信息
     */
    public function alarm_census()
    {
        $engineering_id = $this->request->post('engineering_id');

        $model  = new ExceptionAlarmModel();
        $list   = $model->getAlarmCensus($engineering_id);
        $series = $xAxis = [];
        foreach ($list as $k => $v) {
            $series[] = $v->num;
            $xAxis[]  = $v->time;
        }

        $data = [
            'code'   => 1,
            'series' => $series,
            'xAxis'  => $xAxis
        ];
        return json($data);
    }


    /**
     * 项目完工
     * $ids 项目id
     */
    public function end($ids)
    {
        //1.改变项目的状态,项目列表查询不到
        $project             = ProjectModel::get($ids);
        $project->status     = 1;
        $project->updatetime = time();
        $res                 = $project->save();

        //2.不在监听相关设备的数据


        if ($res) {
            return $this->success();
        }
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
            $pk       = $this->model->getPk();
            $adminIds = $this->getDataLimitAdminIds();
            if (is_array($adminIds)) {
                $this->model->where($this->dataLimitField, 'in', $adminIds);
            }
            $list = $this->model->where($pk, 'in', $ids)->select();

            $this->delProject($ids); //删除该工程下的项目
            $this->delEngineeringStaff($ids); //删除该工程下的参与人员
            $this->delAlarmNotice($ids); //删除该工程下的告警通知
            $this->delExceptionAlarm($ids); //删除该工程下的告警管理
            $this->delExceptionAlarmLog($ids); //删除该工程下的告警管理
            $this->delProjectMonType($ids); //删除该工程下 相关联的监测内容
            $this->delPoint($ids); //删除该工程下 相关联的测点信息 7-27

            $this->delProjectByEngine(); //删除所属工程不存在的项目

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
     *  删除工程下的项目
     *
     */
    public function delProject($engineering_ids)
    {
        $res = Db::name('project')
            ->where('engineering_id', 'in', $engineering_ids)
            ->delete();

        return $res;
    }

    /**
     * 删除工程下的参与数据
     *
     */
    public function delEngineeringStaff($engineering_ids)
    {
        $res = Db::name('engineering_staff')
            ->where('engineering_id', 'in', $engineering_ids)
            ->delete();

        return $res;
    }

    /**
     * 删除工程下的告警通知
     *
     */
    public function delAlarmNotice($engineering_ids)
    {
        $res = Db::name('alarm_notice')
            ->where('engineering_id', 'in', $engineering_ids)
            ->delete();

        return $res;
    }

    /**
     * 删除工程下的报警管理
     *
     */
    public function delExceptionAlarm($engineering_ids)
    {
        $res = Db::name('exception_alarm')
            ->where('engineering_id', 'in', $engineering_ids)
            ->delete();

        return $res;
    }

    /**
     * 删除工程下的报警管理记录
     *
     */
    public function delExceptionAlarmLog($engineering_ids)
    {
        $res = Db::name('exception_alarm_log')
            ->where('engineering_id', 'in', $engineering_ids)
            ->delete();

        return $res;
    }

    /**
     * 删除工程下相关联的监测内容
     *
     */
    public function delProjectMonType($engineering_ids)
    {
        $res = Db::name('project_mon_type')
            ->where('engineering_id', 'in', $engineering_ids)
            ->delete();

        return $res;
    }

    /**
     * 删除工程下相关联的测点
     *
     */
    public function delPoint($engineering_ids)
    {
        $res = Db::name('point')
            ->where('engineering_id', 'in', $engineering_ids)
            ->delete();

        return $res;
    }


    /**
     * 清除没有所属工程的项目
     */
    public function delProjectByEngine()
    {
        $adminIds = $this->auth->getChildrenAdminIds(true);

        $engineering_staff = Db::name('engineering_staff')
            ->field('id,engineering_id')
            ->where('adminid', 'in', $adminIds)
            ->select();


        $engineering_ids = [];
        foreach ($engineering_staff as $v) {
            $engineering_ids[] = $v['engineering_id'];
        }


        $engineering = Db::name('engineering')
            ->where('id', 'in', $engineering_ids)
            ->select();

        $engineeringIds = array_select($engineering, 'name');

        $list = Db::name('project')
            ->where('engineering_id', 'in', $engineering_ids)
            ->select();

        foreach ($list as $k => $v) {
            if (!isset($engineeringIds[$v['engineering_id']])) {
                $res = Db::name('project')
                    ->where('engineering_id', $v['engineering_id'])
                    ->delete();
            }
        }
    }

    public function projectDistributed(){
        try {

            $engineering_id = $this->request->param('engineering_id');

            if(!$engineering_id){
                throw new Exception('缺失参数');
            }

            $project = Db::name('project')
                ->alias('p')
                ->join('jc_mon_category' , 'p.mon_category_id = jc_mon_category.id')
                ->where(['engineering_id'=>$engineering_id])
                ->field('p.item_name,mon_item_name,status')
                ->select();

            $count = count($project);

            $arr = [
                'code'    => 200,
                'message' => 'success',
                'data'    => [
                    'project' => $project,
                    'count'   => $count
                ]
            ];
        }catch (Exception $exception){
            $arr = [
                'code'    => 0,
                'message' => $exception->getMessage(),
                'data'    => []
            ];
        }

       return json($arr);
    }


}
