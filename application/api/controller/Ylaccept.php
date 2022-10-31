<?php

namespace app\api\controller;


use app\common\controller\Api;

/**
 *
 */
class YlAccept extends Api
{
    protected $noNeedLogin = ['*'];
    protected $noNeedRight = ['*'];



    /**
     *  获取轮播图
     *
     */
    public function push()
    {
        var_dump('this i de vyg');
    }











}
 //接收数据
        $data = $this->request->param();

        if(empty($data)){
            return 'error,数据为空';
        }

        $res = Db::name('data_log')->insert(['data'=>json_encode($data)]);

        if($res){
            echo "success";
        }
        //获取告警阈值

    }



    /**
     * 消息队列测试
     * 入队列（生产者）
     */
    public function push_data()
    {

        // 1.当前任务将由哪个类来负责处理。
        //   当轮到该任务时，系统将生成一个该类的实例，并调用其 fire 方法
        $jobHandlerClassName  = 'app\api\job\YlAccept';

        // 2.当前任务归属的队列名称，如果为新队列，会自动创建
        $jobQueueName  	  = "YlAcceptJobQueue";

        // 3.当前任务所需的业务数据 . 不能为 resource 类型，其他类型最终将转化为json形式的字符串
        //   ( jobData 为对象时，存储其public属性的键值对 )
        $jobData  = [
            "upload_code"=> "20190705#0#1#0",
            "point_name"=> "C-01",
            "mon_type"=> 3,
            "dev_type"=> 11,
            "depth"=> 0.5,
            "data1"=> 193.36,
            "data2"=> -123.36,
            "data3"=> 3.36,
            "data4"=> -8.36,
            "data1_this"=> 1.265,
            "data2_this"=> -4.265,
            "data3_this"=> -4.265,
            "data4_this"=> -4.265,
            "data1_total"=> 3.265,
            "data2_total"=> -5.321,
            "data3_total"=> -5.321,
            "data4_total"=> -5.321,
            "data1_rate"=> 0.265,
            "data2_rate"=> -1.265,
            "data3_rate"=> -1.265,
            "data4_rate"=> -1.265,
            "alarm_state"=> 1,
        ];

        // 4.将该任务推送到消息队列，等待对应的消费者去执行
        $isPushed = Queue::push( $jobHandlerClassName , $jobData , $jobQueueName );

        // database 驱动时，返回值为 1|false  ;   redis 驱动时，返回值为 随机字符串|false
        if( $isPushed !== false ){
            echo date('Y-m-d H:i:s') . " a new Hello Job is Pushed to the MQ"."<br>";
        }else{
            echo 'Oops, something went wrong.';
        }



    }














}
