<?php

namespace app\admin\model;

use think\Model;


class Data extends Model
{
    // 表名
    protected $name = 'data';

    // 自动写入时间戳字段
    protected $autoWriteTimestamp = 'int';

    // 定义时间戳字段名
    protected $createTime = 'createtime';
    protected $updateTime = 'updatetime';
    protected $deleteTime = false;

    //工程id
    protected $engineering_id = 0;

    // 追加属性
    protected $append = [

    ];


    /***
     * 数据范例
     *
     *
    $row = [
    'point' => 5,
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
    ];
     *
    $alarm = [
    [
    'id' =>  47,
    'engineering_id' =>  5,
    'project_id' =>  28,
    'mon_type_id' =>  2,
    'point_id' =>  9,
    'item' =>  'data1' ,
    'item_name' =>  'X轴位移(mn)' ,
    'state' =>  1,
    'warn' =>  '100' ,
    'error' =>  '200' ,
    'control' =>  '3',
    'admin_id' =>  0,
    'createtime' =>  1626169854,
    'updatetime' =>  0,
    ],
    [
    'id' =>  48,
    'engineering_id' =>  5,
    'project_id' =>  28,
    'mon_type_id' =>  2,
    'point_id' =>  9,
    'item' =>  'data1_this' ,
    'item_name' =>  'Y轴位移(mn)' ,
    'state' =>  1,
    'warn' =>  '1' ,
    'error' =>  '2' ,
    'control' =>  '3',
    'admin_id' =>  0,
    'createtime' =>  1626169854,
    'updatetime' =>  0,
    ],
    ];

     *
     *
     *
     *
     */

    /**
     * 数据超过阈值
     * @param $row  原始的数据
     * @param $alarm 设置的阈值数据
     * @param $data_id 数据id
     * @return mixed
     *
     */
    public function compare($row = [] ,$alarm = [],$data_id)
    {
        //需要两个数据:原始数据   阈值数据
        $alarm = $this->array_one($alarm,'item');
//        $filter = ['point_id','record_time'];

        $filter = [
            'data1','data2','data3','data4','data5',
            'data1_this','data2_this','data3_this','data4_this','data5_this',
            'data1_total','data2_total','data3_total','data4_total','data5_total',
            'data1_rate','data2_rate','data3_rate','data4_rate','data5_rate',
        ];
        foreach ($row as $key => $val)
        {
            if(!in_array($key,$filter)){continue;} //过滤不需要比较的参数
            //将原始数据和阈值进行比较
            if($val > $alarm[$key]['error'])
            {
                $diff = $val - $alarm[$key]['error'];
                $this->doingError($row['point_id'] ,$data_id ,$key, $alarm[$key]['item_name'],$val,$diff); //告警处理
            }elseif ($val > $alarm[$key]['warn'] || $val == $alarm[$key]['warn'])
            {
                $diff = $val - $alarm[$key]['warn'];
                $this->doingWarn($row['point_id'], $data_id , $key ,$alarm[$key]['item_name'],$val,$diff);  //预警处理
            }

        }

    }

    /**
     * 处理告警信息
     * @params $point 测点id
     * @params $data_id   数据id
     * @params $key   告警的字段
     * @params $keyName   字段名称
     * @params $val   原始值
     * @params $diff  原始值和阈值的差值
     * @return mixed
     */
    public function doingError($point_id,$data_id,$key,$keyName,$val,$diff)
    {
        //项目信息  告警状态
        $point = Point::get($point_id);
        if(empty($point)){
            //报 异常
        }

        $project = Project::get($point->project_id);
        $project -> alarm_state = 1;
        $project->save();

        //测点信息  告警状态
        $point-> alarm_status = 2;
        $point->save();

        //数据管理  具体的数据标红  error，warn,control 添加字段
        $data = Data::get($data_id);
        $error = $data->error;
        $old = [];
        if(!empty($error)){
            $old = json_decode($error);
        }
        $old[] = $key;
        $data -> error = json_encode($old);
        $data -> alarm_state = 2;
        $data->save();

        //生成 异常管理-报警管理
        $engineering = Engineering::get($project->engineering_id);
        $exception_alarm_params = [
            'serial' => $project->serial,
            'project_name' => $project->item_name,
            'project_id' => $project->id,
            'engineering_id' => $project->engineering_id,
            'engineering_name' =>  $engineering->name,
            'alarm_time' => time(),
            'alarm_status' => 2,
            'createtime' => time(),
            'agency_id' => $engineering->monitor_id,
        ];
        $exception_alarm = ExceptionAlarm::create($exception_alarm_params);
        $exception_alarm_id = $exception_alarm->id;


        $mon_type = MonType::get($point->mon_type_id);
        $content = $keyName."：".$val."，超控制值".$diff;
        $exception_alarm_log =  ExceptionAlarmLog::create(
            [
                'record_time' => time(),
                'mon_type_name' => $mon_type->mon_type_name,
                'mon_type_id' => $point->mon_type_id,
                'content' => $content,
                'alarm_status' => 2 ,
                'point_code' => $point->point_code ,
                'point_id' =>  $point_id,
                'exception_alarm_id' => $exception_alarm_id,
                'engineering_id' => $project->engineering_id,
            ]
        );

        //异常管理-报警统计


        //通知 告警接收人
        $this->engineering_id = $project->engineering_id;
        //被通知人  通知的信息
    }

    /**
     * 处理预警信息
     * @params $point 测点id
     * @return mixed
     */
    public function doingWarn($point_id,$data_id,$key,$keyName,$val,$diff)
    {
        echo('这是 Warn的处理');
        //项目信息  告警状态
        $point = Point::get($point_id);
        if(empty($point)){
            //报 异常
        }

        $project = Project::get($point->project_id);
        $project -> alarm_state = 0; //警情状态:0=正常,1=异常,2=完工   预警算是正常吗？
        $project->save();

        //测点信息  告警状态
        $point-> alarm_status = 1; //报警状态:0=正常,1=预警,2=报警,3=控制
        $point->save();

        //数据管理  具体的数据标红  error，warn,control 添加字段
        $data = Data::get($data_id);
        $warn = $data->warn;
        $old = [];
        if(!empty($warn)){
            $old = json_decode($warn);
        }
        $old[] = $key;
        $data -> warn = json_encode($old);
        $data -> alarm_state = 1; //告警状态:0=正常,1=预警,2=报警,3=控制
        $data->save();

        //生成 异常管理-报警管理
        $engineering = Engineering::get($project->engineering_id);
        $exception_alarm_params = [
            'serial' => $project->serial,
            'project_name' => $project->item_name,
            'project_id' => $project->id,
            'engineering_id' => $project->engineering_id,
            'engineering_name' =>  $engineering->name,
            'alarm_time' => time(),
            'alarm_status' => 1,
            'createtime' => time(),
            'agency_id' => $engineering->monitor_id,
        ];//报警状态:0=正常,1=预警,2=报警,3=控制
        $exception_alarm = ExceptionAlarm::create($exception_alarm_params);
        $exception_alarm_id = $exception_alarm->id;


        $mon_type = MonType::get($point->mon_type_id);
        $content = $keyName."：".$val."，超控制值".$diff;
        $exception_alarm_log =  ExceptionAlarmLog::create(
            [
                'record_time' => time(),
                'mon_type_name' => $mon_type->mon_type_name,
                'mon_type_id' => $point->mon_type_id,
                'content' => $content,
                'alarm_status' => 1 ,
                'point_code' => $point->point_code ,
                'point_id' =>  $point_id,
                'exception_alarm_id' => $exception_alarm_id,
                'engineering_id' => $project->engineering_id,
            ]
        );//警情状态:0=正常,1=预警,2=报警,3=控制

        //异常管理-报警统计


        //通知 告警接收人
        $this->engineering_id = $project->engineering_id;

    }

    /**
     *  告警通知
     *
     */
    public function alarmNoticeError()
    {
        //需要提醒的人   提醒的内容   提醒的方式
        $alarmNotice = AlarmNotice::all([
            'engineering_id'=> $this->engineering_id,
            'type'        => 2
        ]);

        $alarmNoticeModel = new AlarmNotice();
        if(!empty($alarmNotice))
        {
            foreach($alarmNotice as $v)
            {

//                $alarmNoticeModel ->aliNoteSend($v['phone'],);

            }



        }




    }






    /**
     * 将数组处理为 以指定key为索引的 一维数组
     *
     */
    public function array_one($result,$key)
    {
        $arr = [];
        foreach($result  as $k => $v){
            $arr[$v[$key]] =  $v;
        }
        return $arr;
    }









}
