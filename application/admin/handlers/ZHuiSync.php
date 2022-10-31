<?php

namespace app\admin\handlers;

use app\admin\model\Data;
use app\admin\model\Point as PointModel;
use app\admin\model\MonType as MonTypeModel;
use think\Db;


/**
 *  朝晖
 * 拉取数据，存储到本地
 * @package app\admin\handler
 */

trait ZHuiSync
{
    /**
     * 同步传感器数据
     *
     * @return string
     */
    public function syncLever()
    {
        ini_set('max_execution_time',0);
        $dataModel = new Data();
        $dataModel->setTable($dataModel->getTable(). '_' . $this->config['mark'] );

        $oldData   = $dataModel->order('id', 'desc')->limit(1)->select();
        if(empty($oldData)){
            $startTime =  '2021-10-15 16:21:00';
        }else{
            $startTime = $oldData[0];
        }
        $now       = time();

        //需要准备的参数
        $lineid   = 1;
        $deviceid = 1;

        $options = [
            'lineid'    =>$lineid,
            'deviceid'  =>$deviceid,
            'startTime' =>$startTime,
        ];

        $result = $this->getLeverData($options);
//        halt($result);

        //算出总数
        $interval  = 5*60; //每5分钟 拉取1次数据
        $page_size = 1000;
        $total     = (int)ceil(($now-strtotime($startTime)) / $interval);
        $page_num  = (int)ceil($total / $page_size);


        $total = 0;
        if (!empty($result)) {
            //以时间的间隔来排序  2天的时间    5分钟一次数据，2天是 576
            $insert_rows = [];
            $update_rows = [];

//            DB::table($dataModel->getTable(). '_' . $this->config['mark'] )->delete();//清空数据表

            // 以1000条为一页进行分页查找，并插入
            for ($i = 1; $i <= $page_num; $i++) {
                $endTime = strtotime($startTime) + $page_size*5*60;
                $endTime =  date("Y-m-d H:i:s",$endTime);
                $options = [
                    'lineid'    =>  $lineid,
                    'deviceid'  =>  $deviceid,
                    'startTime' =>  $startTime,
                    'endTime'   =>  $endTime,
                ];
        ####       debug 时间间隔
//                var_dump($startTime);echo "</br>";
//                var_dump($endTime);echo "</br>";
//                echo "<hr/>";

                $startTime = $endTime;

                $result  = $this->getLeverData($options);

                //point_id测点id  项目检测内容id
                $point = PointModel::get([
                    'company_id' => $this->config['company_id'],
                    'card'       => $lineid,
                    'port'       => $deviceid
                ]);
                foreach ($result as $key => $d) {
                    //data表中需要的参数： 告警状态
                    $switchParams = $this->switchParam($d->devicetype,$d);
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
                        ];

                    $insert_rows[]  = array_merge($insert_param,$switchParams);
                    $total++;
                }
            }

            if (!empty($insert_rows))
            {
                $res = $dataModel->saveAll($insert_rows);
                $okData =collection($res)->toArray();

                ////判断是否超过阈值
                foreach ($okData as $k=>$v)
                {
                    $dataModel->compare($v,$v['id']);
                }

            }
        }
        return $total;
    }

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
     * @return mixed
     */
    public function switchParam( $devicetype,$d ,$mon_type_id)
    {
        $tmpData = [];
        if( $devicetype == '静力水准仪' ){
            $mon_type = $this->getMonType($mon_type_id);
            //需要返回什么东西
            $tmpData[$mon_type['液位值']]    = $d->value1;
            $tmpData[$mon_type['温度值']]    = $d->value2;
            $tmpData[$mon_type['累计沉降']]  = $d->value3;
            $tmpData[$mon_type['即时沉降']]  = $d->value4;
        }elseif( $devicetype == '有线倾角传感器' || $devicetype == '倾角传感器'){
            $mon_type = $this->getMonType($mon_type_id);
            //需要返回什么东西
            $tmpData[$mon_type['X 上传值']]    = $d->value1;
            $tmpData[$mon_type['Y 上传值']]    = $d->value2;
            $tmpData[$mon_type['X 累计变化']]  = $d->value3;
            $tmpData[$mon_type['Y 累计变化']]  = $d->value4;
            $tmpData[$mon_type['X 即时变化']]  = $d->value5;
            $tmpData[$mon_type['Y 即时变化']]  = $d->value6;
        }elseif( $devicetype == '裂缝计'){
            $mon_type = $this->getMonType($mon_type_id);
            //需要返回什么东西
            $tmpData[$mon_type['上传值']]      = $d->value1;
            $tmpData[$mon_type['累计变化']]    = $d->value2;
            $tmpData[$mon_type['即时变化']]    = $d->value3;
        }elseif( $devicetype == '应变采集器'){
            $mon_type = $this->getMonType($mon_type_id);
            //应变采集器的值需要计算

            //YB8-1 ：
            //   value6  29569 仪器编号
            //   value7  28427 仪器编号
            $value6 = 0;
            if($d->value6 != 0){
                $value6 = $this->strain29569($d->value6);
            }
            $value7 = 0;
            if($d->value7 != 0){
                $value7 = $this->strain28427($d->value7);
            }

            $tmpData[$mon_type['应变值1']]    = $value6;
            $tmpData[$mon_type['应变值2']]    = $value7;
        }else{
            Db::name('exception_log')->insert([
                'message'    => '朝晖设备类型 ：'.$devicetype ."不存在",
                'createtime' => date("Y-m-d H:i:s",time()),
                'site'       =>'app/handle/ZHuiSync:switchParam-190' ,
            ]);
        }
        return $tmpData;
    }

    /**
     * 获取采集仪的设备参数
     *
     */
    public function getMonType($mon_type_name)
    {
        $mon_type = MonTypeModel::get(['mon_type_name' => $mon_type_name]);
        $mon_type = $mon_type ->toArray();

        //准备物料
        $new_mon_type = [];
        foreach ($mon_type as $k=>$v)
        {
            if(!empty($v))
            {
                $new_mon_type[$v] = $k;
            }
        }
        return $new_mon_type;
    }




}
