<?php

namespace app\admin\model;

use think\Db;
use think\Model;


class Project extends Model
{
    // 表名
    protected $name = 'project';

    // 自动写入时间戳字段
    protected $autoWriteTimestamp = 'int';

    // 定义时间戳字段名
    protected $createTime = 'createtime';
    protected $updateTime = 'updatetime';
    protected $deleteTime = false;

    // 追加属性
    protected $append = [];


    /**
     * 以工程id查询 项目数据
     * @param $engineering_id  工程id
     * @param $keyword         搜索的关键字
     * @return mixed
     *
     */
    static function getProjectByEngId($engineering_id,$keyword='')
     {
         //search：流水号  项目名称  警情状态
         $query = self::where(['engineering_id' => $engineering_id]);

         if($keyword == "异常")
         {
             $query->where("alarm_state",'=',1);
         }elseif($keyword == "正常"){
             $query->where("alarm_state",'=',0);
         }

         if(!empty($keyword))
         {
             $query ->where("serial","like","%{$keyword}%")
                 ->whereOr("item_name","like","%{$keyword}%");
         }
            $projectList = $query
                ->field('id,serial,item_name,alarm_state,status')
                ->select();

         //繁琐的操作:避免在循环中使用sql查询
         $project_ids = "";
         foreach($projectList as $project){
             $project_ids .= $project['id'].',';
         }
         $project_ids = substr($project_ids, 0, -1);
         //查询监测内容
         $project_mon_type = Db::name('project_mon_type')
             ->where('project_id','in',$project_ids)
             ->select();

         //项目id不同来分组
         $new_project_mon_type = [];
         foreach ($project_mon_type as $v_mon )
         {
             $new_project_mon_type[$v_mon['project_id']] [] = $v_mon;
         }

         //组合数据
         foreach($projectList as &$v){
             if(isset($new_project_mon_type[$v['id']])){
                 $v['mon_types'] = $new_project_mon_type[$v['id']];
             }else{
                 $v['mon_types'] = [];
             }
         }

         return $projectList;
     }


     //添加项目：监测内容+测点数据
     //监测内容-测点数据
    //关系:工程  项目  监测内容   测点管理

    //项目表      项目-监测内容表




    public function engineering()
    {
        return $this->belongsTo('Engineering', 'engineering_id', 'id', [], 'LEFT')->setEagerlyType(0);
    }





}
