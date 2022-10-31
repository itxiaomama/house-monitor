<?php

namespace app\api\model;

use think\Model;


class ConfigApi extends Model
{



    // 表名
    protected $name = 'config_api';

    // 自动写入时间戳字段
    protected $autoWriteTimestamp = 'int';

    // 定义时间戳字段名
    protected $createTime = true;
    protected $deleteTime = false;

    // 追加属性
    protected $append = [

    ];










}
