<?php

namespace app\admin\model\engineering;

use think\Db;
use think\Model;
use app\admin\model\Engineering as EngineeringModel;
use app\admin\model\Project as ProjectModel;


class ProjectMonType extends Model
{





    // 表名
    protected $name = 'project_mon_type';

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
     * @弃用  本来想优化 测点的查看页面的
     * 以项目检测内容id获取信息
     * @params $project_mon_type_id
     *
     */
    static function getEngineeringInfo($project_mon_type_id)
    {
        $project_mon_type = self::where('id',$project_mon_type_id)
            ->field('id,project_id,engineering_id,mon_type_id')
            ->find();

        $data        = [];
        $engineering = EngineeringModel::get($project_mon_type->engineering_id);
        $project     = ProjectModel::get($project_mon_type->project_id);

        $data['engineering']    = $engineering->name;
        $data['engineering_id'] = $engineering->id;
        $data['project']        = $project->item_name;
        $data['project_id']     = $project->id;


        halt($data);


        return $data;

    }

    /**
     * 获取该工程下的检测内容信息
     *
     */
    public function getTypeCensus($engineering_id)
    {
        //过滤已经完工的数据
        $projectEnd = Db::name('project')
            ->where('status',1)
            ->where('engineering_id',$engineering_id)
            ->select();
        $project_ids = [];
        foreach ($projectEnd as $k=>$v){
            $project_ids[] = $v['id'];
        }

        $list = self::where('engineering_id', $engineering_id)
            ->where('project_id','not in',$project_ids)
            ->select();

        //统计数量
        $row = [];
        foreach ($list as $k=>$v)
        {
            if(!isset($row[$v->mon_type_name])){
                $row[$v->mon_type_name] = 1;
            }else{
                $row[$v->mon_type_name] += 1;
            }
        }

        return $row;
    }








}
