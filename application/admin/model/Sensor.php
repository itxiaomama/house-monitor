<?php

namespace app\admin\model;

use think\Db;
use think\Model;


class Sensor extends Model
{





    // 表名
    protected $name = 'sensor';

    // 自动写入时间戳字段
    protected $autoWriteTimestamp = 'int';

    // 定义时间戳字段名
    protected $createTime = 'createtime';
    protected $updateTime = 'updatetime';
    protected $deleteTime = false;

    // 追加属性
    protected $append = [

    ];

    /**
     * 获取该工程下的传感器使用情况
     * @param $engineering_id 工程id
     * @return \think\model\relation\BelongsTo
     *
     */
      public function getDeviceCensus($engineering_id)
      {
          $projectEnd = Db::name('project')
              ->where('status',1)
              ->where('engineering_id',$engineering_id)
              ->select();
          $project_ids = [];
          foreach ($projectEnd as $k=>$v){
              $project_ids[] = $v['id'];
          }

          $list = self::where('admin_id', 0)->select();

          foreach ($list as $row) {
              //使用数量
              $row->count = Db::name('point')
                  ->where('sensor_id',$row->id)
                  ->where('engineering_id',$engineering_id)
                  ->where('project_id','not in',$project_ids)
                  ->count();

          }

          return $list;

      }






    public function montype()
    {
        return $this->belongsTo('MonType', 'mon_type_id', 'id', [], 'LEFT')->setEagerlyType(0);
    }
}
