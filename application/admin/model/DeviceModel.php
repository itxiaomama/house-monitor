<?php

namespace app\admin\model;

use think\Model;


class DeviceModel extends Model
{

    

    

    // 表名
    protected $name = 'device_model';
    
    // 自动写入时间戳字段
    protected $autoWriteTimestamp = 'int';

    // 定义时间戳字段名
    protected $createTime = false;
    protected $updateTime = 'updatetime';
    protected $deleteTime = false;

    // 追加属性
    protected $append = [

    ];
    

    







}
