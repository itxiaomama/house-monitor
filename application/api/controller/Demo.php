<?php

namespace app\api\controller;

use app\admin\model\engineering\ProjectMonType as ProjectMonTypeModel;
use app\common\controller\Api;
use app\console\common\CommandProcess;
use Exception;
use think\Db;
use think\exception\PDOException;
use think\exception\ValidateException;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use app\api\model\ConfigApi as ConfigApiModel;
use app\handlers\ZHuiHandler;
use app\admin\model\Data as DataModel;
use think\Queue;


/**
 * 测试
 *
 * @icon fa fa-circle-o
 */
class Demo extends Api
{
    protected $noNeedLogin = ['*'];
    protected $noNeedRight = ['*'];


    /**
     * 测试数据的同步
     *
     */
    public function sync()
    {
//
//        $config  = ConfigApiModel::get(1);
//        $client  = new ZHuiHandler($config);
//        $handler = $client->syncLever($startTime = "2021-10-19 08:00:00");



        //获取所有的配置
//        $configs = ConfigApiModel::all();
//        foreach ($configs as $key => $config)
//        {
//            $msg = CommandProcess::syncMultiLever($config);
//        }



        //测试日变量
        $record_time = "2022-01-05 14:55:10";
        $point_id = 51;
        $last_time = date('Y-m-d H:i:s',strtotime($record_time)-24*60*60);
        $start_time = date('Y-m-d H:i:s',strtotime($record_time)-24*60*60-10); //2022-01-04 14:55:00
        $end_time   = date('Y-m-d H:i:s',strtotime($record_time)-24*60*60+10);
        $row = Db::name('data_zh')
            ->where('point_id',$point_id)
            ->where('record_time','between time',[$start_time,$end_time])
            ->find();
        halt($row);


    }

    /**
     * 同步部分单个单个测点的数据
     *
     */
    public function syncOne()
    {
        $config  = ConfigApiModel::get(1);
        $client  = new ZHuiHandler($config);

        $lineid = 5;
        $deviceid = "800001";
        $handler = $client->syncLever($lineid, $deviceid);


        halt($handler);

    }


    /**
     * 测试队列的数据是否执行正常
     */
    public function go()
    {
//       $data =  [
//           "id" => 35678,
//           "upload_code" => "1#1",
//           "data1" => "657.00262451172",
//           "data1_this" =>  "0",
//           "data1_total" =>  "0",
//           "data1_rate" =>  "",
//           "data2" => "24.627182006836",
//           "data2_this" =>  "",
//           "data2_total" => NULL,
//           "data2_rate" =>  "",
//           "data3" =>  "",
//           "data3_this" =>  "",
//           "data3_total" => NULL,
//           "data3_rate" => "",
//           "data4" => "",
//           "data4_this" => "",
//           "data4_total" => NULL,
//           "data4_rate" => "",
//           "data5" =>  "",
//           "data5_this" =>  "",
//           "data5_total" => NULL,
//           "data5_rate" =>  "",
//           "param1" => "",
//           "updatetime" => 1636437327,
//           "alarm_state" => 1,
//           "createtime" => 1636437325,
//           "dev_id" => 8,
//           "volt" => "",
//           "record_time" =>  "2021-11-04 17:10:09",
//           "point_name" => "CJ-01",
//           "mon_type" => 123,
//           "depth" => 0,
//           "dev_type" => 3,
//           "control" => NULL,
//           "project_mon_type_id" => 69,
//           "point_id" => 51,
//           "enable" => 0,
//       ];

        $data = Db::name('data_zh')
            ->where('point_name','CJ-01')
            ->limit(10)
            ->select();




        $dataModel = new DataModel();

        //获取当前用户的场景值
//        $project_mon_type = ProjectMonTypeModel::get($data['project_mon_type_id']);
        $project_mon_type = ProjectMonTypeModel::get($data[0]['project_mon_type_id']);
        $config  = \app\admin\model\ConfigApi::get($project_mon_type->config_api_id);
        $dataModel->setTable( $dataModel->getTable(). '_' . $config->mark );


//        $dataModel->compare($data,$data['id']);
        foreach($data as $v){
//            $dataModel->compare($v,$v['id']);
        }


        echo "ok";
    }


    /**
     *本地数据入队列
     *
     */
    public function job(){
//        $data = Db::name('data_zh')
//            ->where('point_name','CJ-01')
//            ->limit(2)
//            ->select();
//
//        foreach($data as $v){
//            $this->enqueue(json_encode($v));
//        }
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




}


