<?php

namespace app\admin\model;

use think\Model;


class Staff extends Model
{





    // 表名
    protected $name = 'staff';

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
     * 以机构id获取员工列表
     * @param agency_id  机构id
     * @param staff_ids  需要过滤的id
     * @return mixed
     */
    static function getStaffListByAgencyId($agency_id,$staff_ids=[])
    {
        $staff = self::where('agency_id',$agency_id)
            ->where('id','not in',$staff_ids)
            ->field('id,phone,staff_name,email')
            ->select();
        return $staff;
    }

    /**
     *  获取当前用户和其子用户 所属的机构
     * @params $admin_ids 后台id组
     *
     */
    static function getAffiliation($admin_ids)
    {
        $staff = self::where('admin_id','in',$admin_ids)
            ->field('id,agency_id,staff_name')
            ->select();
        return $staff;
    }









}
