<?php

namespace app\handlers;


use app\admin\model\Data;
use app\admin\model\DataCloud;
use app\admin\model\Point as PointModel;
use app\admin\model\MonType as MonTypeModel;
use app\admin\model\PointAlarm;
use app\job\ZHuiJob;
use think\Cache;
use think\Db;
use think\Model;
use think\Queue;
use think\Request;

/**
 * 拉取数据，存储到本地
 * @package app\admin\handler
 */
trait ZHuiSync
{
    /**
     * 同步传感器数据
     * @params $lineid 线路id
     * @params $deviceid 设备id
     * @return string
     */
    public function syncLever($lineid, $deviceid)
    {
        ini_set('max_execution_time', 0);
        $dataModel = new Data();

        $has = strstr($dataModel->getTable(), $this->config['mark']);
        if (!$has) {
            $dataModel->setTable($dataModel->getTable() . '_' . $this->config['mark']);
        }

        $this->dataModel = $dataModel;
        $oldData         = $dataModel
            ->where('upload_code', $lineid . '#' . $deviceid)
            ->where('is_test', 0)
            ->order('id', 'desc')
            ->limit(1)
            ->select();
        if (empty($oldData)) {
            $startTime = '2021-10-15 16:21:00';
        } else {
            $startTime = date("Y-m-d H:i:s", strtotime($oldData[0]->record_time) + 1);
        }

        $now     = time();
        $options = [
            'lineid'    => $lineid,
            'deviceid'  => $deviceid,
            'startTime' => $startTime,
        ];

        $result = $this->getLeverData($options);

//        Db::name('json_test')->insert(['json'=>json_encode($result)]);

        //算出总数
        $interval  = 5 * 60; //每5分钟 拉取1次数据
        $page_size = 1000;
        $total     = (int)ceil(($now - strtotime($startTime)) / $interval);
        $page_num  = (int)ceil($total / $page_size);

        $total = 0;
        if (!empty($result)) {
            //以时间的间隔来排序  2天的时间    5分钟一次数据，2天是 576
            $insert_rows = [];
            $update_rows = [];

//            DB::table($dataModel->getTable(). '_' . $this->config['mark'] )->delete();//清空数据表

            // 以1000条为一页进行分页查找，并插入
            for ($i = 1; $i <= $page_num; $i++) {
                $endTime = strtotime($startTime) + $page_size * 5 * 60;
                $endTime = date("Y-m-d H:i:s", $endTime);
                $options = [
                    'lineid'    => $lineid,
                    'deviceid'  => $deviceid,
                    'startTime' => $startTime,
                    'endTime'   => $endTime,
                ];
                ####       debug 时间间隔
//                var_dump($startTime);echo "</br>";
//                var_dump($endTime);echo "</br>";
//                echo "<hr/>";

                $startTime = $endTime;

                $result = $this->getLeverData($options);
//                Db::name('json_test')->insert(['json'=>json_encode($result),'is_test'=>2]);
                //point_id测点id  项目检测内容id
                $point = PointModel::get([
                    'company_id' => $this->config['company_id'],
                    'card'       => $lineid,
                    'port'       => $deviceid,
                    'is_test'    => 0
                ]);
                foreach ($result as $key => $d) {
                    //前一天同一时刻的记录值  (同一测点:时间为前一天同一时刻的记录值)
                    $last_row = $this->getLastRow($d->date, $point->id);

                    //data表中需要的参数： 告警状态
                    $switchParams = $this->switchParam($d->devicetype, $d, $point->mon_type_id, $last_row);

                    //若已存在，即更新;若不存在，即插入
                    $insert_param = [
//                            'upload_code'           => $d->date, //这个字段先为空
                        'createtime'           => $now,
                        'point_id'             => $point->id,
                        'project_mon_type_id'  => $point->project_mon_type_id,
                        'dev_type'             => $point->sensor_id,//传感器类型：传感器id
                        'data'                 => json_encode($d),
                        'mon_type'             => $point->mon_type_id,
                        'point_name'           => $point->point_code, //测点名称
                        'dev_id'               => $point->dev_id, //采集仪id
                        'record_time'          => $d->date,
                        'upload_code'          => $d->lineid.'#'.$d->deviceid ,
                    ];

                    $insert_rows[] = array_merge($insert_param, $switchParams);
                    $total++;
                }
            }

            if (!empty($insert_rows)) {
                $res = $dataModel->saveAll($insert_rows);

                $okData = collection($res)->toArray();

                ////判断是否超过阈值
                foreach ($okData as $k => $v) //                foreach ($res as $k=>$v)
                {
//                    $dataModel->compare($v,$v['id']);
                    $this->enqueue(json_encode($v));
                }

            }
        }
        return $total;
    }

    /**
     * 同步应变计数据   好烦，每个设备需要手动绑定
     * @params $lineid 线路id
     * @params $deviceid 设备id
     * @return string
     */
    public function syncLeverStrain($lineid, $deviceid)
    {
        ini_set('max_execution_time', 0);
        $dataModel = new Data();

        $has = strstr($dataModel->getTable(), $this->config['mark']);
        if (!$has) {
            $dataModel->setTable($dataModel->getTable() . '_' . $this->config['mark']);
        }
        //初始化 测点 手动维护 拼接的是测点id
        $this->lastTotalStrain58 = 0;
        $this->lastTotalStrain59 = 0;

        $this->dataModel = $dataModel;
        $oldData         = $dataModel
            ->where('upload_code', $lineid . '#' . $deviceid)
            ->order('id', 'desc')
            ->where('is_test', 0)
            ->limit(1)
            ->select();
        if (empty($oldData)) {
            $startTime = '2021-10-15 16:21:00';
        } else {
            $startTime = date("Y-m-d H:i:s", strtotime($oldData[0]->record_time) + 1);
        }

        $now     = time();
        $options = [
            'lineid'    => $lineid,
            'deviceid'  => $deviceid,
            'startTime' => $startTime,
        ];

        $result = $this->getLeverData($options);

        Db::name('json_test')->insert(['json' => json_encode($result), 'ybj' => 1]);

        //算出总数
        $interval  = 5 * 60; //每5分钟 拉取1次数据
        $page_size = 500;
        $total     = (int)ceil(($now - strtotime($startTime)) / $interval);
        $page_num  = (int)ceil($total / $page_size);

        $total = 0;
        if (!empty($result)) {
            //以时间的间隔来排序  2天的时间    5分钟一次数据，2天是 576
            $insert_rows = [];
            $update_rows = [];

//            DB::table($dataModel->getTable(). '_' . $this->config['mark'] )->delete();//清空数据表

            // 以1000条为一页进行分页查找，并插入
            for ($i = 1; $i <= $page_num; $i++) {
                $endTime = strtotime($startTime) + $page_size * 5 * 60;
                $endTime = date("Y-m-d H:i:s", $endTime);
                $options = [
                    'lineid'    => $lineid,
                    'deviceid'  => $deviceid,
                    'startTime' => $startTime,
                    'endTime'   => $endTime,
                ];

                $startTime = $endTime;

                $result = $this->getLeverData($options);

                //point_id测点id  项目检测内容id
                $point = PointModel::get([
                    'company_id' => $this->config['company_id'],
                    'card'       => $lineid,
                    'port'       => $deviceid,
                    'is_test'    => 0
                ]);
                foreach ($result as $key => $d) {

                    //若已存在，即更新;若不存在，即插入
                    $insert_param = [
                        'createtime'          => $now,
                        'project_mon_type_id' => $point->project_mon_type_id,
                        'dev_type'            => $point->sensor_id,//传感器类型：传感器id
                        'data'                => json_encode($d),
                        'mon_type'            => $point->mon_type_id,
                        'dev_id'              => $point->dev_id, //采集仪id
                        'record_time'         => $d->date,
                        'upload_code'         => $d->lineid . '#' . $d->deviceid,
                    ];

                    //data表中需要的参数： 告警状态
                    $insert_rows = array_merge($insert_rows, $this->switchParamStrain($d->devicetype, $d, $point->id, $insert_param));
                    $total++;
                }
            }

            if (!empty($insert_rows)) {
                $res    = $dataModel->saveAll($insert_rows);
                $okData = collection($res)->toArray();

                ////判断是否超过阈值
                foreach ($okData as $k => $v) {
                    $this->enqueue(json_encode($v));
                }

            }
        }
        return $total;
    }


    /**
     * 有人云获取数据
     *
     * @param $jsonRows
     * @param $rows
     * @return int
     * @throws \think\exception\DbException
     */
    public function cloudSensorData($jsonRows, $rows)
    {

        $dataCloud  = new DataCloud();
        //创建请求数组
        $sensorData = $dataCloud::historyLastDataPoint(['devDatapoints' => $jsonRows]); // 1

        // 获取数据不成功 返回0条
        if (!$sensorData) {
            return 0;
        }

        foreach ($sensorData as $key => $value) {
            $sensorData[$key]['dev_id']              = $rows[$value['data1_total']]['dev_id'];
            $sensorData[$key]['point_id']            = $rows[$value['data1_total']]['id'];
            $sensorData[$key]['dev_type']            = $rows[$value['data1_total']]['sensor_id'];
            $sensorData[$key]['mon_type']            = $rows[$value['data1_total']]['mon_type_id'];
            $sensorData[$key]['point_name']          = $rows[$value['data1_total']]['point_code'];
            $sensorData[$key]['project_mon_type_id'] = $rows[$value['data1_total']]['project_mon_type_id'];
            $sensorData[$key]['createtime']          = time();
        }

        $res    = $dataCloud->saveAll($sensorData);
        $okData = collection($res)->toArray();


        //判断是否超过阈值
        foreach ($okData as $v) {
            $this->enqueue(json_encode($v));
        }

        return count($sensorData);

    }


//    public function cloudSensorData($jsonRows, $rows)
//    {
//
//        //获取上次更新数据时间
//        $dataCloud  = new DataCloud();
//        $lastTime   = $dataCloud->order('id desc')->value('record_time') ?: '1664035200000'; //2022-09-25 00:00:00
//        $pageNo     = 1;
//        $sensorData = [];
//        $array      = [
//            'devDatapoints' => $jsonRows,
//            'pageNo'        => $pageNo,
//            //            'start'         => $lastTime . '000',
//            //            'end'           => time() . '000',
//            'start'         => '1661961600000',
//            'end'           => '1662048000000',
//            'pageSize'      => 1 // 写多点防止获取不到全部数据
//        ];
//
//        /*
//         * 获取毫秒级时间戳 没必要先写着
//         *
//        list($msec, $sec) = explode(' ', microtime());
//        $msectime = (float)sprintf('%.0f', (floatval($msec) + floatval($sec)) * 1000);
//        */
//
//        //创建请求数组
//
//        $result = $dataCloud::historyDataPoint($array); // 1
//        while (!empty($result)) {
//            $array['pageNo']   = $pageNo;
//            $array['pageSize'] = 50;
//            $result            = $dataCloud::historyDataPoint($array);
//            $sensorData        = array_merge($sensorData, $result);
//            $pageNo++;
//        }
//
////        if(Cache::has('sensorData')){
////            $sensorData = Cache::get('sensorData');
////   echo rand();
////            echo "<pre>";
////            print_r($sensorData);
////            echo "</pre>";
////            exit;
////        }else{
////            $result     = $dataCloud::historyDataPoint($array); // 1
////            while (!empty($result)) {
////                $array['pageNo']++;
////                $array['pageSize'] = 50;
////                echo "<pre>";
////                print_r($array);
////                echo "</pre>";
////                exit;
////                $sensorData = array_merge($result, $sensorData);
////                $result     = $dataCloud::historyDataPoint($array);
////
////
////            }
////            Cache::set('sensorData',$sensorData,86400);
////        }
//
//        echo "<pre>";
//        print_r($sensorData);
//        echo "</pre>";
//        exit;
//
//
//        // 获取数据不成功 返回0条
//        if (!$sensorData) {
//            return 0;
//        }
//
//
//        foreach ($sensorData as $key => $value) {
//            $sensorData[$key]['dev_id']              = $rows[$value['data1_total']]['dev_id'];
//            $sensorData[$key]['point_id']            = $rows[$value['data1_total']]['id'];
//            $sensorData[$key]['dev_type']            = $rows[$value['data1_total']]['sensor_id'];
//            $sensorData[$key]['mon_type']            = $rows[$value['data1_total']]['mon_type_id'];
//            $sensorData[$key]['point_name']          = $rows[$value['data1_total']]['sensor_name'];
//            $sensorData[$key]['project_mon_type_id'] = $rows[$value['data1_total']]['project_mon_type_id'];
//        }
//
//        $res    = $dataCloud->saveAll($sensorData);
//        $okData = collection($res)->toArray();
//
//        //判断是否超过阈值
//        foreach ($okData as $v) {
//            $this->enqueue(json_encode($v));
//        }
//
//        return count($sensorData);
//
//    }





    //value1： 水准仪：液位值 倾角传感器：X 上传值 裂缝计&激光测距：上传值
    //value2： 水准仪：温度值 倾角传感器：Y 上传值 裂缝计&激光测距：累计变化
    //value3： 水准仪：累计沉降 倾角传感器：X 累计变化 裂缝计&激光测距：即时变化
    //value4： 水准仪：即时沉降 倾角传感器：Y 累计变化 裂缝计&激光测距：填充 0
    //value5： 水准仪：填充 0 倾角传感器：X 即时变化 裂缝计&激光测距：填充 0
    //value6： 水准仪：填充 0 倾角传感器：Y 即时变化 裂缝计&激光测距：填充 0


    /**
     * 根据不同的设备 对接不同的参数
     * @params $devicetype 设备类型
     * @params $deviceid 设备id
     * @params $d  接口返回的数据
     * @params $mon_type_id  监测内容id
     * @params $last_row  上一条的记录值
     * @return mixed    e.g: ['data1'=> 9.123021]
     */
    public function switchParam($devicetype, $d, $mon_type_id, $last_row)
    {
//        file_put_contents('./test.txt',json_encode($last_row).PHP_EOL,FILE_APPEND );
        $tmpData = [];
        if ($devicetype == '静力水准仪') {
            $mon_type = $this->getMonType($mon_type_id);
            //需要返回什么东西
            $tmpData[$mon_type['液位值']]  = $d->value1;
            $tmpData[$mon_type['温度值']]  = $d->value2;
            $tmpData[$mon_type['累计沉降']] = $d->value3;
            $tmpData[$mon_type['即时沉降']] = $d->value4;
            //日变化：本次记录值-前一天同一时刻的记录值
            $tmpData[$mon_type['日变化']] = $d->value1 - ($last_row[$mon_type['液位值']]);
        } elseif ($devicetype == '有线倾角传感器' || $devicetype == '倾角传感器') {
            $mon_type = $this->getMonType($mon_type_id);
            //需要返回什么东西
            $tmpData[$mon_type['X 上传值']]  = $d->value1;
            $tmpData[$mon_type['Y 上传值']]  = $d->value2;
            $tmpData[$mon_type['X 累计变化']] = $d->value3;
            $tmpData[$mon_type['X 日变化']]  = $d->value1 - ($last_row[$mon_type['X 上传值']]);
            $tmpData[$mon_type['Y 累计变化']] = $d->value4;
            $tmpData[$mon_type['X 即时变化']] = $d->value5;
            $tmpData[$mon_type['Y 即时变化']] = $d->value6;
            $tmpData[$mon_type['Y 日变化']]  = $d->value2 - ($last_row[$mon_type['Y 上传值']]);
        } elseif ($devicetype == '裂缝计') {
            $mon_type = $this->getMonType($mon_type_id);
            //需要返回什么东西
            $tmpData[$mon_type['上传值']]  = $d->value1;
            $tmpData[$mon_type['累计变化']] = $d->value2;
            $tmpData[$mon_type['即时变化']] = $d->value3;
            $tmpData[$mon_type['日变化']]  = $d->value1 - ($last_row[$mon_type['上传值']]);
        } else {
            Db::name('exception_log')->insert([
                'message'    => '朝晖设备类型 ：' . $devicetype . "不存在" . '原始数据' . json_encode($d),
                'createtime' => date("Y-m-d H:i:s", time()),
                'site'       => 'app/handle/ZHuiSync:switchParam-190',
            ]);
        }
        return $tmpData;
    }


    /**
     * 应变计 对接不同的参数
     * @params $devicetype 设备类型
     * @params $deviceid 设备id
     * @params $d  接口返回的数据
     * @params $mon_type_id  监测内容id
     * @params $point_id  测点id
     * @params $insert_param  公共参数
     * @return mixed
     */
    public function switchParamStrain($devicetype, $d, $point_id, $insert_param)
    {
        // 应变采集器的值需要计算
        // 手动维护 测点id 和 valuex 之间的关系

        //  YB8-1 ：
        //   key     仪器编号  测点id
        //   value6  29569    58
        //   value7  28427    59

        $_data = $tmpData6 = $tmpData7 = [];
        if ($devicetype == '应变采集器') {
            $value6 = 0;
            $value7 = 0;
            if ($d->value6 != 0) {
                $value6 = $this->strain29569($d->value6);
            }
            if ($d->value7 != 0) {
                $value7 = $this->strain28427($d->value7);
            }
            $tmpData6['point_id'] = 58;

            $tmp6                    = $this->getDataRate($point_id, $value6, $d->date);
            $tmpData6['data1']       = $value6;
            $tmpData6['data1_total'] = $tmp6['data_total'];
            $tmpData6['data1_this']  = $tmp6['data_this'];
            $tmpData6['data1_rate']  = $tmp6['data_rate'];
            $tmpData6['point_name']  = 'YB8-1';
            $tmpData6                = array_merge($tmpData6, $insert_param);

            $tmp7                    = $this->getDataRate('59', $value7, $d->date);
            $tmpData7['data1']       = $value7;
            $tmpData7['data1_total'] = $tmp7['data_total'];
            $tmpData7['data1_this']  = $tmp7['data_this'];
            $tmpData7['data1_rate']  = $tmp7['data_rate'];
            $tmpData7['point_id']    = 59;
            $tmpData7['point_name']  = 'YB8-2';
            $tmpData7                = array_merge($tmpData7, $insert_param);

            $_data = [
                $tmpData6,
                $tmpData7,
            ];
            //file_put_contents('./test.txt',json_encode($last_row).PHP_EOL,FILE_APPEND );
        } else {
            Db::name('exception_log')->insert([
                'message'    => '朝晖设备类型 ：' . $devicetype . "不存在" . '原始数据' . json_encode($d),
                'createtime' => date("Y-m-d H:i:s", time()),
                'site'       => 'app/handle/ZHuiSync:switchParam-378',
            ]);
        }
        return $_data;
    }

    public function switchParamTestStrain($devicetype, $d, $point_id)
    {
        $device = [];

        if ($devicetype == '应变采集器') {

            $value6 = $d->value6 != 0 ? $this->strain29569($d->value6) : 0;
            $value7 = $d->value7 != 0 ? $this->strain28427($d->value7) : 0;

            $tmp6 = $this->getDataRate($point_id, $value6, $d->date, 1);

            $device = [
                'data1'       => $value6,
                'data1_total' => $tmp6['data_total'],
                'data1_this'  => $tmp6['data_this'],
                'data1_rate'  => $tmp6['data_rate'],
            ];

        } else {
            Db::name('exception_log')->insert([
                'message'    => '朝晖设备类型 ：' . $devicetype . "不存在" . '原始数据' . json_encode($d),
                'createtime' => date("Y-m-d H:i:s", time()),
                'site'       => 'app/handle/ZHuiSync:switchParam-378',
            ]);
        }
        return $device;
    }


    /**
     * 获取 累积变，即时变化，日变化
     * @params $point_id 测点id
     * @params $value 应变值
     * @params $datetime 采集时间
     * @return mixed
     *
     */
    public function getDataRate($point_id, $value, $datetime, $type = 0)
    {
        $InitVal  = $this->getInitVal($point_id);  //初始值
        $last_row = $this->getLastRow($datetime, $point_id, $type);   //前一天同一时刻的记录值

        $last_strain = 'lastTotalStrain' . $point_id;

        //第一次取数据库，后面的取上一次的数据
        //存在的问题：测点2 第一次也是从上一次取的取的不是数据库的
        $last_data_total = 0;
        if ($this->$last_strain == 0) {
            $last_total_row  = $this->getLastTotalRow($point_id, $type); //上次累积变化
            $last_data_total = $last_total_row['data1_total'];
        } else {
            $last_data_total = $this->$last_strain;
        }
//        file_put_contents('./test.txt','测点id'.$point_id.PHP_EOL,FILE_APPEND );
//        file_put_contents('./test.txt','应变值'.$value.PHP_EOL,FILE_APPEND );


        // 累积变化=  本次记录值-初始值（第一次）
        // 即时变化 = 本次累计变化-上次累计变化
        //日变化    = 本次记录值-前一天同一时刻的记录值
        $data_total         = $value - !empty($InitVal['first_data1']) ?: 0;
        $data_this          = $data_total - $last_data_total;
        $data_rate          = $value - $last_row['data1'];
        $this->$last_strain = $data_total;

//        file_put_contents('./test.txt','初始值'.$InitVal['first_data1'].PHP_EOL,FILE_APPEND );
//        file_put_contents('./test.txt','累计变化('.$data_total.')=本次记录值('.$value.')-初始值('.$InitVal['first_data1'].')'.PHP_EOL,FILE_APPEND );
//        file_put_contents('./test.txt','即时变化('.$data_this.')=本次累计变化('.$data_total.')-上次累计变化('.$last_data_total.')'.PHP_EOL,FILE_APPEND );
//        file_put_contents('./test.txt','日变化('.$data_rate.')=本次记录值('.$value.')-前一天同一时刻的记录值('.$last_row['data1'].')'.PHP_EOL,FILE_APPEND );


        return [
            'data_total' => $data_total,
            'data_this'  => $data_this,
            'data_rate'  => $data_rate,
        ];
    }

    /**
     * 获取采集仪的设备参数
     *
     */
    public function getMonType($mon_type_id)
    {
        $mon_type = MonTypeModel::get($mon_type_id); //监测内容和传感器名称不对应会有bug
        if (empty($mon_type)) {
            Db::name('exception_log')->insert([
                'message'    => '监测内容id ：' . $mon_type_id . "不存在",
                'createtime' => date("Y-m-d H:i:s", time()),
                'site'       => 'app/handle/ZHuiSync:getMonType-201',
            ]);
            return [];
        }

        $mon_type = $mon_type->toArray();
        //准备物料
        $new_mon_type = [];
        foreach ($mon_type as $k => $v) {
            if (!empty($v)) {
                $new_mon_type[$v] = $k;
            }
        }
        return $new_mon_type;
    }


    /**
     *
     * 入队列（生产者）
     */
    public function enqueue($data = [])
    {
        // 1.当前任务将由哪个类来负责处理。
        //   当轮到该任务时，系统将生成一个该类的实例，并调用其 fire 方法
        $jobHandlerClassName = 'app\job\ZHuiJob';

        // 2.当前任务归属的队列名称，如果为新队列，会自动创建
        $jobQueueName = "ZHuiJobQueue";

        // 3.当前任务所需的业务数据 . 不能为 resource 类型，其他类型最终将转化为json形式的字符串
        //   ( jobData 为对象时，存储其public属性的键值对 )

        // 4.将该任务推送到消息队列，等待对应的消费者去执行
        $isPushed = Queue::push($jobHandlerClassName, $data, $jobQueueName);

        // database 驱动时，返回值为 1|false  ;   redis 驱动时，返回值为 随机字符串|false
        if ($isPushed !== false) {
            echo date('Y-m-d H:i:s') . "一条数据已推送到告警中心\n";
        } else {
            echo '推送出了点问题!!!!';
        }
    }

    /**
     * 查询出所有的设备信息
     *
     */
    public function getDeviceAll()
    {
        //所有的采集仪
        $trans = $this->getTransData();

        $lines = [];
        foreach ($trans as $tran) {
            //所有的线路列表
            $linesTmp = $this->getLineData($tran['transdeviceid']);
            $lines    = array_merge($linesTmp, $lines);
        }

        //所有的设备列表
        $device = [];
        foreach ($lines as $line) {
            $deviceTmp = $this->getDeviceData($line['lineid']);
            $device    = array_merge($deviceTmp, $device);
        }

        return $device;
    }

    /**
     * 查询传感器列表
     *
     */
    public function getTransDataList()
    {
        $trans = $this->getTransData();
        return $trans;
    }

    /**
     *  朝晖应变计的公式计算 29569
     *
     */
    public function strain29569($F1)
    {
        $F0 = 2628;
        return 4.548 * pow(10, -4) * (pow($F0, 2) - pow($F1 / 10, 2));
    }

    /**
     * 应变计的公式计算 28427
     * @param $F1
     * @return float|int
     */
    public function strain28427($F1)
    {
        $F0 = 2629;
        return 4.578 * pow(10, -4) * (pow($F0, 2) - pow($F1 / 10, 2));
    }

    /**
     *  获取同一时刻的记录值
     * @param $record_time 时间
     * @param $point_id int  测点id
     * @return mixed
     *
     */
    public function getLastRow($record_time, $point_id, $type = 0)
    {
        //数据record_time 和 前一天的record_time 有10s内的时间差
//        $last_time = date('Y-m-d H:i:s',strtotime($record_time)-24*60*60);
        $start_time = date('Y-m-d H:i:s', strtotime($record_time) - 24 * 60 * 60 - 10);
        $end_time   = date('Y-m-d H:i:s', strtotime($record_time) - 24 * 60 * 60 + 10);
        $row        = $this->dataModel
            ->where('point_id', $point_id)
            ->where('is_test', $type)
            ->where('record_time', 'between time', [$start_time, $end_time])
            ->find();
        if (empty($row)) {
            return ['data1' => 0, 'data2' => 0, 'data3' => 0, 'data4' => 0, 'data5' => 0];
        }
        $row = $row->toArray();
        return $row;
    }

    /**
     * 获取上次累积变化
     *
     */
    public function getLastTotalRow($point_id, $type = 0)
    {
        $row = $this->dataModel
            ->where('point_id', $point_id)
            ->where('is_test', $type)
            ->order('id', 'desc')
            ->find();
        if (empty($row)) {
            return ['data1_total' => 0];
        }

        if (empty($row->data1_total)) {
            return ['data1_total' => 0];
        }
        $row = $row->toArray();
        return $row;
    }

    /**
     * 获取初始值
     * @param  $point_id 测点id
     * @return mixed
     */
    public function getInitVal($point_id)
    {
        $pointInits = Db::name('point_first')
            ->field('first_data1,first_data2,first_data3,first_data4,first_data5,first_data6,first_data7,first_data8')
            ->where('point_id', $point_id)
            ->where('status', 1)
            ->limit(1)
            ->find();

        if (empty($pointInits)) {
            Db::name('exception_log')->insert([
                'message'    => '初始值不存在 ;测点id：' . $point_id,
                'createtime' => date("Y-m-d H:i:s", time()),
                'site'       => 'app/handle/ZHuiSync:getInitVal-215',
            ]);
        }
        return $pointInits;
    }


    public function syncTestLever($pid, $lineid, $deviceid, $type = false)
    {
//        $a = (($this->getRoundArray($lineid, $deviceid)));
//        pre($a);


        ini_set('max_execution_time', 0);

        $dataModel = new Data();
        $now       = time();
        $total     = 0;

        if (!strstr($dataModel->getTable(), $this->config['mark'])) {
            $dataModel->setTable($dataModel->getTable() . '_' . $this->config['mark']);
        }

        $this->dataModel = $dataModel;

        $result = $this->getRoundArray($pid, $lineid, $deviceid);

        $point = PointModel::get([
            'company_id' => $this->config['company_id'],
            'card'       => $lineid,
            'port'       => $deviceid,
            'is_test'    => 1,
            'id'         => $pid
        ]);


//        if($type){
//
//            $jsonTestData = [
//                'json'    => json_encode($result),
//                'is_test' => 1,
//                'ybj'     => 1,
//            ];
//
//
//        }else{
//            $jsonTestData = [
//                'json'    => json_encode($result),
//                'is_test' => 1,
//            ];
//        }
//
//        //添加测试数据记录
//        Db::name('json_test')->insert($jsonTestData);

        if (!empty($result)) {

            foreach ($result as $key => $d) {

                if ($type) {
                    $insert_rows = [];

                    $lastTotalStrain = 'lastTotalStrain' . $point->id;

                    $this->$lastTotalStrain = 0;

                    $switchParams = $this->switchParamTestStrain($d['devicetype'], json_decode(json_encode($d)), $point->id);

                    $insert_param = [
                        'createtime'          => $now,
                        'point_id'            => $point->id,
                        'project_mon_type_id' => $point->project_mon_type_id,
                        'dev_type'            => $point->sensor_id,//传感器类型：传感器id
                        'data'                => json_encode($d),
                        'mon_type'            => $point->mon_type_id,
                        'dev_id'              => $point->dev_id, //采集仪id
                        'record_time'         => $d['date'],
                        'upload_code'         => $d['lineid'] . '#' . $d['deviceid'],
                        'point_name'          => $point->point_code, //测点名称
                        'is_test'             => 1
                    ];

                } else {

                    //前一天同一时刻的记录值  (同一测点:时间为前一天同一时刻的记录值)
                    $last_row = $this->getLastRow($d['date'], $point->id, 1);

                    //data表中需要的参数： 告警状态
                    $switchParams = $this->switchParam($d['devicetype'], json_decode(json_encode($d)), $point->mon_type_id, $last_row);

                    //若已存在，即更新;若不存在，即插入
                    $insert_param = [
                        'createtime'          => $now,
                        'point_id'            => $point->id,
                        'project_mon_type_id' => $point->project_mon_type_id,
                        'dev_type'            => $point->sensor_id,//传感器类型：传感器id
                        'data'                => json_encode($d),
                        'mon_type'            => $point->mon_type_id,
                        'point_name'          => $point->point_code, //测点名称
                        'dev_id'              => $point->dev_id, //采集仪id
                        'record_time'         => $d['date'],
                        'upload_code'         => $d['lineid'] . '#' . $d['deviceid'],
                        'is_test'             => 1
                    ];
                }

                $insert_rows[] = array_merge($insert_param, $switchParams);
                $total++;
            }


            if (!empty($insert_rows)) {
                $res = $dataModel->saveAll($insert_rows);

                $okData = collection($res)->toArray();

                ////判断是否超过阈值
                foreach ($okData as $k => $v) {
                    $this->enqueue(json_encode($v));
                }

            }

        }

        return $total;
    }

    public function getRoundArray($pid, $lineid, $deviceid)
    {

        $pointInfo = Db::name('point')->where(['id' => $pid, 'card' => $lineid, 'port' => $deviceid, 'is_test' => 1])->find();

        $array = [
            'date'       => date('Y-m-d H:i:s'),
            'deviceid'   => $deviceid,
            'devicename' => $pointInfo['addr'],
            'devicetype' => $pointInfo['sensor_name'],
            'is_online'  => 1,
            'lineid'     => $lineid,
            'linename'   => $pointInfo['sensor_name'],
            'value1'     => 0,
            'value2'     => 0,
            'value3'     => 0,
            'value4'     => 0,
            'value5'     => 0,
            'value6'     => 0,
            'value7'     => 0,
            'value8'     => 0,
            'value9'     => 0,
        ];


        switch ($pointInfo['sensor_name']) {
            case '静力水准仪':
                $array['value1'] = $this->randomNumber($pointInfo['id'], '液位值', (number_format(lcg_rand_float(600, 640), 2, '.', '')), 630, 600);
                $array['value2'] = $this->randomNumber($pointInfo['id'], '温度值', (number_format(lcg_rand_float(25, 30), 2, '.', '')), 28, 25);
                $array['value3'] = $this->randomNumber($pointInfo['id'], '累计沉降', (number_format(lcg_rand_float(-4.5, 4.5), 2, '.', '')), 1, -1);
                $array['value4'] = $this->randomNumber($pointInfo['id'], '即时沉降', (number_format(lcg_rand_float(-0.45, 0.45), 2, '.', '')), 0.12, -0.12);
                break;
            case '倾角传感器':
                $array['value1'] = $this->randomNumber($pointInfo['id'], 'X 上传值', (number_format(lcg_rand_float(-1.5, 1.5), 2, '.', '')), 0.24, -0.24);
                $array['value2'] = $this->randomNumber($pointInfo['id'], 'Y 上传值', (number_format(lcg_rand_float(-1.5, 1.5), 2, '.', '')), 0.24, -0.24);
                $array['value3'] = $this->randomNumber($pointInfo['id'], 'X 累计变化', (number_format(lcg_rand_float(-0.6, 0.6), 2, '.', '')), 0.12, -0.12);
                $array['value4'] = $this->randomNumber($pointInfo['id'], 'Y 累计变化', (number_format(lcg_rand_float(-0.6, 0.6), 2, '.', '')), 0.12, -0.12);
                $array['value5'] = $this->randomNumber($pointInfo['id'], 'X 即时变化', (number_format(lcg_rand_float(-0.9, 0.9), 3, '.', '')), 0.8, -0.8);
                $array['value6'] = $this->randomNumber($pointInfo['id'], 'Y 即时变化', (number_format(lcg_rand_float(-0.9, 0.9), 3, '.', '')), 0.8, -0.8);
                break;
            case '裂缝计':
                $array['value1'] = $this->randomNumber($pointInfo['id'], '上传值', (number_format(lcg_rand_float(1, 10), 2, '.', '')), 1, 10);
                $array['value2'] = $this->randomNumber($pointInfo['id'], '累计变化', (number_format(lcg_rand_float(-1.2, 1.2), 2, '.', '')), 0.5, -0.5);
                $array['value3'] = $this->randomNumber($pointInfo['id'], '即时变化', (number_format(lcg_rand_float(-2.2, 2.2), 2, '.', '')), 1, -1);
                break;
            case '应变计':
                $array['devicetype'] = "应变采集器";
                $array['value6']     = $this->randomNumber($pointInfo['id'], '应变值', (number_format(lcg_rand_float(1400, 1700), 2, '.', '')), 1400, 1700);
                //$array['value7']     = $this->randomNumber($pointInfo['id'],'即使变化',(number_format(lcg_rand_float(-110,600), 2, '.', '')),-110,600);
                break;
            default:
                break;
        }
        $array = [0 => $array];

        return $array;


    }


    public function randomNumber($point_id, $item_name, $rand, $max = 1, $min = -1)
    {

        $redis = new \Redis();
        $redis->connect('127.0.0.1', '6379');
        $redis->select(1);

        $info = PointAlarm::get(['point_id' => $point_id, 'item_name' => $item_name]);
        if (!$info) {
            return number_format(lcg_rand_float($min, $max), 2, '.', '');
        }
        $hashKey   = $info->item . '-' . $point_id;
        $itemRedis = $redis->hGetAll($hashKey);

        if (!$itemRedis) {
            $redis->hMSet($hashKey, [
                'total'              => 0,
                'normal'             => 0,
                'normal_percentage'  => 0,
                'control'            => 0,
                'control_percentage' => 0,
                'warn'               => 0,
                'warn_percentage'    => 0,
                'error'              => 0,
                'error_percentage'   => 0,
            ]);
        }

        if ($redis->hGet($hashKey, 'total') < 100) {

            $this->percentage($redis, $hashKey, 'normal', 'normal_percentage');

            //默认100以内都生成正常传感器数据
            return number_format(lcg_rand_float($min, $max), 2, '.', '');
        }

        //获取报警阀值范围
        $pointAlarm = Db::name('point_alarm')->where(['point_id' => $point_id, 'item_name' => $item_name, 'state' => 1])->select();

        if (!$pointAlarm) {

            $this->percentage($redis, $hashKey, 'normal', 'normal_percentage');

            foreach (['control_percentage' => 'control', 'warn_percentage' => 'warn', 'error_percentage' => 'error'] as $key => $value) {
                $normal_percentage = number_format($redis->hGet($hashKey, $value) / $redis->hGet($hashKey, 'total'), 3, '.', '');
                $redis->hSet($hashKey, $key, $normal_percentage);
            }

            //超过100但无阀值生成正常传感器数据
            return number_format(lcg_rand_float($min, $max), 2, '.', '');
        }

        foreach ($pointAlarm as $val) {

            if (!strstr($val['control'], '~') || !strstr($val['warn'], '~') || !strstr($val['error'], '~')) {
                //超过100但未设置阀值生成正常传感器数据
                return number_format(lcg_rand_float($min, $max), 2, '.', '');
            }


            $controlMin = abs(explode('~', $val['control'])[0]);
            $controlMax = abs(explode('~', $val['control'])[1]);
            $warnMax    = abs(explode('~', $val['warn'])[1]);
            $warnMin    = abs(explode('~', $val['warn'])[0]);
            $errorMax   = abs(explode('~', $val['error'])[1]);
            $errorMin   = abs(explode('~', $val['error'])[0]);

            switch ($rand) {

                /*合格*/
                case ($controlMin > $rand) && (-$controlMin < $rand):
                    $this->percentage($redis, $hashKey, 'normal', 'normal_percentage');

                    foreach (['control_percentage' => 'control', 'warn_percentage' => 'warn', 'error_percentage' => 'error'] as $key => $value) {
                        $normal_percentage = number_format($redis->hGet($hashKey, $value) / $redis->hGet($hashKey, 'total'), 3, '.', '');
                        $redis->hSet($hashKey, $key, $normal_percentage);
                    }


                    break;

                /*蓝色预警*/
                case ($controlMax >= $rand && $rand > $controlMin) || (-$controlMax < $rand && $rand < -$controlMin):
                    if ($redis->hGet($hashKey, 'control_percentage') < '0.1') {
                        $this->percentage($redis, $hashKey, 'control', 'control_percentage');

                        foreach (['normal_percentage' => 'normal', 'warn_percentage' => 'warn', 'error_percentage' => 'error'] as $key => $value) {
                            $normal_percentage = number_format($redis->hGet($hashKey, $value) / $redis->hGet($hashKey, 'total'), 3, '.', '');
                            $redis->hSet($hashKey, $key, $normal_percentage);
                        }


                    } else {
                        $this->percentage($redis, $hashKey, 'normal', 'normal_percentage');
                        $rand = number_format(lcg_rand_float(-$controlMin, $controlMin), 2, '.', '');

                        foreach (['control_percentage' => 'control', 'warn_percentage' => 'warn', 'error_percentage' => 'error'] as $key => $value) {
                            $normal_percentage = number_format($redis->hGet($hashKey, $value) / $redis->hGet($hashKey, 'total'), 3, '.', '');
                            $redis->hSet($hashKey, $key, $normal_percentage);
                        }


                    }
                    break;

                /*橙色预警*/
                case ($warnMax >= $rand && $rand > $warnMin) || (-$warnMax < $rand && $rand < -$warnMin) :
                    if ($redis->hGet($hashKey, 'warn_percentage') < '0.03') {
                        $this->percentage($redis, $hashKey, 'warn', 'warn_percentage');

                        foreach (['normal_percentage' => 'normal', 'control_percentage' => 'control', 'error_percentage' => 'error'] as $key => $value) {
                            $normal_percentage = number_format($redis->hGet($hashKey, $value) / $redis->hGet($hashKey, 'total'), 3, '.', '');
                            $redis->hSet($hashKey, $key, $normal_percentage);
                        }


                    } else {
                        $this->percentage($redis, $hashKey, 'warn', 'normal_percentage');
                        $rand = number_format(lcg_rand_float(-$controlMin, $controlMin), 2, '.', '');

                        foreach (['control_percentage' => 'control', 'warn_percentage' => 'warn', 'error_percentage' => 'error'] as $key => $value) {
                            $normal_percentage = number_format($redis->hGet($hashKey, $value) / $redis->hGet($hashKey, 'total'), 3, '.', '');
                            $redis->hSet($hashKey, $key, $normal_percentage);
                        }
                    }

                    break;

                /*红色预警*/
                case ($errorMin < $rand) || (-$errorMin > $rand) :

                    if ($redis->hGet($hashKey, 'error_percentage') < '0.01') {
                        $this->percentage($redis, $hashKey, 'error', 'error_percentage');

                        foreach (['normal_percentage' => 'normal', 'control_percentage' => 'control', 'warn_percentage' => 'warn'] as $key => $value) {
                            $normal_percentage = number_format($redis->hGet($hashKey, $value) / $redis->hGet($hashKey, 'total'), 3, '.', '');
                            $redis->hSet($hashKey, $key, $normal_percentage);
                        }


                    } else {
                        $this->percentage($redis, $hashKey, 'normal', 'normal_percentage');
                        $rand = number_format(lcg_rand_float(-$controlMin, $controlMin), 2, '.', '');

                        foreach (['control_percentage' => 'control', 'warn_percentage' => 'warn', 'error_percentage' => 'error'] as $key => $value) {
                            $normal_percentage = number_format($redis->hGet($hashKey, $value) / $redis->hGet($hashKey, 'total'), 3, '.', '');
                            $redis->hSet($hashKey, $key, $normal_percentage);
                        }
                    }

                    break;

            }

        }

        return $rand;

    }

    public function percentage($redis, $hashKey, $value, $percentage)
    {
        $redis->hIncrBy($hashKey, $value, 1);
        $redis->hIncrBy($hashKey, 'total', 1);

        $normal_percentage = number_format($redis->hGet($hashKey, $value) / $redis->hGet($hashKey, 'total'), 3, '.', '');

        $redis->hSet($hashKey, $percentage, $normal_percentage);

    }


}
