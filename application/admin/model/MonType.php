<?php

namespace app\admin\model;

use think\Db;
use think\Model;


class MonType extends Model
{





    // 表名
    protected $name = 'mon_type';

    // 自动写入时间戳字段
    protected $autoWriteTimestamp = false;

    // 定义时间戳字段名
    protected $createTime = false;
    protected $updateTime = false;
    protected $deleteTime = false;

    // 追加属性
    protected $append = [

    ];


    /**
     * 根据 监测类型获取 监测内容
     * @param $mon_category_id int 监测类型id
     * @return mixed
     */
    public static function getMonTypeByCategoryId ($mon_category_id)
    {
        $mon_type_ids = Db::name('mon_category_type')
            ->field('mon_type_ids')
            ->where('mon_category_id',$mon_category_id)
            ->find();

        $mon_type = self::where('id', 'in', $mon_type_ids['mon_type_ids'])
            ->field('id,mon_type_name')
            ->select();

        return $mon_type;
    }


    /**
     *  以项目id 查询监测内容
     * @param $project_id 项目id
     * @return mixed
     */
    public static function getMonTypeByProjectId($project_id)
    {
        //查询已经选择过的监测内容
        $project_mon_type = Db::name('project_mon_type')
            ->where('project_id', $project_id)
            ->field('id,mon_type_id,mon_type_name')
            ->select();

        $mon_type_ids = array_column($project_mon_type, 'mon_type_id');
        $mon_type     = self::where('id', 'not in', $mon_type_ids)
            ->field('id,mon_type_name')
            ->select();

        return $mon_type;
    }





}
