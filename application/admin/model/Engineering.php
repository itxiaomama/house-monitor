<?php

namespace app\admin\model;

use think\Model;


class Engineering extends Model
{
    // 表名
    protected $name = 'engineering';

    // 自动写入时间戳字段
    protected $autoWriteTimestamp = 'int';

    // 定义时间戳字段名
    protected $createTime = 'createtime';
    protected $updateTime = 'updatetime';
    protected $deleteTime = false;

    // 追加属性
    protected $append = [

    ];


    public function agency()
    {
        return $this->belongsTo('agency', 'monitor_id', 'id');
    }

    /**
     * 获取工程详细信息
     * @param integer $engineering_id 工程id
     * @return mixed
     */
    static function getEngineeringInfo($engineering_id)
    {
        $engineering = self::with('agency')
            ->field('id,name,address,city,start_date,finish_date,monitor_id,monitor_staff_id,item_map_image')
            ->find($engineering_id);
        if(!empty($engineering)){
            return $engineering->toArray();
        }else{
            return [];
        }
    }







}
