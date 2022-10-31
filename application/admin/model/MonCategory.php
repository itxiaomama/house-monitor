<?php

namespace app\admin\model;

use app\api\model\Banner;
use think\Model;


class MonCategory extends Model
{





    // 表名
    protected $name = 'mon_category';

    // 自动写入时间戳字段
    protected $autoWriteTimestamp = 'int';

    // 定义时间戳字段名
    protected $createTime = 'createtime';
    protected $updateTime = 'updatetime';
    protected $deleteTime = false;

    // 追加属性
    protected $append = [

    ];













}
