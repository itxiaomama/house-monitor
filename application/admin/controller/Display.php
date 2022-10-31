<?php

namespace app\admin\controller;

use app\admin\model\House;
use app\admin\model\Inspection;
use app\admin\model\MonType as MonTypeModel;
use app\admin\model\Scene;
use app\api\model\ConfigApi as ConfigApiModel;
use app\common\controller\Backend;
use app\console\common\CommandProcess;
use think\Db;
use app\admin\model\Engineering as EngineeringModel;
use app\admin\model\Agency as AgencyModel;
use app\admin\model\Project as ProjectModel;
use think\Exception;



/**
 *
 *
 * @icon fa fa-circle-o
 */
class Display extends Backend
{

    /**
     * Display模型对象
     * @var \app\admin\model\Display
     */
    protected $model = null;

    //需要登录，不需要授权的方法
    protected $noNeedRight = ['getEngineTypeList','getSensor','getProjectTotal','getEngineCity','board','getLevel','getModel','getStatus','getEngineerInfo'];

    protected $url = 'monitor.cngiantech.com';

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new \app\admin\model\Display;

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
     * 查看 @已弃用
     */
    public function index()
    {
        $this->redirect('board/index');
        //设置过滤方法
        $this->request->filter(['strip_tags', 'trim']);
        if ($this->request->isAjax()) {
            // 监测类型 及其 数量
//            $engineering_type = $this-> getEngineType();
            //设备统计
            $sensor =  $this->getSensor();
            //地理位置
            //报警统计
            $alarm = $this->getAlarm();
            //项目统计
            $project = $this->getProjectTotal();

            $data = [
                'code'   => 1,
                'sensor' => $sensor,
                'alarm'  => $alarm,
                'project' => $project,
            ];

            return json($data);
        }

        //总工程数
        $configs = ConfigApiModel::all();

        $totalData = 0;
        foreach ($configs as $key => $config)
        {
            $totalData += Db::name('data_'.$config->mark)->count();
        }
        $totalDataLen = strlen($totalData);

        $tmp = "";
        for ($x=0; $x<=9-$totalDataLen; $x++) {
            $tmp .= 0;
        }
        $totalData = $tmp.$totalData;

        $this->assign('totalData',$totalData);
        $this->assign('totalDataLen',strlen($totalData));
        return $this->view->fetch();
    }

    /**
     * 获取监测类型
     *
     */
    public function getEngineTypeList(){
        $engineering_type = $this-> getEngineType();
        $alarm = $this->getAlarm();


        $data = [
            'code' => 1,
            'type' =>$engineering_type,
            'alarm' =>$alarm,
        ];

        return json($data);
    }






    /**
     * 获取监控类型数据
     */
    public function getEngineType()
    {
        $engineering_type = Db::name('mon_category')->select();
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

        foreach ($engineering_type as $k=> $v)
        {
            $engineering_type[$k]['count'] = Db::name('project')
                ->where('engineering_id','in',$engineering_ids)  //属于这个账号的数据
                ->where('mon_category_id',$v['id'])
                ->count();
        }
        return $engineering_type;
    }


    /**
     * 获取设备统计
     *
     */
    public function getSensor()
    {
        //数据权限:查询所涉及的传感器  当前用户参与的工程  工程所用到的传感器
        $sensor = Db::name('sensor')->select();

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

        $series = $yAxis = [];
        $count = 0;
        foreach ($sensor as $k=> $v)
        {
            $seriesNum = Db::name('point')
                ->where('sensor_id',$v['id'])
                ->where('engineering_id','in',$engineering_ids)  //属于这个账号的数据
                ->count();

            $yAxis[] = $v['name'];
            $series[] = $seriesNum;
            $count += $seriesNum;
        }





        $sensorData = [
            'yAxis'  => $yAxis,
            'series' => $series,
            'count'  => $count
        ];

        return json($sensorData);
    }

    /**
     * 获取报警统计数据
     *
     */
    public function getAlarm()
    {
        //数据权限   有权限的测点   包含该测点的告警信息
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

        $alarmLog  = Db::name('exception_alarm_log')
            ->field('id,point_code,record_time,alarm_status,point_id,exception_alarm_id,content,engineering_id')
            ->where('engineering_id','in',$engineering_ids)
            ->order('id', 'desc')
            ->limit(100)
            ->select();

        //项目名称
        $point_ids = [];
        foreach ($alarmLog as $v)
        {
            $point_ids[] = $v['point_id']; //重复id的一个问题
        }

        $pointOld  = Db::name('point')
            ->field('id,point_code,project_id')
            ->where('id','in',$point_ids)
            ->select();

        $point = array_select($pointOld,'point_code');
        $point_project = array_select($pointOld,'project_id');


        //项目名称
        $project_ids = [];
        foreach ($pointOld as $k=>$v)
        {
            $project_ids[]  = $v['project_id'];
        }

        $project = Db::name('project')
            ->field('id,item_name')
            ->where('id','in',$project_ids)
            ->select();
        $project = array_select($project,'item_name');

        //地址
        $engineering = Db::name('engineering')
            ->field('id,city,address')
            ->where('id','in',$engineering_ids)
            ->select();
        $engineeringTmp = [];
        foreach ($engineering as $k2=>$v2)
        {
            $engineeringTmp[$v2['id']]  = $v2['city']. '  '. $v2['address'];
        }

        $alarmStatus = [ 0=>'正常',1=>'预警',2=>'报警',3=>'控制'];
        foreach ($alarmLog as $k=>$v)
        {
            $point_code = "";
            if(isset($point[$v['point_id']])){
                $point_code = $point[$v['point_id']];
            }
            $alarmLog[$k]['point_code']  = $point_code;

            $item_name = "";
            if(isset($point_project[$v['point_id']])){
                $item_name = $project[$point_project[$v['point_id']]];
            }

            $alarmLog[$k]['item_name']   = $item_name;
            $alarmLog[$k]['record_time'] = date('Y-m-d H:i:s',$v['record_time']);
            $alarmLog[$k]['alarm_status_name'] = $alarmStatus[$v['alarm_status']];
            $alarmLog[$k]['address'] = $engineeringTmp[$v['engineering_id']];
        }


        //报警总数
        $alarmCount  = Db::name('exception_alarm')
            ->where('engineering_id','in',$engineering_ids)
            ->count();

        $data = [
            'data' => $alarmLog,
            'count' => $alarmCount
        ];

        return $data;
    }

    /**
     * 项目运行统计
     *  需要的数据  本年累计，本月份累计，已完工的项目数量，进行中的项目数量
     *
     */
    public function getProjectTotal()
    {
        //数据权限   有权限的工程 ==> 项目
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


        //完工和进行中的数量
        $ing = Db::name('project')
            ->where('engineering_id','in',$engineering_ids)  //属于这个账号的数据
            ->where('status',0)
            ->count();

        $end = Db::name('project')
            ->where('engineering_id','in',$engineering_ids)  //属于这个账号的数据
            ->where('status',1)
            ->count();

        //本年累计，本月份累计
        $year = Db::name('project')
            ->where('engineering_id','in',$engineering_ids)  //属于这个账号的数据
            ->whereTime('createtime','y')
            ->count();
        $month = Db::name('project')
            ->where('engineering_id','in',$engineering_ids)  //属于这个账号的数据
            ->whereTime('createtime','m')
            ->count();


        $data = [
            'ing'   => $ing,
            'end'   => $end,
            'year'  => $year,
            'month' => $month,
        ];

        return json($data);
    }

    /**
     *  获取工程的城市信息
     *
     */
    public function getEngineCity()
    {
        //数据权限   有权限的工程 ==> 项目
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

        //需要的信息：城市，经纬度，工程名称，监测机构，告警状态==》从项目中获取吧
        $engineering = EngineeringModel::all($engineering_ids);

        $monitor_id = [];
        foreach ($engineering as $k => $v){
            $monitor_id[]= $v['monitor_id'];
        }

        $agency = AgencyModel::all($monitor_id);
        $agency = array_select($agency,'agency_name');

        $row = [];
//        $map = [];
        foreach ($engineering as $k => $v){
            $row[$k]['unit'] = $agency[$v['monitor_id']];
            $row[$k]['username'] = $v['name'];
            $row[$k]['lat'] = (float)$v['lat'];
            $row[$k]['lng'] = (float)$v['lng'];
            $row[$k]['id'] = $v['id'];

//            $city = explode("/", $v['city']);
//            $row[$k]['name'] = $city[1];
            $row[$k]['name'] = $v['address'];

            $lngLat = "";
//            if(!empty($v['lng']))
//            {
////                $lngLat = "[".$v['lng'] .','.$v['lat']."]";
//                $lngLat = [(float)$v['lng'],(float)$v['lat']];
//            }

//            $map[] = [
//                $v['address'] => $lngLat
//            ];

            $state = $this->getAlarmStatus($v['id']);
            $row[$k]['state'] = $state;
            if($state == 2){
                $row[$k]['state_name'] = '告警';
            }elseif($state == 1){
                $row[$k]['state_name'] = '预警';
            }elseif($state == 3){
                $row[$k]['state_name'] = '控制';
            }else{
                $row[$k]['state_name'] = '正常';
            }
        }


        $data = [
            'code' => 1,
            'data'   => $row,
//            'map'   => $map,
        ];

        return json($data);

    }

    /**
     * 以工程id 获取工程的告警状态
     * @params  $engineering_id int 工程id
     * @return mixed
     */
    public function getAlarmStatus($engineering_id)
    {
        $project = ProjectModel::all(['engineering_id'=>$engineering_id]);
        $error = 0;
        $warn = 0;
        $control = 0;
        foreach ($project as $k => $v){
            if($v['alarm_state'] == 2){
                $error = 1;
            }
            if($v['alarm_state'] == 1){
                $warn = 1;
            }
            if($v['alarm_state'] == 3){
                $control = 1;
            }
        }
        if($error == 1){
            return 2;
        }

        if($warn == 1){
            return 1;
        }
        if($warn == 1){
            return 3;
        }
        return 0;
    }

    /**
     *
     *   以城市地址（浙江省/杭州市/萧山区） 获取项目名称 测点信息
     *  获取工程-项目-测点 三级关系
     * @param $city 城市名称
     *
     */
    public function getLevel()
    {
        $city = $this->request->param("city");
        //数据权限   有权限的工程 ==> 项目
        $adminIds = $this->auth->getChildrenAdminIds(true);
        $engineering_staff = Db::name('engineering_staff')
            ->field('id,engineering_id')
            ->where('adminid','in',$adminIds)
            ->select();

        $engineering_ids =array_column($engineering_staff,'engineering_id');

        $engineering =  Db::name('engineering')
            ->field('id,name,city,address,lng,lat')
            ->where('id','in',$engineering_ids)
            ->where('city',$city)
            ->select();

        $engineering_ids =array_column($engineering,'id');

        $project = Db::name('project')
            ->field('id,item_name')
            ->where('engineering_id','in',$engineering_ids)
            ->select();

        foreach ($project as $k=>$v){
            $point = Db::name('point')
                ->field('id,point_code,sensor_name,lng,lat,project_mon_type_id as item_id,mon_type_id')
                ->where('project_id',$v['id'])
                ->select();

            //监测内容参数的默认值
            foreach ($point as $k1 => $v1){
                $modelsData = $this->getAlarmSet($v1['mon_type_id']);
                $modelsDataKey = array_keys($modelsData)[0];

                $point[$k1]['model'] = $modelsDataKey;
            }


            $project[$k]['point'] = $point;
        }


        return json($project);
    }

    //以测点id 获取参数
    public function getModel()
    {
        $mon_type_id = $this->request->get('mon_type_id');
        $modelsData  = $this->getAlarmSet($mon_type_id);

        $data = [
          'code' => 200,
          'data' => $modelsData,
        ];

        return json($data);
    }


    /**
     * 根据 监测内容id 获取 告警内容
     * @param integer $mon_type_id
     * @return mixed
     */
    public function getAlarmSet($mon_type_id)
    {
        $mon_type = MonTypeModel::get($mon_type_id);
        if(empty($mon_type))
        {
            return [];
        }
        $mon_type = $mon_type->toArray();
        //剔除空的数组
        foreach($mon_type as $k=>$v){
            if(empty($v)){
                unset($mon_type[$k]);
            }
        }

        unset($mon_type['id']);
        unset($mon_type['mon_type_name']);
        unset($mon_type['status']);
        unset($mon_type['param1']);
        unset($mon_type['param2']);

        return $mon_type;
    }



    /*
     * 数据看板地图信息（工程 项目 设备 数量）
     * time：2022年4月1日17:44:12
     * author：wqh
     */
    public function getMapData(){

        $auth         = $this->authMethod();
        $isSuperAdmin = $this->auth->isSuperAdmin();

        if(!$isSuperAdmin){
            $where['id'] = ['in',$auth];
        }else{
            $where = [];
        }
        $engineering = Db::name('engineering')->where($where)->field('id,city,lng,lat')->select();

        foreach ($engineering as  $key => $value){
            $engineering[$key]['city'] = substr($value['city'],0,strpos($value['city'],"/"));
        }
        $arr = [];

        $citys = array_unique(array_column($engineering,'city'));

        foreach ($citys as $cKey => $cValue){
            $engineeringCount = 0;
            $arr[$cKey]['data']['project_count'] = 0;
            $arr[$cKey]['data']['series_count']  = 0;
            foreach ($engineering as  $eValue){
                if($cValue == $eValue['city']){
                    $arr[$cKey]['id'][] = $eValue['id'];
                    $arr[$cKey]['lng']  = $eValue['lng'];
                    $arr[$cKey]['lat']  = $eValue['lat'];
                    $arr[$cKey]['data']['project_count'] += Db::name('project')->where('engineering_id','=',$eValue['id'])->count();
                    $arr[$cKey]['data']['series_count']  += Db::name('point')->where('engineering_id','=',$eValue['id'])->count();
                    $engineeringCount++;
                }
                $arr[$cKey]['data']['engineering_count'] = $engineeringCount;

            }

        }

        return json([
            'code' => 200,
            'msg'  => 'success',
            'data' => $arr
        ]);

    }

    /*
     * 项目管理 监测内容 及工程信息
     * time：2022年4月2日10:06:54
     * author：wqh
     * param：id 工程id
     */
    public function getEngineerInfo(Scene $scene,House $house,Inspection $inspection){
        try {
            $engineering_id = $this->request->param('id','');
            $type           = $this->request->param('type',1); //1工程  2 建筑物
            $house_id       = $this->request->param('house_id','');

            if ($type == 1){

                $image = $scene->field(['id','img'])->where(['engineering_id'=>$engineering_id])->select();

                if(!$engineering_id){
                    throw new Exception('Error：missing parameter');
                }



            }else{
                if(!$house_id){
                    throw new Exception('Error：missing parameter');
                }

                if(!$engineering_id = Db::name('project')->where([
                    'item_name'=> ($house::get(['id'=>$house_id]))->name
                ])->value('engineering_id')){
                    throw new Exception('未找到该建筑物对应的项目');
                }

                $inspection_id = $inspection->where(['confirm_completion'=>1,'confirm_audit'=>1,'status'=>1])->order('id desc')->limit(1)->value('id');


                $image = Db::query("SELECT id, issue_img as img From jc_inspection_part WHERE inspection_id = :inspection_id",['inspection_id'=>$inspection_id]);

                $image = json_decode(json_encode($image));


            }



            $project = Db::name('project')
                ->alias('pt')
                ->join('jc_mon_category jy','pt.mon_category_id = jy.id')
                ->field('pt.id,item_name,status,alarm_state,serial,pt.createtime,mon_item_name,mon_item_name')
                ->where('engineering_id','=',$engineering_id)
                ->order('status')
                ->select();






            if($image){
                foreach ($image as &$img){
                    $img->img = $this->url.$img->img;
                }
                unset($img);
            }



            foreach ($project as $key => $value){
                //获取设备
                $project[$key]['project_mon_type'] = Db::query("SELECT id,mon_type_name,(SELECT 0)as count FROM `jc_project_mon_type` WHERE `engineering_id` = {$engineering_id}  AND `project_id` = {$value['id']}");
                if($project[$key]['project_mon_type']){
                    foreach ($project[$key]['project_mon_type'] as $peKey => $peValue){
                        $project[$key]['project_mon_type'][$peKey]['count'] = Db::name('point')->where(['project_mon_type_id'=>$peValue['id']])->count();
                    }
                }
            }

//            获取设备数量



            //获取工程信息
            $engineeringData = Db::name('engineering')
                ->alias('eg')
                ->join('jc_staff jf','eg.monitor_staff_id = jf.id')
                ->join('jc_agency jy','eg.monitor_id = jy.id')
                ->field('eg.name,eg.city,eg.address,finish_date,staff_name,agency_name')
                ->where(['eg.id'=>$engineering_id])
                ->find();

            $arr = [
                'code' => 200,
                'msg'  => 'success',
                'data' => [
                    'engineering_data' => !empty($engineeringData) ? $engineeringData : [],
                    'project'          => !empty($project)         ? $project         : [],
                    'image'            => !empty($image)           ? $image           : [],
                ]
            ];
        }catch (Exception $exception){
            $arr = [
                'code' => 0,
                'msg'  => $exception->getMessage(),
                'data' => []
            ];
        }

        return json($arr);
    }

    public function getStatus(){
        $isSuperAdmin = $this->auth->isSuperAdmin();

        return json([
            'code' => 200,
            'msg'  => 'success',
            'data' => [
                'status' => !empty($isSuperAdmin) ? 0 : 1
            ]
        ]);
    }







}
