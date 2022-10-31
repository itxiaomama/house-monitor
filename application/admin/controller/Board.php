<?php

namespace app\admin\controller;

use app\admin\model\Engineering;
use app\admin\model\engineering\ProjectMonType as ProjectMonTypeModel;
use app\admin\model\MonType as MonTypeModel;
use app\admin\model\Point as PointModel;
use app\admin\model\Project;
use app\api\model\ConfigApi as ConfigApiModel;
use app\common\controller\Backend;
use think\Db;
use think\Exception;
use think\exception\PDOException;
use think\exception\ValidateException;

/**
 * 看板2.o
 *
 * @icon fa fa-circle-o
 */
class Board extends Backend
{

    /**
     * Board模型对象
     * @var \app\admin\model\Board
     */
    protected $model = null;

    protected $noNeedRight = ['getEngOrgNum','getEchart','index','getEngPoint','showDeviceData']; //无需鉴权的方法,但需要登录

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new \app\admin\model\Board;

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

            $list = $this->model
                ->where($where)
                ->order($sort, $order)
                ->paginate($limit);

            $result = array("total" => $list->total(), "rows" => $list->items());

            return json($result);
        }

        //总工程数
        $configs = ConfigApiModel::all();

        $totalData = 0;
        foreach ($configs as $key => $config)
        {
            $totalData += Db::name('data_'.$config->mark)->count();
        }
        //拿到初始测点的项目监测id
        $engineering = Db::name('engineering')
            ->order('id desc')
            ->find();
        $item_id = $this->getLevel($engineering['city']);
        $item_id = is_array($item_id) ? 0 : $item_id;

        //曲线图
        $modelsData = $this->getAlarmSet($item_id);
        $models = json_encode($modelsData);
        $modelsDataKey = isset(array_keys($modelsData)[0]) ? array_keys($modelsData)[0] : 'data1';

        $this->assign('item_id',$item_id);
        $this->assign('modelsData',$modelsData);   //参数    ["data1"] => string(9) "液位值"    ["data1_this"] => string(12) "即时沉降"
        $this->assign('modelsDataKey',$modelsDataKey); //默认参数:data1

        $this->assign('totalData',$totalData);;
        return $this->view->fetch();
    }

    /**
     *   复制于看板display的数据
     *   以城市地址（浙江省/杭州市/萧山区） 获取项目名称 测点信息
     *  获取工程-项目-测点 三级关系
     * @param $city 城市名称
     *
     */
    public function getLevel($city)
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

        $engineering =  Db::name('engineering')
            ->field('id,name,city,address,lng,lat')
            ->where('id','in',$engineering_ids)
            ->where('city',$city)
            ->select();

        $engineering_ids = [];
        foreach($engineering as $k2=>$v2)
        {
            $engineering_ids[] = $v2['id'];
        }

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
                return $v1['mon_type_id'];  //只需要第一个 项目监测id


                $modelsData = $this->getAlarmSet($v1['mon_type_id']);
                $modelsDataKey = array_keys($modelsData)[0];

                $point[$k1]['model'] = $modelsDataKey;
            }


            $project[$k]['point'] = $point;
        }


        return $project;
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

        //总工程数
        $configs = ConfigApiModel::all();

        $totalData = 0;
        foreach ($configs as $key => $config)
        {
            $totalData += Db::name('data_'.$config->mark)->count();
        }

        $this->assign('totalData',$totalData);
        return $this->view->fetch();
    }



    /**
     * 获取工程总数和机构数量和传感器详细数据
     *
     */
    public function getEngOrgNum()
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
            if($v['name'] == '应变计'){ //应变计的设备和其他传感器数量的计算方式不一样
                $count = $this->getGaugeNum($v['id']);
                $seriesNum = $count;
            }
            $yAxis[]  = $v['name'];
            $series[] = $seriesNum;
            $count += $seriesNum;
        }


        $yAxis[] = "机构数量";
        $series[]= Db::name('agency')->count();

        $yAxis[]  = "工程数量";
        $series[] = Db::name('engineering')->count();



        $yAxis[] = "巡检任务";
        $series[]= Db::name('inspection')->count();




        $sensorData = [
            'yAxis'  => $yAxis,
            'series' => $series,
            'count'  => $count
        ];

        return json($sensorData);
    }


    /**
     * 应变计 使用数量的算法
     * $id  传感器id
     * return mixed
     */
    public function getGaugeNum($id)
    {

        $point = Db::name('point')
            ->where('sensor_id',$id)
            ->find();

        $mon_type = Db::name('mon_type')
            ->where('id',$point['mon_type_id'])
            ->find();

        //剔除空的数组
        foreach($mon_type as $k=>$v){
            if(empty($v)){
                unset($mon_type[$k]);
            }
        }

        unset($mon_type['id']);
        unset($mon_type['mon_type_name']);
        unset($mon_type['status']);
        return count($mon_type);
    }

    /**
     *  看板2.0  大小点
     *
     */
    public function getEngPoint()
    {

        $engineering_staff_ids  = $this->authMethod();
        $isSuperAdmin           = $this->auth->isSuperAdmin();
        $where                  = [];

        if(!$isSuperAdmin){
            $where['id'] = ['in',$engineering_staff_ids];

        }

        //工程信息
        $engineering = Db::name('engineering')
            ->field('id,name,lng,lat,finish_date,city,address')
            ->where($where)
            ->select();


        //测点数据  测点编号、设备名称、工程项目、所在位置、经纬度、有效日期=>完工日期
        $points = Db::name('point')
            ->alias('p')
            ->join('engineering e','p.engineering_id = e.id')
            ->field('p.id,e.id as engineering_id,p.point_code,p.sensor_name,p.lng,p.lat,p.engineering_id,p.project_id,e.name,e.finish_date,e.city,e.address')
            ->where('engineering_id','in',array_column($engineering,'id'))
            ->select();

        $project_ids = [];
        foreach ($points as $point){
            $engineering_ids[] = $point['engineering_id'];
            $project_ids[] = $point['project_id'];
        }

        $projects = Db::name('project')
            ->field('id,item_name')
            ->where('id','in',$project_ids)
            ->select();

        $projects = array_select($projects,'item_name');
        foreach ($points as $key => $point){
            $points[$key]['project_name'] = $projects[$point['project_id']];
        }

        $sensorData = [
            'code'  => 200,
            'big'  => $engineering,
            'small' => $points,
        ];

        return json($sensorData);
    }



    /**
     * 测点曲线图
     * @params  project_mon_type_id   $item_id   int 项目检测内容id
     * @params  point_id array 测点id
     * @params  time string  时间段
     * @params  model string 显示的参数
     */
    public function  getEchart()
    {
        $point_id = $this->request->post("point_id");
        $time   = $this->request->post("time");
        $model  = $this->request->post("model");
        $item_id =  $this->request->post("item_id");

        //测试数据
//        if($point_id == 62 && $item_id == 76  ){
//            $_data = [
//                "code"=> 1,
//                'msg' => '加载完成',
//                "data"=>
//                [
//                    [
//                        "name"=> "YB8-1",
//                        "data" => [
//                            "time"=> [
//                                "2021-12-07 17:25:10",
//                                "2021-12-07 17:35:10",
//                                "2021-12-07 17:45:10",
//                                "2021-12-07 17:55:10",
//                                "2021-12-07 18:00:10",
//                                "2021-12-07 18:10:10",
//                            ],
//                            "val"=> [
//                                1605.4338807,
//                                1615.4338807,
//                                1685.4338807,
//                                1608.4338807,
//                                1625.4338807,
//                                1635.4338807,
//                            ]
//                        ]
//                    ],
//                ]
//            ];
//            return json($_data);
//        }

        $project_mon_type = ProjectMonTypeModel::get($item_id);
        $config  = \app\admin\model\ConfigApi::get($project_mon_type->config_api_id);
        $dataModel = new \app\admin\model\Data;
        //获取当前用户的场景值
        $dataModel->setTable( $dataModel->getTable(). '_' . $config->mark );


        if(empty($model)){
            $this->error('参数model不能为空');
        }

        if(!empty($item_id)){
            $dataModel->where('project_mon_type_id',$item_id);
        }

        if(!empty($point_id)){
            $dataModel->where('point_id' ,$point_id);
        }

        if(!empty($time)){
            $x_row  =  explode(" - ", $time);
            $dataModel->where('record_time','between time',[$x_row[0],$x_row[1]]);
        }
        if(strpos($model,"data") != 0){
            $tmpData  =  explode("_", $model);
            $model = $tmpData[1].'_'.$tmpData[0];
        }


        $list = $dataModel
            ->field('id,point_id,record_time,'.$model)
            ->order('record_time')
            ->select();
        $list = collection($list)->toArray();

        $row = $point_ids = $tmp = $time = $val = [];
        foreach ($list as $k=>$v){
            $tmp = [$v['record_time'],(float)$v[$model]];
            $time [] = $v['record_time'];
            $val [] = (float)$v[$model];
            $row[$v['point_id']][] = $tmp;
            $point_ids[$v['point_id']] = $v['point_id'];
        }

        $point_ids = array_values($point_ids);

        $point = PointModel::all($point_ids);
        $point = array_select($point,'point_code');

        $data = $tmp = [];
        foreach ($row as $k =>$v){
            $tmp['name'] = $point[$k];
            $tmp['data'] = [
                'time' => $time,
                'val' => $val,
            ];
            $data[] = $tmp;
        }

        $result = [
            'code' => 1,
            'data' => $data,
            'msg' => '加载完成'
        ];
        return json($result);
    }

    /**
     * 报警弹窗
     *
     */
    public function getAlarmPop(){
        $list  = Db::name('exception_alarm')
            ->where('alarm_status','in',[1,2])
            ->order("id desc")
            ->limit(5)
            ->select();

        $count = Db::name('exception_alarm')
            ->where('alarm_status','in',[1,2])
            ->count();

        foreach ($list as $key => $val){
            $detail =  Db::name('exception_alarm_log')
                ->where('exception_alarm_id',$val['id'])
                ->find(); //取其中一条，来取测点的经纬度
            $lng = $lat = "";
            if(!empty($detail)){
                $point = Db::name('point')
                    ->where('id',$detail['point_id'])
                    ->find();
                $lng = $point['lng'];
                $lat = $point['lat'];
            }

            $list[$key]['lng'] = $lng;
            $list[$key]['lat'] = $lat;
            $list[$key]['alarm_time'] = date("Y-m-d H:i:s",$val['alarm_time']);
        }



        $result = [
            'code' => 1,
            'data' => $list,
            'msg'  => '加载完成',
            'count' => $count,
        ];
        return json($result);
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

        return $mon_type;
    }

    public function showDeviceData(){
        try {
            $request = $this->request->param();

            $limit   = isset($request['limit'])  ? $request['limit']  :  10 ;

            $offset  = isset($request['offset']) ? $request['offset'] :  1;

            $auth    = $this->parameterValidation(['engineering_id'],$request);

            $status  = [
                0 => '正常',
                1 => '故障',
                2 => '拆除',
                3 => '其他',
            ];

            if(!$auth){
                throw new Exception('缺失参数');
            }

            $where = ['engineering_id' => $request['engineering_id']];
            $field = ['point_code','dev_id','card','port','addr','point_status','dev_code','sensor_name','agency_id','project_id','engineering_id'];

            $count = Db::name('point')->where($where)->count();

            $data  = Db::name('point')
                ->where($where)
                ->field($field)
                ->page($offset,$limit)
                ->select();

            $agency    = new \app\admin\model\Agency();
            $enginneer = new Engineering();
            $project   = new Project();



            foreach ($data as $key => $value){

                $agency_name    = ($agency->get($value['agency_id']))->agency_name;

                $project_name   = ($project->get($value['project_id']))->item_name;

                $enginneer_name = ($enginneer->get($value['engineering_id']))->name;

                $data[$key]['agency_name']    = isset($agency_name)   ? $agency_name     : '';

                $data[$key]['enginneer_name'] = isset($enginneer_name) ? $enginneer_name : '';

                $data[$key]['project_name']   = isset($project_name)   ? $project_name   : '';

                $data[$key]['point_status']   = isset($status[$value['point_status']]) ? $status[$value['point_status']] : '其他';

            }
            $arr = [
                'code'    => 200,
                'message' => 'success',
                'data'    => [
                    'list'   => $data,
                    'count'  => $count,
                    'total'  => count($data),
                    'limit'  => $limit,
                    'offset' => $offset
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
