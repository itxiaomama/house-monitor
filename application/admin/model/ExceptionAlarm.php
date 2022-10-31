<?php

namespace app\admin\model;

use think\Db;
use think\Model;


class ExceptionAlarm extends Model
{





    // 表名
    protected $name = 'exception_alarm';

    // 自动写入时间戳字段
    protected $autoWriteTimestamp = false;

    // 定义时间戳字段名
    protected $createTime = false;
    protected $updateTime = false;
    protected $deleteTime = false;


    protected $point;
    protected $data_id  = 0;
    protected $alarm_id = 0;
    protected $alarm_state = 3;
    protected $data_ids = [];
    protected $point_ids = [];
    protected $updateDataTrue = false;
    protected $updatePointTrue = false;



    // 追加属性
    protected $append = [

    ];

    /**
     * 查询该工程下的报警信息
     *
     */
    public function getAlarmCensus($engineering_id)
    {
        $list = self::where('engineering_id', $engineering_id)
            ->where('alarm_status',2)
            ->field(["FROM_UNIXTIME(alarm_time,'%Y-%m')"=>"time","count(*) as num"])
            ->group("time")
            ->select();
        return $list;
    }

    /**
     * 消警后告警状态的处理
     * @params  integer $alarm_id 告警管理id
     * @return mixed
     */
    public function out($alarm_id)
    {

        $this->alarm_id = $alarm_id;
        $this->alarm_state = 3; //3=控制
        //告警管理
        $this->updateExceptionAlarm();
        //告警记录
        $this->updateExceptionAlarmLog();
        //数据表  告警状态:0=正常,1=预警,2=报警,3=控制
        $this->updateData();
        //测点表
        $this->updatePoint();
        //项目表
        $this->updateProject();


    }

    /**
     * 修改告警
     *@params  $alarm_id integer 告警id
     *@return mixed
     */
    public function updateExceptionAlarm()
    {
        $alarmModel = new ExceptionAlarm();
        $alarmRow = $alarmModel->get($this->alarm_id);

        $res = Db::name('exception_alarm')
            ->where('id',$this->alarm_id)
            ->update(['alarm_status'=>$this->alarm_state,'updatetime'=>time()]);
    }

    /**
     * 修改告警
     *@params  $alarm_id integer 告警id
     *@return mixed
     */
    public function updateExceptionAlarmLog()
    {
        $alarm_id  = $this->alarm_id;
        $alarm_log = ExceptionAlarmLog::all(['exception_alarm_id'=>$alarm_id]);
        $data_ids  = [];
        foreach ($alarm_log as $k=>$v){
            $data_ids[$v['data_id']] = $v['data_id'];
        }
        sort($data_ids);
        $this->data_ids = $data_ids;
//        halt($data_ids);

        //修改
        $res = Db::name('exception_alarm_log')
            ->where('exception_alarm_id',$alarm_id)
            ->update(['alarm_status'=>$this->alarm_state,'updatetime'=>time()]);
    }


    /**
     * 数据修改
     * @params $alarm_type 告警类型:error,warning,critical
     */
    public function updateData()
    {
        //监测 当前的数据是否还有其他告警
        $hasAlarm = Db::name('exception_alarm_log')
            ->where('data_id','in',$this->data_ids)
            ->where('exception_alarm_id','neq', $this->alarm_id )
            ->where('alarm_status','in', [1,2] ) //预警和告警的
            ->count();

        if($hasAlarm == 0){
            $res = Db::name('data')
                ->where('id','in',$this->data_ids)
                ->update(['alarm_state'=>$this->alarm_state,'updatetime'=>time()]);
            $this->updateDataTrue = true;
        }
    }


    /**
     *  测点修改
     */
    public function updatePoint()
    {
        if($this->updateDataTrue == false)
        {
           return false;
        }

        //判断测点下的所有数据是否还有报警的
        $data  = Data::all($this->data_ids);
        $point_ids = [];
        foreach ($data as $key => $val){
            $point_ids[] = $val['point_id'];
        }
        $this->point_ids = $point_ids;
        //错误了
        $hasData = Db::name('data')
            ->where('id','not in', $this->data_ids )
            ->where('point_id','in', $point_ids)
            ->where('alarm_state','in', [1,2] ) //预警和告警的
            ->count();

        if($hasData == 0){
            $res = Db::name('point')
                ->where('id','in',$point_ids)
                ->update(['alarm_status'=>$this->alarm_state,'updatetime'=>time()]);
            $this->updatePointTrue = true;
        }
    }


    /**
     *  项目修改
     */
    public function updateProject()
    {
        if($this->updatePointTrue == false)
        {
            return false;
        }

        //判断测点下的所有数据是否还有报警的
        $point = Point::all($this->point_ids);
        $project_ids = [];
        foreach ($point as $key => $val){
            $project_ids[] = $val['project_id'];
        }

        $hasProject = Db::name('point')
            ->where('id','not in', $this->point_ids  )
            ->where('project_id','in', $project_ids)
            ->where('alarm_status','in', [1,2] ) //预警和告警的
            ->count();

        if($hasProject == 0){
            $res = Db::name('project')
                ->where('id','in',$project_ids)
                ->update(['alarm_state'=> 0,'updatetime'=>time()]);  //项目的告警状态改为正常
        }

    }










}
