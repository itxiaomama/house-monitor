<?php

namespace app\admin\model;

use think\Model;


class Collector extends Model
{


    // 表名
    protected $name = 'collector';

    // 自动写入时间戳字段
    protected $autoWriteTimestamp = 'int';

    // 定义时间戳字段名
    protected $createTime = false;
    protected $updateTime = 'updatetime';
    protected $deleteTime = false;

    // 追加属性
    protected $append = [

    ];

    /**
     * 关联类型表
     *
     * @return \think\model\relation\BelongsTo
     */
    public function devicemodel()
    {
        return $this->belongsTo('DeviceModel', 'mod_id', 'id', [], 'LEFT')->setEagerlyType(0);
    }

    /**
     * 关联company表获取表名称
     *
     * @return \think\model\relation\HasOne
     */
    public function company()
    {
        return $this->hasOne('Company', 'id', 'factory', [], 'LEFT')->setEagerlyType(0);
    }
}
