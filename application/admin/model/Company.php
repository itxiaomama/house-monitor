<?php

namespace app\admin\model;

use think\Model;


class Company extends Model
{





    // 表名
    protected $name = 'company';

    // 自动写入时间戳字段
    protected $autoWriteTimestamp = 'int';

    // 定义时间戳字段名
    protected $createTime = true;
    protected $deleteTime = false;

    // 追加属性
    protected $append = [

    ];










}
