<?php
namespace app\admin\model;

use think\Model;

class AreaCode extends Model{

    protected $table = 'jc_area_code';

    protected $autoWriteTimestamp = false;

    protected $createTime = false;

    protected $updateTime = false;

    /**
     * 只读字段，不允许被更改。也就是说当执行更新方法之前会自动过滤掉只读字段的值，避免更新到数据库。
     *
     * @var array
     */
    protected $readonly = [];

    /**
     *会在写入和读取的时候自动进行类型转换处理
     *
     * @var array
     */
    protected $type = [

    ];
}