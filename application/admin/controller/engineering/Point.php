<?php

namespace app\admin\controller\engineering;

use app\admin\model\Point as PointModel;
use app\api\model\ConfigApi as ConfigApiModel;
use app\common\controller\Backend;
use app\common\exception\UploadException;
use app\common\library\Upload;
use app\console\common\CommandProcess;
use app\handlers\ZHuiHandler;
use Exception;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use think\Config;
use think\Db;
use app\admin\model\Engineering as EngineeringModel;
use app\admin\model\Project as ProjectModel;
use app\admin\model\MonCategory as MonCategoryModel;
use app\admin\model\engineering\ProjectMonType as ProjectMonTypeModel;
use app\admin\model\Sensor as SensorModel;
use app\admin\model\MonType as MonTypeModel;
use app\admin\model\Collector as CollectorModel;
use think\exception\PDOException;
use think\exception\ValidateException;
use think\Request;


/**
 * 监测内容测点管理
 *
 * @icon fa fa-circle-o
 */
class Point extends Backend
{

    /**
     * Point模型对象
     * @var \app\admin\model\Point
     */
    protected $model = null;

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new \app\admin\model\Point;

    }

    public function import()
    {
        parent::import();
    }
    //不需要授权的方法
    protected $noNeedRight = ['import_excel' ,'excel','get_all_list','getZHuiDevice'];

    /**
     * 默认生成的控制器所继承的父类中有index/add/edit/del/multi五个基础方法、destroy/restore/recyclebin三个回收站方法
     * 因此在当前控制器中可不用编写增删改查的代码,除非需要自己控制这部分逻辑
     * 需要将application/admin/library/traits/Backend.php中对应的方法复制到当前控制器,然后进行修改
     */

    /**
     * 测点管理
     * @param $ids 项目监测内容id
     * @return mixed
     */
    public function index($ids = null)
    {
        $project_mon_type_id = $ids;
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
                ->where('project_mon_type_id',$project_mon_type_id)
                ->order($sort, $order)
                ->paginate($limit);

            $result = array("total" => $list->total(), "rows" => $list->items());

            return json($result);
        }
        //查询工程信息名称       监测类型   项目名称   监测内容
     $project_mon_type = Db::name('project_mon_type')
         ->where('id',$project_mon_type_id)
         ->find();

        $project      = ProjectModel::get($project_mon_type['project_id']);
        $engineering  = EngineeringModel::get($project_mon_type['engineering_id']);
        $mon_category = MonCategoryModel::get($project['mon_category_id']);

        $row = [
            'engineering_id' =>$project_mon_type['engineering_id'],
            'engineering_name' => $engineering['name'],
            'mon_item_name'    => $mon_category['mon_item_name'],
            'project_name'     => $project['item_name'],
            'mon_type_name'   => $project_mon_type['mon_type_name'],
            'mon_type_id'   => $project_mon_type['mon_type_id'],
        ];

        $this->assign('project_mon_type_id',$project_mon_type_id);
        $this->assign('row',$row);
        return $this->view->fetch();
    }


    /**
     * 添加
     * @param $ids 项目监测内容id
     */
    public function add($ids = null)
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

                    //添加 告警信息
                    $project_mon_type_id   = $this->request->post("project_mon_type_id");
                    $paramsAlarm           = $this->request->post("alarm/a");
                    $project_mon_type      = ProjectMonTypeModel::get($project_mon_type_id);
                    $engineering_id        = $project_mon_type->engineering_id;
                    $project_id            = $project_mon_type->project_id;
                    $mon_type_id           = $project_mon_type->mon_type_id;
                    $sensor                = SensorModel::get($params['sensor_id']);//传感器名称
                    $collector             = CollectorModel::get($params['dev_id']);//采集仪名称
                    $engineering           = EngineeringModel::get($engineering_id);    //监测机构id

                    $params['dev_code']            = $collector->dev_code;
                    $params['sensor_name']         = $sensor->name;
                    $params['agency_id']           = $engineering->monitor_id;
                    $params['company_id']          = $collector->factory;
                    $params['project_id']          = $project_id;
                    $params['mon_type_id']         = $mon_type_id;
                    $params['engineering_id']      = $engineering_id;
                    $params['project_mon_type_id'] = $project_mon_type_id;

                    switch ($params['company_id']) {
                        case '1':
                            //未填写设备id和线路id时，可根据设备编号自动填充线路id和设备id
                            if (empty($params['card']) || empty($params['port'])) {
                                $ZHuiDevice = $this->getZHuiDevice($params['addr'], $project_mon_type->config_api_id);
                                if (!empty($ZHuiDevice)) {
                                    $params['card'] = $ZHuiDevice['lineid'];
                                    $params['port'] = $ZHuiDevice['deviceid'];
                                }
                            }

                            //添加朝晖的设备时  添加设备的要求:不允许有设备id和线路id一样的设备
                            $hasPoint = $this->model
                                ->where('company_id', $params['company_id'])
                                ->where('card', $params['card'])
                                ->where('port', $params['port'])
                                ->find();
                            if (!empty($hasPoint)) {
                                $this->error('该设备已添加');
                            }
                            break;
                        case '2':
                            break;
                        case '3':
                            //有人云数据添加处理
                            if (!empty($params['deviceNo']) && !empty($params['dataPointId'])) {
                                $count = count($params['deviceNo']);
                                $json  = [];
                                if ($count != count($params['dataPointId'])) {
                                    $this->error("请完善变量信息");
                                }
                                for ($i = 0; $i < $count; $i++) {
                                    $json[] = [
                                        'deviceNo'    => $params['deviceNo'][$i],
                                        'dataPointId' => $params['dataPointId'][$i]
                                    ];
                                }
                                $params['json'] = json_encode($json);
                                unset($params['deviceNo']);unset($params['dataPointId']);

                            }
                            break;
                    }

                    $result = $this->model->allowField(true)->save($params);

                    //1.每个都截掉_后部分    组成一个数组_arr，去掉重复的
                    $alarmSet = $this->getAlarmSet($project_mon_type['mon_type_id']);
                    $key      = array_keys($alarmSet);

                    //2.当前的值 包含_arr中的，放到一个数组中
                    $new = [];
                    foreach ($key as $k => $v) {
                        foreach ($paramsAlarm as $k1 => $v1) {
                            if (strstr($k1, '_') == '_' . $v) {
                                $new[$v][$k1] = $v1;
                            }
                        }
                    }
                    //处理好的数据
                    $point_alarm_data = [];
                    foreach ($new as $k => $v) {
                        $point_alarm_data['engineering_id'] = $engineering_id;
                        $point_alarm_data['project_id']     = $project_id;
                        $point_alarm_data['mon_type_id']    = $mon_type_id;
                        $point_alarm_data['point_id']       = $this->model->id; //测点id
                        $point_alarm_data['item']           = $k;
                        $point_alarm_data['item_name']      = $alarmSet[$k];
                        $point_alarm_data['state']          = $v['state_' . $k];
                        $point_alarm_data['warn']           = $v['warn_' . $k];
                        $point_alarm_data['error']          = $v['error_' . $k];
                        $point_alarm_data['control']        = $v['control_' . $k];
                        $point_alarm_data['createtime']     = time();

                        Db::name('point_alarm')->insert($point_alarm_data);
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

        //对应采集内容的采集仪列表
        $project_mon_type = Db::name('project_mon_type')
            ->where('id', $ids)
            ->find();

        $project_id = $project_mon_type['project_id'];
        $project    = ProjectModel::get($project_id);
        $device_ids = $project['device_ids'];

        $devices = Db::name('collector')
            ->where('id', 'in', $device_ids)
            ->select();

        foreach ($devices as $k => $v) {
            $collector[$v['id']] = $v['dev_name'] . '-' . $v['dev_code'];
        }



        //传感器类型
        $sensor = $this->getMods($project_mon_type['mon_type_id']);


        //告警设置的参数
        $alarmSet = $this->getAlarmSet($project_mon_type['mon_type_id']);

        //查询是否有告警方案
        $plan_id    = $project_mon_type['plan_id'];
        $plan       = [];
        $plan_alarm = [];
        $ous_day    = 0;

        $plan = Db::name('plan')->where('id', $plan_id)->find();

        if ($plan_id != 0 && !empty($plan)) {
            $ous_day    = $plan['ous_day'];
            $plan_alarm = Db::name('plan_alarm')
                ->where('plan_id', $plan_id)
                ->select();

            //判断是否使用的是老的报警方案  设定了报警方案的前提下  bug:绑定的是老的告警方案
            $this->isUseOldAlarm($alarmSet, $plan_alarm);
        } else {
            $plan_id = 0; //bug修复：项目编辑   选择了’已删除的报警方案‘    添加测点时，默认显示的是 ’已删除的报警方案‘
        }

        $company_id = (ConfigApiModel::get($project_mon_type['config_api_id']))->company_id;
        $this->assign('company_id',$company_id);
        $this->assign('plan_id', $plan_id);
        $this->assign('plan', $plan);
        $this->assign('plan_alarm', $plan_alarm);
        $this->assign('project_mon_type_id', $ids);
        $this->assign('controller', $collector);
        $this->assign('sensor', $sensor);
        $this->assign('alarmSet', $alarmSet);
        $this->assign('ous_day', $ous_day);

        return $this->view->fetch();
    }


    /**
     * 编辑
     * @param integer $ids  测点id
     * @return mixed
     */
    public function edit($ids = null)
    {
        $row = $this->model->get($ids);
        $row->json = json_decode($row->json,1);

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

                    switch ($row->company_id) {
                        case '1':
                        case '2':
                            break;
                        case '3':
                            //有人云数据添加处理
                            if (!empty($params['deviceNo']) && !empty($params['dataPointId'])) {
                                $count = count($params['deviceNo']);
                                $json  = [];
                                if ($count != count($params['dataPointId'])) {
                                    $this->error("请完善变量信息");
                                }
                                for ($i = 0; $i < $count; $i++) {
                                    $json[] = [
                                        'deviceNo'    => $params['deviceNo'][$i],
                                        'dataPointId' => $params['dataPointId'][$i]
                                    ];
                                }
                                $params['json'] = json_encode($json);
                                unset($params['deviceNo']);unset($params['dataPointId']);

                            }
                            break;
                    }

                    //修改测点数据
                    $result = $row->allowField(true)->save($params);

                    //修改警情设置
                    $point_alarm_data = [];
                    foreach ($new as $k =>$v)
                    {
                        $point_alarm_data['state']         = $v['state_'.$k];
                        $point_alarm_data['warn']          = $v['warn_'.$k];
                        $point_alarm_data['error']         = $v['error_'.$k];
                        $point_alarm_data['control']       = $v['control_'.$k];
                        $point_alarm_data['updatetime']    = time();

                        $res = Db::name('point_alarm')
                            ->where('id',$v['id_'.$k])
                            ->update($point_alarm_data);
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

        //查询传感器列表
        $project_id = $row['project_id'];
        $project    = ProjectModel::get($project_id);
        $device_ids = $project['device_ids'];

        $devices = Db::name('collector')
            ->where('id','in',$device_ids)
            ->select();

        foreach($devices  as $k => $v){
            $collector[$v['id']] =  $v['dev_name'].'-'.$v['dev_code'];
        }



        //传感器类型
        $sensor = $this->getMods($row['mon_type_id']);

        //告警参数
        $point_alarm = Db::name('point_alarm')
            ->where('point_id',$ids)
            ->select();

        $this->view->assign("point_alarm", $point_alarm);
        $this->view->assign("sensor", $sensor);
        $this->view->assign("row", $row);
        $this->assign('controller', $collector);
        return $this->view->fetch();
    }

    /**
     *  获取采集仪列表+其他设备  @已废弃   采集仪是在创建项目时选择的
     * @param $mon_type_id  监测内容id
     * @return mixed
     */
    public function getDevs($mon_type_id)
    {
        /** 监测内容【沉降】 ==》 采集仪类型     ===》传感器    之间的关系
         * 和【其他设备】的关系
         **/

        //先返回所有的采集仪，后期修改 匹配关系
        $collector = Db::name('collector')
            ->field('id,mod_id,dev_code')
            ->select();

        return $collector;
    }

    /**
     *  获取传感器类型
     * @param $mon_type_id  监测内容id
     * @return mixed
     */
    public function getMods($mon_type_id)
    {
//        $sensor = Db::name('sensor')
//            ->where('mon_type_id',$mon_type_id)
//            ->field('id,name')
//            ->select();
//
//        $sensor = array_select($sensor,'name');
        //7-16 传感器和监测内容的关系由一对一 改为1对多
        $sensor_mon = Db::name('sensor_mon_type')
            ->where('mon_type_id',$mon_type_id)
            ->field('sensor_id')
            ->select();

        $sensor_ids = [];
        if(!empty($sensor_mon))
        {
            foreach ($sensor_mon as $k=>$v)
            {
                $sensor_ids [] = $v['sensor_id'];
            }
        }

        $sensor = Db::name('sensor')
            ->where('id','in',$sensor_ids)
            ->field('id,name')
            ->select();

        $sensor = array_select($sensor,'name');

        return $sensor;
    }


    /**
     *  获取传感器类型-原始数据
     * @param $mon_type_id  监测内容id
     * @return mixed
     */
    public function getModsOriginal($mon_type_id)
    {
        //7-16 传感器和监测内容的关系由一对一 改为1对多
        $sensor_mon = Db::name('sensor_mon_type')
            ->where('mon_type_id',$mon_type_id)
            ->field('sensor_id')
            ->select();

        $sensor_ids = [];
        if(!empty($sensor_mon))
        {
            foreach ($sensor_mon as $k=>$v)
            {
                $sensor_ids [] = $v['sensor_id'];
            }
        }

        $sensor = Db::name('sensor')
            ->where('id','in',$sensor_ids)
            ->field('id,name')
            ->select();


        return $sensor;
    }

    /**
     * 根据 监测内容id 获取 告警内容
     * @param integer $mon_type_id
     * @return mixed
     */
      public function getAlarmSet($mon_type_id)
      {
          if(MonTypeModel::get($mon_type_id)){
              $mon_type = MonTypeModel::get($mon_type_id) ->toArray();
          }else{
              return [];
          }

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
       * 表格导出
       *
       */
      public function excel(Request $request)
      {
          $project_mon_type_id =  $this->request->get("id");

          $project_mon_type = ProjectMonTypeModel::get($project_mon_type_id);
          $param = $this->getAlarmSet($project_mon_type->mon_type_id);

          //查询传感器数据
          $sensorList = $this->getModsOriginal($project_mon_type->mon_type_id);



          $xlsName = '测点批量导入模板';//文件名称
          $head = ['测点编号', '采集仪编号','卡槽号(线路id)','通道号(设备id)','地址号(设备编号)','经度','纬度','传感器类型编号
（请参考备注）','','','备注'];// 表头信息
          //表字段和表头信息一一对应
          $keys = [];
          $data = [];

          $this->downloadExcel($xlsName, $data, $head, $keys,$sensorList);// 传递参数

      }
   /*
    * 导出数据
    * @param $name string  文件名称
    * @param $data array   数据
    * @param $head string   表头信息
    * @param $keys array  对应数据中的key
    * @param $sensorList array  传感器列表
    * @return mixed
    */
    public function downloadExcel($name, $data = [], $head = [], $keys = [],$sensorList)
    {
        $count = count($head);  //计算表头数量
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        for ($i = 65; $i < $count + 65; $i++) {     //数字转字母从65开始，循环设置表头：
            $sheet->setCellValue(strtoupper(chr($i)) . '1', $head[$i - 65]);
            //对齐
            $styleArray = [
                'alignment' => [
                    'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
                ],
            ];
            $sheet->getStyle(strtoupper(chr($i)) . '1')->applyFromArray($styleArray);

        }


        foreach ($sensorList as $k=>$v){
            $sheet->setCellValue('K' . ($k+3), $v['name']);
            $sheet->setCellValue('L' . ($k+3), $v['id']);

        }
        //合并单元格
        $sheet->mergeCells("A1:A2");
        $sheet->mergeCells("B1:B2");
        $sheet->mergeCells("C1:C2");
        $sheet->mergeCells("D1:D2");
        $sheet->mergeCells("E1:E2");
        $sheet->mergeCells("F1:F2");
        $sheet->mergeCells("G1:G2");
        $sheet->mergeCells("H1:H2");


        $sheet->mergeCells("K1:L1");
        $sheet->setCellValue("K2","传感器类型编号");
        $sheet->setCellValue("L2","类型编号");



        //循环设置单元格：
        foreach ($data as $key => $item) {
            //$key+2,因为第一行是表头，所以写到表格时   从第二行开始写
            for ($i = 65; $i < $count + 65; $i++) {
                //数字转字母从65开始：
                $sheet->setCellValue(strtoupper(chr($i)) . ($key + 2), $item[$keys[$i - 65]]);
                //固定列宽
//                $spreadsheet->getActiveSheet()->getColumnDimension(strtoupper(chr($i)))->setWidth(80);
                $spreadsheet->getActiveSheet()->getColumnDimension(strtoupper(chr($i))) ->setAutoSize(true);
            }

        }


        header('Content-Type: application/vnd.ms-excel');
        header('Content-Disposition: attachment;filename="' . $name . '.xlsx"');
        header('Cache-Control: max-age=0');
        $writer = \PhpOffice\PhpSpreadsheet\IOFactory::createWriter($spreadsheet, 'Xlsx');
        $writer->save('php://output');
        exit;

    }


    /**
     * 数据的导入
     *
     */
    public function import_excel($ids = "")
    {
        $project_mon_type_id = $ids;
        if(empty($project_mon_type_id)){
            $this->error('项目检测内容不能为空');
        }
        $project_mon_type = ProjectMonTypeModel::get($project_mon_type_id);
        $engineering_id = $project_mon_type->engineering_id;
        $project_id     = $project_mon_type->project_id;
        $mon_type_id    = $project_mon_type->mon_type_id;
        $engineering = EngineeringModel::get($engineering_id);

        Config::set('default_return_type', 'json');
        //必须设定cdnurl为空,否则cdnurl函数计算错误
        Config::set('upload.cdnurl', '');
        $attachment = null;
        //默认普通上传文件
        $file = $this->request->file('file');
        try {
            $upload = new Upload($file);
            $attachment = $upload->upload();
        } catch (UploadException $e) {
            $this->error($e->getMessage());
        }
        $excelFielname = '.'.$attachment->url;
        $extension = $attachment->imagetype;

        //区分上传文件格式
        if($extension == 'xlsx') {
            $objReader =\PhpOffice\PhpSpreadsheet\IOFactory::createReader('Xlsx');
            $objPHPExcel = $objReader->load($excelFielname, $encode = 'utf-8');
        }else if($extension == 'xls'){
            $objReader =\PhpOffice\PhpSpreadsheet\IOFactory::createReader('Xls');  //报错
            $objPHPExcel = $objReader->load($excelFielname, $encode = 'utf-8');
        }



        $excel_array = $objPHPExcel->getsheet(0)->toArray();   //转换为数组格式

        //计算所需要的字段
       array_shift($excel_array);  //取出表头1字段
       array_shift($excel_array);  //取出表头2字段

        $collector = CollectorModel::all();
        $dev = [];
        foreach ($collector as $k=>$v){
            $dev[$v['dev_code']] = $v['id'];
        }

        //厂商id
        $dev_company = [];
        foreach ($collector as $k1=>$v1){
            $dev_company[$v1['dev_code']] = $v1['factory'];
        }

        $sensor = SensorModel::all();
        $sensorData = [];
        foreach ($sensor as $k=>$v){
            $sensorData[$v['id']] = $v['name'];
        }

        $save_data = [];
        foreach($excel_array as $k=>$v) {
            if(empty($v[0])){continue;}
            $save_data[$k]["point_code"]   = $v[0]; //测点编号
            //采集仪id
            if(!isset($dev[$v[1]])){
                $this->error('该采集仪不存在:  '.$v[1] );
            }

            $save_data[$k]["dev_id"]   = $dev[$v[1]]; //采集仪id
            $save_data[$k]["dev_code"] = $v[1]; //采集仪名称
            $save_data[$k]["card"]     = $v[2]; //卡槽号
            $save_data[$k]["port"]     = $v[3]; //通道号
            $save_data[$k]["addr"]     = $v[4]; //地址号
            $save_data[$k]["lng"]     = $v[5]; //经度
            $save_data[$k]["lat"]     = $v[6]; //纬度
            $save_data[$k]["sensor_id"]     = $v[7]; //传感器id
            $save_data[$k]["engineering_id"] = $engineering_id;
            $save_data[$k]["project_id"]     = $project_id;
            $save_data[$k]["mon_type_id"]    = $mon_type_id;
            $save_data[$k]["createtime"]    = time();
            $save_data[$k]["admin_id"]    = $this->auth->id;
            $save_data[$k]["project_mon_type_id"]    = $project_mon_type_id;
            if(!isset($sensorData[$v[7]])){
                $this->error('该传感器不存在:  '.$v[7] );
            }


            $project_mon_type = ProjectMonTypeModel::get($project_mon_type_id);

            //未填写设备id和线路id时，可根据设备编号自动填充线路id和设备id
            if(empty($save_data[$k]["card"]) || empty($save_data[$k]["port"])){
                $ZHuiDevice = $this->getZHuiDevice($save_data[$k]['addr'],$project_mon_type->config_api_id);
                if(!empty($ZHuiDevice)){
                    $save_data[$k]["card"] = $ZHuiDevice['lineid'];
                    $save_data[$k]["port"] = $ZHuiDevice['deviceid'];
                }
            }

            $save_data[$k]["sensor_name"]    = $sensorData[$v[7]]; //传感器名称
            $save_data[$k]["agency_id"]    = $engineering->monitor_id; //机构id
            $save_data[$k]["company_id"]    = $dev_company[$v[1]];;  //厂商id   拉取数据防止重复

        }

        $result =  $this->model->saveAll($save_data);

        //测点警情数据
        $model = new \app\admin\model\PointAlarm;
        $model->project_mon_type_id = $project_mon_type_id;
        $model->engineering_id = $engineering_id;
        $model->project_id = $project_id;
        $model->mon_type_id = $mon_type_id;


        $okData =collection($result)->toArray();
        foreach($okData as $k=>$v)
        {
            $model->point_id = $v['id'];
            $model->addPointAlarm();
        }


        if($result){
            $this->success('导入成功');
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
            $pk = $this->model->getPk();
            $adminIds = $this->getDataLimitAdminIds();
            if (is_array($adminIds)) {
                $this->model->where($this->dataLimitField, 'in', $adminIds);
            }
            $list = $this->model->where($pk, 'in', $ids)->select();

            $this->delExceptionAlarmLog($ids); //删除该工程下的告警管理和告警管理信息
            $this->delData($ids); //删除测点下的数据

            $this->updateProject($ids);//更改项目的告警状态


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
     * 删除测点下的报警管理记录
     *
     */
    public function delExceptionAlarmLog($point_ids)
    {
        $exceptionAlarmLog = Db::name('exception_alarm_log')
            ->where('point_id','in',$point_ids)
            ->select();
        $exception_alarm_ids = [];
        foreach ($exceptionAlarmLog as $k=>$v){
            $exception_alarm_ids[] = $v['exception_alarm_id'];
        }
        //根据告警记录来反向删除告警数据
        $res1 =  Db::name('exception_alarm')
            ->where('id','in',$exception_alarm_ids)
            ->delete();

        $res = Db::name('exception_alarm_log')
            ->where('point_id','in',$point_ids)
            ->delete();

        return $res;
    }

    /**
     * 删除项目下相关联的数据
     *
     */
    public function delData($ids)
    {
        $res = Db::name('data')
            ->where('point_id','in',$ids)
            ->delete();

        return $res;
    }

    /**
     *  项目修改
     */
    public function updateProject($ids)
    {
        //判断测点下的所有数据是否还有报警的
        $point = \app\admin\model\Point::all($ids);
        $project_ids = [];
        foreach ($point as $key => $val){
            $project_ids[] = $val['project_id'];
        }

        $hasProject = Db::name('point')
            ->where('id','not in',$ids )
            ->where('project_id','in', $project_ids)
            ->where('alarm_status','in', [1,2] ) //预警和告警的
            ->count();

        if($hasProject == 0){
            $res = Db::name('project')
                ->where('id','in',$project_ids)
                ->update(['alarm_state'=> 0,'updatetime'=>time()]);  //项目的告警状态改为正常
        }

    }


    /**
     *  判断是否使用的是老的告警方案
     *  未写完
     */
    public function isUseOldAlarm($alarmSet,$plan_alarm)
    {

    }

    /**
     * 根据项目监测内容id 获取测点
     * @params item_id 项目检测内容id
     * @return mixed
     */
    public function get_all_list()
    {
        $project_mon_type_id = $this->request->post("item_id");

        $data = $this->model
            ->where('project_mon_type_id',$project_mon_type_id)
            ->select();

        $list = [
            'code' =>1,
            'data' =>$data,
            'msg' => '加载完成'
        ];

        return json($list);
    }


    /**
     * 获取朝晖的设别列表
     * @params $deviceName 设备编号
     * @params $config_api_id 配置id
     *
     */
    public function getZHuiDevice($deviceName = "QJ-02",$config_api_id)
    {
        $config = ConfigApiModel::get($config_api_id);

        $client  = new ZHuiHandler($config);
        $deviceAll  = $client->getDeviceAll();

        $device = [];
        foreach ($deviceAll as $v){
            if($v['name'] == $deviceName){
                $device = $v;
            }
        }
        return $device;

    }
    /**
     * 监测内容修改后，测点的警情设置随之修改
     * 修复bug： 编辑测点时，已修改的监测内容  没有出现  连续xx天
     */
    public function editPointByMonType()
    {
        $points = Db::name('point')->select();
        foreach ($points as $point)
        {
            $alarmSet = $this ->getAlarmSet($point['mon_type_id']);
            $alarms = array_keys($alarmSet);

            $point_alarms = Db::name('point_alarm')
                ->where('point_id',$point['id'])
                ->select();
            //判断缺少的参数
            $new = [];
            foreach ($point_alarms as $point_alarm)
            {
                $new[] =  $point_alarm['item'];
            }

            foreach ($alarms as $alarm)
            {
                if(!in_array($alarm,$new))
                {
                    $alarm_data = [
                        'engineering_id' => $point['engineering_id'],
                        'project_id' => $point['project_id'],
                        'mon_type_id' => $point['mon_type_id'],
                        'point_id' =>  $point['id'],
                        'item' => $alarm,
                        'item_name' => $alarmSet[$alarm],
                        'state' => 0,
                    ];
                    //警情报警
                    $res = Db::name('point_alarm')
                        ->insert($alarm_data);
                }
            }
        }
    }




}
