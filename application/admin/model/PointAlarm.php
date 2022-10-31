<?php

namespace app\admin\model;

use app\admin\model\MonType as MonTypeModel;
use think\Db;
use think\Model;


class PointAlarm extends Model
{



    public $engineering_id = 0;
    public $project_id = 0;
    public $mon_type_id = 0;
    public $point_id = 0;


    // 表名
    protected $name = 'point_alarm';

    // 自动写入时间戳字段
    protected $autoWriteTimestamp = 'int';

    // 定义时间戳字段名
    protected $createTime = 'createtime';
    protected $updateTime = 'updatetime';
    protected $deleteTime = false;

    // 追加属性
    protected $append = [

    ];




    /**
     * 根据项目检测内容id和测点id-添加测点警情数据
     * @param int $project_mon_type_id 项目检测内容id
     * @param int $point_id 测点id
     * @return mixed
     *
     */
    public function addPointAlarm()
    {
        $point_id = $this->point_id;
        $engineering_id = $this->engineering_id;
        $project_id = $this->project_id;
        $mon_type_id = $this->mon_type_id;

        $alarmSet = $this->getAlarmSet($mon_type_id);

        $point_alarm_data = [];
        foreach ($alarmSet as $k =>$v)
        {
            $point_alarm_data['engineering_id'] = $engineering_id;
            $point_alarm_data['project_id']     = $project_id;
            $point_alarm_data['mon_type_id']    = $mon_type_id;
            $point_alarm_data['point_id']       = $point_id; //测点id


            $point_alarm_data['item']          = $k;
            $point_alarm_data['item_name']     = $v;
            $point_alarm_data['state']         = 0;
            $point_alarm_data['createtime']    = time();

            $res = Db::name('point_alarm')->insert($point_alarm_data);
        }


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





}
