<?php

namespace app\admin\model;

use app\common\controller\Backend;
use think\Controller;
use think\Db;
use think\Model;


class Inspection extends Model
{





    // 表名
    protected $name = 'inspection';

    // 自动写入时间戳字段
    protected $autoWriteTimestamp = false;

    // 定义时间戳字段名
    protected $createTime = false;
    protected $updateTime = false;
    protected $deleteTime = false;

    // 追加属性
    protected $append = [
        'create_time_text',
        'update_time_text'
    ];






    public function getCreateTimeTextAttr($value, $data)
    {
        $value = $value ? $value : (isset($data['create_time']) ? $data['create_time'] : '');
        return is_numeric($value) ? date("Y-m-d H:i:s", $value) : $value;
    }


    public function getUpdateTimeTextAttr($value, $data)
    {
        $value = $value ? $value : (isset($data['update_time']) ? $data['update_time'] : '');
        return is_numeric($value) ? date("Y-m-d H:i:s", $value) : $value;
    }

    protected function setCreateTimeAttr($value)
    {
        return $value === '' ? null : ($value && !is_numeric($value) ? strtotime($value) : $value);
    }

    protected function setUpdateTimeAttr($value)
    {
        return $value === '' ? null : ($value && !is_numeric($value) ? strtotime($value) : $value);
    }


    public function engineering()
    {
        return $this->belongsTo('Engineering', 'engineering_id', 'id', [], 'LEFT')->setEagerlyType(0);
    }

    public function house()
    {
        return $this->belongsTo('House', 'house_id', 'id', [], 'LEFT')->setEagerlyType(0);
    }

    public function getInspectInfo($where,$sort,$order,$limit,$where1=''){


        $where1 = " 1=1   ".$where1;

        $list = $this
            ->join('jc_manual','jc_inspection.manual_id = jc_manual.id','left')
            ->with(['house'])
            ->where($where)
            ->where($where1)
            ->order($sort, $order)
            ->paginate($limit);

        $houseModel = new \app\admin\controller\inspection\House();

        foreach ($list as $row) {
            //房屋地址
            $city_ids = [
                $row->house->province,
                $row->house->city,
                $row->house->area,
                $row->house->street,
            ];
            $cityList = Db::name('area_street')
                ->field('id,name')
                ->where('id','in',$city_ids)
                ->select();


            $city = implode('',array_column($cityList,'name'));

            $row->city                 = !empty($city) ? $city : '';
            $row->address              = $row->house->address;
            $row->end_time             = explode(" ", $row->end_time)[0];
            $row->house_rate           = isset($houseModel->rate[$row->house->rate]) ? $houseModel->rate[$row->house->rate] : '未鉴定';
            $row->start_time           = explode(" ", $row->start_time)[0];
            $row->is_timeout           = strtotime($row->end_time) > time() ? 0 : 1;
            $row->house_structure      = isset($houseModel->structure[$row->house->structure]) ? $houseModel->structure[$row->house->structure] : '砖混结构';
            $row->house_total_layer    = $row->house->total_layer;
            $row->house_super_address  = $row->house->super_address;

        }

        return $list;
    }
}
