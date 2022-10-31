<?php

namespace app\handlers;


use app\admin\model\Data;
use app\admin\model\Point as PointModel;
use app\admin\model\MonType as MonTypeModel;
use think\Db;
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
     *@params $lineid 线路id
     *@params $deviceid 设备id
     *@return string
     */
    public function syncLever($lineid,$deviceid)
    {
        ini_set('max_execution_time',0);
        $dataModel = new Data();

       $has =  strstr($dataModel->getTable(),$this->config['mark']);
       if(!$has){
           $dataModel->setTable($dataModel->getTable(). '_' . $this->config['mark'] );
       }

       $this->dataModel = $dataModel;
        $oldData   = $dataModel
            ->where('upload_code',$lineid.'#'.$deviceid)
            ->order('id', 'desc')
            ->limit(1)
            ->select();
        if(empty($oldData)){
            $startTime =  '2021-10-15 16:21:00';
        }else{
            $startTime = date("Y-m-d H:i:s", strtotime($oldData[0]->record_time)+1);
        }

        $now     = time();
        $options = [
            'lineid'    =>$lineid,
            'deviceid'  =>$deviceid,
            'startTime' =>$startTime,
        ];

        $result = $this->getLeverData($options);

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
                    //前一天同一时刻的记录值  (同一测点:时间为前一天同一时刻的记录值)
                    $last_row = $this->getLastRow($d->date,$point->id);

                    //data表中需要的参数： 告警状态
                    $switchParams = $this->switchParam($d->devicetype,$d,$point->mon_type_id,$last_row);

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
//                foreach ($res as $k=>$v)
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
     *@params $lineid 线路id
     *@params $deviceid 设备id
     *@return string
     */
    public function syncLeverStrain($lineid,$deviceid)
    {
        ini_set('max_execution_time',0);
        $dataModel = new Data();

        $has =  strstr($dataModel->getTable(),$this->config['mark']);
        if(!$has){
            $dataModel->setTable($dataModel->getTable(). '_' . $this->config['mark'] );
        }
        //初始化 测点 手动维护 拼接的是测点id
        $this->lastTotalStrain58 = 0;
        $this->lastTotalStrain59 = 0;

        $this->dataModel = $dataModel;
        $oldData   = $dataModel
            ->where('upload_code',$lineid.'#'.$deviceid)
            ->order('id', 'desc')
            ->limit(1)
            ->select();
        if(empty($oldData)){
            $startTime =  '2021-10-15 16:21:00';
        }else{
            $startTime = date("Y-m-d H:i:s", strtotime($oldData[0]->record_time)+1);
        }

        $now     = time();
        $options = [
            'lineid'    =>$lineid,
            'deviceid'  =>$deviceid,
            'startTime' =>$startTime,
        ];

        $result = $this->getLeverData($options);

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

                $startTime = $endTime;

                $result  = $this->getLeverData($options);

                //point_id测点id  项目检测内容id
                $point = PointModel::get([
                    'company_id' => $this->config['company_id'],
                    'card'       => $lineid,
                    'port'       => $deviceid
                ]);
                foreach ($result as $key => $d) {

                    //若已存在，即更新;若不存在，即插入
                    $insert_param = [
                        'createtime'           => $now,
                        'project_mon_type_id'  => $point->project_mon_type_id,
                        'dev_type'             => $point->sensor_id,//传感器类型：传感器id
                        'data'                 => json_encode($d),
                        'mon_type'             => $point->mon_type_id,
                        'dev_id'               => $point->dev_id, //采集仪id
                        'record_time'          => $d->date,
                        'upload_code'          => $d->lineid.'#'.$d->deviceid ,
                    ];

                    //data表中需要的参数： 告警状态
                    $insert_rows = array_merge($insert_rows,$this->switchParamStrain($d->devicetype,$d,$point->id,$insert_param));
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
                    $this->enqueue(json_encode($v));
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
     * @params $last_row  上一条的记录值
     * @return mixed    e.g: ['data1'=> 9.123021]
     */
    public function switchParam( $devicetype,$d ,$mon_type_id,$last_row)
    {
//        file_put_contents('./test.txt',json_encode($last_row).PHP_EOL,FILE_APPEND );
        $tmpData = [];
        if( $devicetype == '静力水准仪' ){
            $mon_type = $this->getMonType($mon_type_id);
            //需要返回什么东西
            $tmpData[$mon_type['液位值']]    = $d->value1;
            $tmpData[$mon_type['温度值']]    = $d->value2;
            $tmpData[$mon_type['累计沉降']]  = $d->value3;
            $tmpData[$mon_type['即时沉降']]  = $d->value4;
            //日变化：本次记录值-前一天同一时刻的记录值
            $tmpData[$mon_type['日变化']]  =  $d->value1 - ($last_row[ $mon_type['液位值']]);
        }elseif( $devicetype == '有线倾角传感器' || $devicetype == '倾角传感器'){
            $mon_type = $this->getMonType($mon_type_id);
            //需要返回什么东西
            $tmpData[$mon_type['X 上传值']]    = $d->value1;
            $tmpData[$mon_type['Y 上传值']]    = $d->value2;
            $tmpData[$mon_type['X 累计变化']]  = $d->value3;
            $tmpData[$mon_type['X 日变化']]  =  $d->value1 - ($last_row[ $mon_type['X 上传值']]);
            $tmpData[$mon_type['Y 累计变化']]  = $d->value4;
            $tmpData[$mon_type['X 即时变化']]  = $d->value5;
            $tmpData[$mon_type['Y 即时变化']]  = $d->value6;
            $tmpData[$mon_type['Y 日变化']]  = $d->value2 - ($last_row[ $mon_type['Y 上传值']]);
        }elseif( $devicetype == '裂缝计'){
            $mon_type = $this->getMonType($mon_type_id);
            //需要返回什么东西
            $tmpData[$mon_type['上传值']]      = $d->value1;
            $tmpData[$mon_type['累计变化']]    = $d->value2;
            $tmpData[$mon_type['即时变化']]    = $d->value3;
            $tmpData[$mon_type['日变化']]      = $d->value1 - ($last_row[ $mon_type['上传值']]);
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
     * 应变计 对接不同的参数
     * @params $devicetype 设备类型
     * @params $deviceid 设备id
     * @params $d  接口返回的数据
     * @params $mon_type_id  监测内容id
     * @params $point_id  测点id
     * @params $insert_param  公共参数
     * @return mixed
     */
    public function switchParamStrain( $devicetype,$d ,$point_id,$insert_param)
    {
        // 应变采集器的值需要计算
        // 手动维护 测点id 和 valuex 之间的关系

        //  YB8-1 ：
        //   key     仪器编号  测点id
        //   value6  29569    58
        //   value7  28427    59

        $_data = $tmpData6 = $tmpData7 = [];
     if( $devicetype == '应变采集器'){
            $value6 = 0;
            $value7 = 0;
            if($d->value6 != 0){
                $value6 = $this->strain29569($d->value6);
            }
            if($d->value7 != 0){
                $value7 = $this->strain28427($d->value7);
            }
             $tmpData6['point_id']     = 58;

            $tmp6 = $this->getDataRate($point_id,$value6,$d->date);
             $tmpData6['data1']    = $value6;
             $tmpData6['data1_total']  = $tmp6['data_total'];
             $tmpData6['data1_this']   =  $tmp6['data_this'];
             $tmpData6['data1_rate']   = $tmp6['data_rate'];
             $tmpData6['point_name']   = 'YB8-1';
             $tmpData6 = array_merge($tmpData6,$insert_param);

             $tmp7 = $this->getDataRate('59',$value7,$d->date);
             $tmpData7['data1']    = $value7;
             $tmpData7['data1_total']  = $tmp7['data_total'];
             $tmpData7['data1_this']   =  $tmp7['data_this'];
             $tmpData7['data1_rate']   = $tmp7['data_rate'];
             $tmpData7['point_id']     = 59;
             $tmpData7['point_name']   = 'YB8-2';
             $tmpData7 = array_merge($tmpData7,$insert_param);

                 $_data = [
                     $tmpData6,
                     $tmpData7,
                 ];
        //file_put_contents('./test.txt',json_encode($last_row).PHP_EOL,FILE_APPEND );
        }else{
            Db::name('exception_log')->insert([
                'message'    => '朝晖设备类型 ：'.$devicetype ."不存在",
                'createtime' => date("Y-m-d H:i:s",time()),
                'site'       =>'app/handle/ZHuiSync:switchParam-190' ,
            ]);
        }
        return $_data;
    }

    /**
     * 获取 累积变，即时变化，日变化
     * @params $point_id 测点id
     * @params $value 应变值
     * @params $datetime 采集时间
     * @return mixed
     *
     */
    public function getDataRate($point_id,$value,$datetime)
    {
        $InitVal         = $this->getInitVal($point_id);  //初始值
        $last_row        = $this->getLastRow($datetime,$point_id);   //前一天同一时刻的记录值

        $last_strain = 'lastTotalStrain'.$point_id;

        //第一次取数据库，后面的取上一次的数据
        //存在的问题：测点2 第一次也是从上一次取的取的不是数据库的
        $last_data_total = 0;
        if($this->$last_strain == 0){
            $last_total_row  = $this->getLastTotalRow($point_id); //上次累积变化
            $last_data_total = $last_total_row['data1_total'];
        }else{
            $last_data_total = $this->$last_strain;
        }
//        file_put_contents('./test.txt','测点id'.$point_id.PHP_EOL,FILE_APPEND );
//        file_put_contents('./test.txt','应变值'.$value.PHP_EOL,FILE_APPEND );


        // 累积变化=  本次记录值-初始值（第一次）
        // 即时变化 = 本次累计变化-上次累计变化
        //日变化    = 本次记录值-前一天同一时刻的记录值
        $data_total = $value - $InitVal['first_data1'];
        $data_this  = $data_total - $last_data_total;
        $data_rate  = $value - $last_row['data1'];
        $this->$last_strain = $data_total;

//        file_put_contents('./test.txt','初始值'.$InitVal['first_data1'].PHP_EOL,FILE_APPEND );
//        file_put_contents('./test.txt','累计变化('.$data_total.')=本次记录值('.$value.')-初始值('.$InitVal['first_data1'].')'.PHP_EOL,FILE_APPEND );
//        file_put_contents('./test.txt','即时变化('.$data_this.')=本次累计变化('.$data_total.')-上次累计变化('.$last_data_total.')'.PHP_EOL,FILE_APPEND );
//        file_put_contents('./test.txt','日变化('.$data_rate.')=本次记录值('.$value.')-前一天同一时刻的记录值('.$last_row['data1'].')'.PHP_EOL,FILE_APPEND );


        return [
            'data_total' => $data_total,
            'data_this' => $data_this,
            'data_rate' => $data_rate,
        ];
    }

    /**
     * 获取采集仪的设备参数
     *
     */
    public function getMonType($mon_type_id)
    {
        $mon_type = MonTypeModel::get($mon_type_id); //监测内容和传感器名称不对应会有bug
        if(empty($mon_type)){
            Db::name('exception_log')->insert([
                'message'    => '监测内容id ：'.$mon_type_id ."不存在",
                'createtime' => date("Y-m-d H:i:s",time()),
                'site'       =>'app/handle/ZHuiSync:getMonType-201' ,
            ]);
            return [];
        }

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


    /**
     *
     * 入队列（生产者）
     */
    public function enqueue($data = [] )
    {
        // 1.当前任务将由哪个类来负责处理。
        //   当轮到该任务时，系统将生成一个该类的实例，并调用其 fire 方法
        $jobHandlerClassName  = 'app\job\ZHuiJob';

        // 2.当前任务归属的队列名称，如果为新队列，会自动创建
        $jobQueueName  	  = "ZHuiJobQueue";

        // 3.当前任务所需的业务数据 . 不能为 resource 类型，其他类型最终将转化为json形式的字符串
        //   ( jobData 为对象时，存储其public属性的键值对 )

            // 4.将该任务推送到消息队列，等待对应的消费者去执行
            $isPushed = Queue::push( $jobHandlerClassName , $data , $jobQueueName );

            // database 驱动时，返回值为 1|false  ;   redis 驱动时，返回值为 随机字符串|false
            if( $isPushed !== false ){
                echo date('Y-m-d H:i:s') . "一条数据已推送到告警中心\n";
            }else{
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
        foreach ($trans as $tran){
            //所有的线路列表
            $linesTmp = $this->getLineData($tran['transdeviceid']);
            $lines = array_merge($linesTmp, $lines);
        }

        //所有的设备列表
        $device = [];
        foreach ($lines as $line){
            $deviceTmp = $this->getDeviceData($line['lineid']);
            $device = array_merge($deviceTmp, $device);
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
        return 4.548 * pow(10,-4) * ( pow($F0,2)- pow($F1/10,2) );
    }

    /**
     * 应变计的公式计算 28427
     * @param $F1
     * @return float|int
     */
    public function strain28427($F1)
    {
        $F0 = 2629;
        return 4.578 * pow(10,-4) * ( pow($F0,2)-pow($F1/10,2) );
    }

    /**
     *  获取同一时刻的记录值
     * @param $record_time 时间
     * @param $point_id int  测点id
     * @return mixed
     *
     */
    public function getLastRow($record_time,$point_id)
    {
        //数据record_time 和 前一天的record_time 有10s内的时间差
        $last_time = date('Y-m-d H:i:s',strtotime($record_time)-24*60*60);;
        $row = $this->dataModel
            ->where('point_id',$point_id)
//            ->where('record_time',$last_time)
            ->where('record_time','between time',[$last_time-10,$last_time+10])
            ->find();
        if(empty($row)){
            return ['data1'=>0,'data2'=>0,'data3'=>0,'data4'=>0,'data5'=>0];
        }
        $row = $row->toArray();
        return $row;
    }

    /**
     * 获取上次累积变化
     *
     */
    public function getLastTotalRow($point_id)
    {
        $row = $this->dataModel
            ->where('point_id',$point_id)
            ->order('id', 'desc')
            ->find();
        if(empty($row)){
            return ['data1_total'=>0];
        }

        if (empty($row->data1_total)){
            return ['data1_total'=>0];
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
            ->where('point_id',$point_id)
            ->where('status',1)
            ->limit(1)
            ->find();

        if(empty($pointInits)){
            Db::name('exception_log')->insert([
                'message'    => '初始值不存在 ;测点id：'.$point_id ,
                'createtime' => date("Y-m-d H:i:s",time()),
                'site'       =>'app/handle/ZHuiSync:getInitVal-215' ,
            ]);
        }
        return $pointInits;
    }


}
