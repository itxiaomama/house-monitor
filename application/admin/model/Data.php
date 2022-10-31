<?php

namespace app\admin\model;

use app\admin\model\ConfigApi as ConfigApiModel;
use app\admin\model\engineering\ProjectMonType as ProjectMonTypeModel;
use think\Config;
use think\Db;
use think\exception\HttpResponseException;
use think\Model;
use think\Request;
use think\Response;
use think\Url;
use think\View as ViewTemplate;


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
    protected $project_id = 0;
    protected $point_id = 0; //测点id
    protected $data_id = 0; //数据id
    protected $exception_alarm_id = 0; //报警管理id
    protected $exception_alarm_log_ids = []; //报警管理记录id集合
    protected $predict_alarm_log_ids = []; //预计报警管理记录id集合
    protected $alarm_status_error = false;
    protected $alarm_status_warn  = false;

    //选择data表前缀需要的参数
    protected $project_mon_type_id;
    protected $model;

    //短信告警通知需要的参数
    protected  $alarm_engineering_name  = ""; //工程名称
    protected  $alarm_point_code  = ""; //测点名称
    protected  $alarm_conter  = ""; //告警具体详情

    protected  $warn_engineering_name  = ""; //工程名称
    protected  $warn_point_code  = ""; //测点名称
    protected  $warn_conter  = ""; //告警具体详情



    protected $item ; //参数的字段
    protected $item_name ; //参数名称
    protected $item_value ; //参数值
    protected $diff;


    //信息
    protected $point;
    protected $engineering;
    protected $project;



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
     * @param $data_id 数据id
     * @return mixed
     *
     */
    public function compare($row = [] ,$data_id)
    {
        //获取当前用户的场景值
        $this->model = new Data();

        //需要两个数据:原始数据   阈值数据
        $alarm = collection(PointAlarm::all(['point_id'=>$row['point_id']]));
        $alarm = $alarm ->toArray();

        if(empty($alarm)){//该测点未设置报警方案
            $result = [
                'code' => 0,
                'msg'  => '该测点未设置警情参数',
                'data' => [],
            ];
            $response = Response::create($result, 'json')->header([]);
            throw new HttpResponseException($response);
        }

        $alarm = $this->array_one($alarm,'item');
        $this->data_id  = $data_id;

        $filter = [
         'data1','data2','data3','data4','data5',
        'data1_this','data2_this','data3_this','data4_this','data5_this',
        'data1_total','data2_total','data3_total','data4_total','data5_total',
        'data1_rate','data2_rate','data3_rate','data4_rate','data5_rate',
        ];
        $ousArr = [];
        foreach ($row as $key => $val)
        {

            //超过xx天 日变化需要的参数
            if(strstr($key,"_rate")) {
                $ousArr[$key] = $val;
            }

            //过滤不需要比较的参数
            if(!in_array($key,$filter)){
                continue;
            }

            //过滤参数为空的
            if(empty($alarm[$key])){
                continue;
            }

            //过滤未开启阈值的参数
            if($alarm[$key]['state'] == 0){
                continue;
            }


            $this->point_id   = $row['point_id'];
            $this->item_name  = $alarm[$key]['item_name']; //参数名称
            $this->item_value = $val; //参数值

            $intError = abs($alarm[$key]['error']);
            $negError = -abs($alarm[$key]['error']);
            $intWarn  = abs($alarm[$key]['warn']);
            $negWarn  = -abs($alarm[$key]['warn']);

            //将原始数据和阈值进行比较
            if($val >= $intError || $val <= $negError )
            {
                //整数时
                if($val >= $intError){
                    $diff = $val - $intError;
                }else{
                    $diff = $val - $negError;
                }
                $this->diff  = $diff;
                $this->item  = $key;  //参数的字段
//                $this->doingError(); //告警处理
                $this->doingInformation(3);
            }elseif ($val >= $intWarn || $val <= $negWarn)
            {
                $this->item  = $key;  //参数的字段
                if($val >= $intWarn){
                    $diff = $val - $intWarn;
                }else{
                    $diff = $val - $negWarn;
                }
                $this->diff  = $diff;
//                $this->doingWarn();  //预警处理
                $this->doingInformation(2);
            }

        }
/*
        //部分数据初始化
        $this->alarm_status_error = false;
        $this->alarm_status_warn  = false;
//        ["data1_rate"] =&gt; string(2) "10"

        #########################     2022-1-10 需求:连续xx天大于xx  ##############################
        $point = Point::get($row['point_id']);   //稍后梳理重复获取数据的
        $this->point = $point;
        if($point->ous_day != 0 )
        {
            foreach($ousArr as $ousKey => $ousVal)  //不确定需要监听的参数有几个，现在大多是1个，少数2个
            {
                $number = $this->number($ousKey);
                $ousIntError = abs($alarm ['param'.$number]['error']);
                $ousNegError = -abs($alarm['param'.$number]['error']);

                $ousIntWarn = abs($alarm ['param'.$number]['warn']);
                $ousNegWarn = -abs($alarm['param'.$number]['warn']);
                $this->ousItemName = $alarm['param'.$number]['item_name'];
                $this->ousItemValue = $ousVal;

                //将原始数据和阈值进行比较
                if($ousVal >= $ousIntError || $ousVal <= $ousNegError )
                {
                    //整数时
                    if($ousVal >= $ousIntError){
                        $ousDiff = $ousVal - $ousIntError;
                    }else{
                        $ousDiff = $ousVal - $ousNegError;
                    }

                    $this->alarm_status_error = true;
                    $this->ousDiff  = $ousDiff;
                    $this->ousItem  = $ousKey;  //参数的字段

                $this->doingOus($alarm_status = 2); //告警处理
                }elseif ($ousVal >= $ousIntWarn || $ousVal <= $ousNegWarn)
                {
                    if($ousVal >= $ousIntWarn){
                        $ousDiff = $ousVal - $ousIntWarn;
                    }else{
                        $ousDiff = $ousVal - $ousNegWarn;
                    }
                    $this->ousDiff  = $ousDiff;
                    $this->ousItem  = $ousKey;  //参数的字段
                    $this->alarm_status_warn = true;
                $this->doingOus($alarm_status = 1);  //预警处理
                }
            }
        }

        //生成 异常管理-报警管理  未进行比较的话,不需要生成报警记录和发送告警通知
        if($this->project){
            $this->addExceptionAlarm(); //报警状态:0=正常,1=预警,2=报警,3=控制
        }
*/
    }


    public function doingInformation($status){

        $this->alarm_status_error = true;

        $this->point = Point::get($this->point_id);

        $this->addExceptionAlarmLog($status);

    }







    /**
     * 处理告警信息
     * @params $point 测点id
     * @params $data_id   数据id
     * @params $key   参数的字段
     * @params $keyName   参数名称
     * @params $val   参数值
     * @params $diff  原始值和阈值的差值
     * @return mixed
     */
    public function doingError()
    {
        $this->alarm_status_error = true;

        //项目信息  告警状态
        $point = Point::get($this->point_id);
        $this->point = $point;

        if(empty($point)){
            //报 异常
        }

//        $this->updateProject($alarm_status = 1); //警情状态:0=正常,1=异常,2=完工   预警算是正常吗？
//
//        //测点信息  告警状态
//        $this->updatePoint($alarm_status = 2);//报警状态:0=正常,1=预警,2=报警,3=控制
//
//        //数据管理  具体的数据标红  error，warn,control 添加字段
//        $this->updateData($alarm_status = 2,$alarm_type='error'); //告警状态:0=正常,1=预警,2=报警,3=控制
//
//        //1）生成 报警管理再生成报警管理记录  改为先生成报警管理记录再生成报警管理

        //报警管理记录处理
        $this->addExceptionAlarmLog(2);

    }

    /**
     * 处理预警信息
     * @params $point 测点id
     * @return mixed
     */
    public function doingWarn()
    {
        //项目信息  告警状态
        $this->alarm_status_warn = true;
        $point = Point::get($this->point_id);
        $this->point = $point;
        if(empty($point)){
            //报 异常
        }
        //报警管理记录处理
        $this->addExceptionAlarmLog(1);

    }

    /**
     *  项目修改
     */
    public function updateProject($alarm_state)
    {
        $point                = $this->point;
        $project              = Project::get($point->project_id);
        $project->alarm_state = $alarm_state;
        $project->save();
    }

    /**
     *  测点修改
     */
    public function updatePoint($alarm_state = 2)
    {
        $point               = $this->point;
        $point->alarm_status = $alarm_state;
        $point->save();
    }
    /**
     * 数据修改
     * @param $alarm_type 告警类型:error,warning,critical
     */
    public function updateData($alarm_state = 2,$alarm_type='error')
    {

        $config = ConfigApiModel::get(['id' => $this->project->config_api_id]);

        if (!strstr($this->model->getTable(), $config->mark)) {
            $this->model->setTable($this->model->getTable() . '_' . $config->mark);
        }


        $data = $this->model->where('id', $this->data_id)->find();

        $this->model->where('id', $this->data_id)->update([
            $alarm_type   => isset($data->$alarm_type) && !empty($data->$alarm_type) ? json_decode($data->$alarm_type) : json_encode([$this->item]),
            'alarm_state' => $alarm_state
        ]);

        //使用model更新数据时，字段不能为 error

    }

    /**
     *  报警管理-创建
     */
    public function  addExceptionAlarm($alarm_status)
    {

        //关闭短信通知
        switch ($alarm_status){
            case 1:
//                $this->alarmNoticeBlue();
                $alarm_type='control';
                break;
            case 2:
//                $this->alarmNoticeWarn();
                $alarm_type='warn';
                break;
            case 3:
//                $this->alarmNoticeError();
                $alarm_type= 'error';
                break;
        }


        /*
        //判断报警状态 报警状态:0=正常,1=预警,2=报警,3=控制
        $alarm_status_error = $this->alarm_status_error;
        $alarm_status_warn  = $this->alarm_status_warn;

        $alarm_status = 0;
        $alarm_type = "";
        if($alarm_status_warn){
            $alarm_status = 1;
            //通知 预警接收人
            $this->alarmNoticeWarn();
            $alarm_type='warn';
        }
        if($alarm_status_error){ //告警
            $alarm_status = 2;
            $this->alarmNoticeError();
            $alarm_type= 'error';
        }
        */



        $this->updateProject($alarm_status); //警情状态:0=正常,1=异常,2=完工  改为 警情状态:0=正常,1预警,2=报警,3=控制
        //   预警算是正常吗？
        //测点信息  告警状态
        $this->updatePoint($alarm_status );//报警状态:0=正常,1=预警,2=报警,3=控制
        //数据管理  具体的数据标红  error，warn,control 添加字段
        $this->updateData($alarm_status,$alarm_type); //告警状态:0=正常,1=预警,2=报警,3=控制


        $project     = $this->project;
        $engineering = $this->engineering;

        $exception_alarm = ExceptionAlarm::create([
            'serial'           => $project->serial,
            'project_name'     => $project->item_name,
            'project_id'       => $project->id,
            'engineering_id'   => $project->engineering_id,
            'engineering_name' => $engineering->name,
            'alarm_time'       => time(),
            'alarm_status'     => $alarm_status,
            'createtime'       => time(),
            'agency_id'        => $engineering->monitor_id,
        ]);
        $exception_alarm_id = $exception_alarm->id;

        //告警管理记录
        Db::name('exception_alarm_log')->where('id', 'in', $this->exception_alarm_log_ids)->update(['exception_alarm_id' => $exception_alarm_id]);

        //预警告警表 写入 exception_alarm_id ,消警后清除【预计告警表】数据
        if (!empty($this->predict_alarm_log_ids)) {
            Db::name('predict_alarm_log')->where('id', 'in', $this->predict_alarm_log_ids)->update(['exception_alarm_id' => $exception_alarm_id]);
        }



//        $this->exception_alarm_log_ids = [];
//        $this->alarm_status_error = false;  //A
//        $this->alarm_status_warn  = false;  //B   A，B两者同时存在会报错，model中的getData(),name参数传递异常
//
//        $this->alarm_engineering_name = "";
//        $this->alarm_point_code = "";
//        $this->alarm_conter= "";
    }

    /**
     *  报警管理记录-创建
     */
    public function addExceptionAlarmLog($alarm_status = 2)
    {
        $point    = $this->point;

        $project = Project::get($point->project_id);
        $this->project  = $project;
        $this->project_id  = $project->id;


        $engineering = Engineering::get($project->engineering_id);
        $this->engineering = $engineering;
        $this->engineering_id = $project->engineering_id;


        $exception_alarm_id = $this->exception_alarm_id;


        $mon_type = MonType::get($point->mon_type_id);


        //准备短信通知时的参数
        $content = '';
        $eg = "超";
        if($this->diff == 0){
            $eg = "达到";
            $this->diff = "";
        }
        if ($alarm_status == 3) {
            $content                      = $this->item_name . "：" . $this->item_value . "，" . $eg . "报警值" . $this->diff;
            $this->alarm_engineering_name = $this->engineering->name;
            $this->alarm_point_code       = $point->point_code;
            $this->alarm_conter           = $content;

        }

        if ($alarm_status == 2) {
            $content = $this->item_name . "：" . $this->item_value . "，" . $eg . "预警值" . $this->diff;

            $this->warn_engineering_name = $this->engineering->name;
            $this->warn_point_code       = $point->point_code;
            $this->warn_conter           = $content;
        }

        if ($alarm_status == 1) {
            $content = $this->item_name . "：" . $this->item_value . "，" . $eg . "预警值" . $this->diff;

            $this->blue_engineering_name = $this->engineering->name;
            $this->blue_point_code       = $point->point_code;
            $this->blue_conter           = $content;
        }


        $exception_alarm_log =  ExceptionAlarmLog::create(
            [
                'record_time'        => time(),
                'mon_type_name'      => $mon_type->mon_type_name,
                'mon_type_id'        => $point->mon_type_id,
                'content'            => $content,
                'alarm_status'       => $alarm_status,
                'point_code'         => $point->point_code,
                'point_id'           => $this->point_id,
                'exception_alarm_id' => $exception_alarm_id,
                'engineering_id'     => $project->engineering_id,
                'data_id'            => $this->data_id,  //bug1 发现：11-1
            ]
        );
        $this->exception_alarm_log_ids[] = $exception_alarm_log->id;

        $this->addExceptionAlarm($alarm_status);
    }

    /**
     *  三级通知
     *
     */
    public function alarmNoticeError()
    {
        //需要提醒的人   提醒的内容   提醒的方式
        $alarmNotice = AlarmNotice::all([
            'engineering_id'=> $this->engineering_id,
            'type'        => 3  //类型:1=预警,2=报警,3=控制
        ]);

        $alarm_status_error = $this->alarm_status_error;
        if($alarm_status_error){
            $alarmNoticeModel = new AlarmNotice();
            //告警通知参数
            $name   = $this->alarm_engineering_name;
            $point  = $this->alarm_point_code;
            $conter = $this->alarm_conter;

            $date = date("Y-m-d H:i:s",time());

            $param = compact('name','point','conter','date');

            if(!empty($alarmNotice))
            {
                foreach($alarmNotice as $v)
                {
                    $alarmNoticeModel ->aliNoteSend($v['phone'],$param,'SMS_219746639');
                }
            }

        }

    }

    /**
     *  二级通知
     *
     */
    public function alarmNoticeWarn()
    {
        //需要提醒的人   提醒的内容   提醒的方式
        $alarmNotice = AlarmNotice::all([
            'engineering_id'=> $this->engineering_id,
            'type'        => 2
        ]);

        $alarm_status_error = $this->alarm_status_error;
        if($alarm_status_error){
            $alarmNoticeModel = new AlarmNotice();
            //告警通知参数
            $name   = $this->warn_engineering_name;
            $point  = $this->warn_point_code;
            $conter = $this->warn_conter;

            $date = date("Y-m-d H:i:s",time());

            $param = compact('name','point','conter','date');

            if(!empty($alarmNotice))
            {
                foreach($alarmNotice as $v)
                {
                    $alarmNoticeModel ->aliNoteSend($v['phone'],$param,'SMS_219749375');
                }
            }

        }

    }

    /**
     *  一级通知
     *
     */
    public function alarmNoticeBlue()
    {

        //需要提醒的人   提醒的内容   提醒的方式
        $alarmNotice = AlarmNotice::all([
            'engineering_id'=> $this->engineering_id,
            'type'        => 1
        ]);

        $alarm_status_error = $this->alarm_status_error;
        if($alarm_status_error){
            $alarmNoticeModel = new AlarmNotice();
            //告警通知参数
            $name   = $this->blue_engineering_name;
            $point  = $this->blue_point_code;
            $conter = $this->blue_conter;

            $date = date("Y-m-d H:i:s",time());

            $param = compact('name','point','conter','date');

            if(!empty($alarmNotice))
            {
                foreach($alarmNotice as $v)
                {
                    $alarmNoticeModel ->aliNoteSend($v['phone'],$param,'SMS_219749375');
                }
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

    /**
     * 字符串中匹配出数字
     * @param $str
     * @return string|string[]|null
     */
    function number($str)
    {
        return preg_replace('/\D/s', '', $str);
    }

    /**
     *  判断是否达到 连续xx天
     *
     */
    public function doingOus($alarm_status = 2 )
    {
        //查询昨日&&今日  是否有 【预计告警表】数据 ？是否超过xx天 ：记录一条
        $has_today = Db::name('predict_alarm_log')
            ->where('point_id',$this->point->id)
            ->where('alarm_status',$alarm_status)
            ->whereTime('record_time', 'today')
            ->find();

        $has_yesterday = Db::name('predict_alarm_log')
            ->where('point_id',$this->point->id)
            ->where('alarm_status',$alarm_status)
            ->whereTime('record_time', 'yesterday')
            ->find();

        ## 今日第一条 触发预警报警的话
        //bug:一天拉取数据多次的话  每次都会生成一条告警记录
        //去除了重复的告警记录  但是数据管理中的数据就又显示正常?显示异常的话，消警后该条数据没法重置
        if(empty($has_today)){
            if(empty($has_yesterday)){
                $this_day = 1;
            }else{
                $this_day = $has_yesterday['this_day'] + 1;
            }

            $mon_type = MonType::get($this->point->mon_type_id);
            $project  = Project::get( $this->point->project_id);
            $this->project  = $project;
            $this->project_id  = $project->id;
            $engineering = Engineering::get($project->engineering_id);
            $this->engineering = $engineering;
            $this->engineering_id = $project->engineering_id;

            $eg = "超";
            if($this->ousDiff == 0){
                $eg = "达到";
                $this->ousDiff = "";
            }
            $content  = $this->ousItemName."：".$this->ousItemValue."，".$eg."预警值".$this->ousDiff;
            $ous_day  = $this->point->ous_day;

            //短信通知需要的参数
            if($alarm_status == 2 ){
                $this->alarm_engineering_name = $this->engineering->name;
                $this->alarm_point_code  = $this->point->point_code;
                $this->alarm_conter =  $content;
            }

            if($alarm_status == 1 ){
                $this->warn_engineering_name = $this->engineering->name;
                $this->warn_point_code  = $this->point->point_code;
                $this->warn_conter =  $content;
            }



            $predict_alarm_data = [
                'record_time'    => time(),
                'createtime'     => time(),
                'mon_type_name'  => $mon_type->mon_type_name,
                'mon_type_id'    => $this->point->mon_type_id,
                'content'        => $content,
                'alarm_status'   => $alarm_status ,
                'point_code'     =>  $this->point->point_code ,
                'point_id'       =>  $this->point->id,
                'exception_alarm_id' => 0,
                'engineering_id' => $project->engineering_id,
                'data_id'        => $this->data_id,  //bug1 发现：11-1
                'ous_day'        => $ous_day,
                'this_day'       => $this_day,
            ];
            $this->predict_alarm_log_ids[] =   Db::name('predict_alarm_log')->insertGetId($predict_alarm_data);



            //SQL 查询最近的N天数据，如果时间是连续的就触发报警
            $start_time   = date('Y-m-d',time() - ($ous_day-1) * 86400);
            $end_time = date('Y-m-d',time()+86400);

            $n_day_logs = Db::name('predict_alarm_log')
                ->where('point_id',$this->point->id)
                ->where('alarm_status',$alarm_status)
                ->where('record_time','between time',[$start_time,$end_time])
                ->select();

            if(count($n_day_logs) == $ous_day){
                $this->addAlarmLog($n_day_logs); //添加告警信息日志
            }

        }



    }

    /**
     * 连续xx天  成就达成，触发史诗任务
     * @params $n_day_logs 告警记录所需字段
     * @return mixed
     */
    public function addAlarmLog($n_day_logs)
    {
        $this->exception_alarm_log_ids = [];
        foreach($n_day_logs as $n_day_log){
            unset($n_day_log['ous_day']);
            unset($n_day_log['this_day']);
            unset($n_day_log['id']);
            $this->exception_alarm_log_ids[] =  Db::name('exception_alarm_log')->insertGetId($n_day_log);
        }
    }








}
