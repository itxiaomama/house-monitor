<?php

namespace app\admin\controller;

use app\admin\model\Engineering as EngineeringModel;
use app\admin\model\MonCategory as MonCategoryModel;
use app\common\controller\Backend;
use think\Db;

/**
 * 工程类型管理
 *
 * @icon fa fa-circle-o
 */
class EngineeringType extends Backend
{

    /**
     * EngineeringType模型对象
     * @var \app\admin\model\EngineeringType
     */
    protected $model = null;
    protected $noNeedRight = ['get_item_list','monitor']; //无需鉴权的方法,但需要登录



    public function _initialize()
    {
        parent::_initialize();
        $this->model = new \app\admin\model\EngineeringType;

    }

    public function import()
    {
        parent::import();
    }

    /**
     * 默认生成的控制器所继承的父类中有index/add/edit/del/multi五个基础方法、destroy/restore/recyclebin三个回收站方法
     * 因此在当前控制器中可不用编写增删改查的代码,除非需要自己控制这部分逻辑
     * 需要将application/admin/library/traits/Backend.php中对应的方法复制到当前控制器,然后进行修改
     */

    /**
     * 查看
     */
    public function index()
    {
        //设置过滤方法
        $this->request->filter(['strip_tags', 'trim']);
        if ($this->request->isAjax()) {
            //如果发送的来源是Selectpage，则转发到Selectpage
            if ($this->request->request('keyField')) {
                return $this->selectpage();
            }
            list($where, $sort, $order, $offset, $limit) = $this->buildparams();

            //超级管理员显示所有数据  其他管理员只显示关联的工程数据

            //监测类型数据
            $list = Db::name('mon_category')->select();
            $adminIds = $this->auth->getChildrenAdminIds(true);

            $engineering_staff = Db::name('engineering_staff')
                ->field('id,engineering_id')
                ->where('adminid','in',$adminIds)
                ->select();

            $engineering_ids = [];
            foreach ($engineering_staff as $v)
            {
                $engineering_ids[] = $v['engineering_id'];
            }

            foreach ($list as $k=> $v)
            {
                $list[$k]['count'] = Db::name('project')
                    ->where('engineering_id','in',$engineering_ids)  //属于这个账号的数据
                    ->where('mon_category_id',$v['id'])
                    ->count();
            }

            $result = array("total" => count($list) , "rows" => $list);

            return json($result);
        }
        return $this->view->fetch();
    }

    /**
     * 根据监控类型 获取项目信息
     * @param $id 监测类型id
     * @return mixed
     */
    public function monitor()
    {
        $mon_category_id    = $this->request->get('id');

        $mon_category       = MonCategoryModel::get($mon_category_id);

        $mon_category_name  = $mon_category->mon_item_name;

        $adminIds           = $this->auth->getChildrenAdminIds(true);

        $engineering_staff  = Db::name('engineering_staff')
            ->field('id,engineering_id')
            ->where('adminid','in',$adminIds)
            ->select();


        $engineering_ids = [];
        foreach ($engineering_staff as $v)
        {
            $engineering_ids[] = $v['engineering_id'];
        }


        $engineering = Db::name('engineering')
            ->where('id','in',$engineering_ids)  //属于这个账号的数据
            ->select();

        $engineeringIds = array_select($engineering,'name');

        $list = Db::name('project')
            ->alias('p')
            ->join('jc_engineering je','p.engineering_id = je.id','left')
            ->field('je.project_type,p.*')
            ->where('mon_category_id',$mon_category_id)
            ->where('engineering_id','in',$engineering_ids)  //属于这个账号的数据
            ->select();

        foreach ($list as $k=>$v){

            $list[$k]['engineering_name']  = isset($engineeringIds[$v['engineering_id']]) ? $engineeringIds[$v['engineering_id']] : '';
            $list[$k]['mon_category_name'] = isset($engineeringIds[$v['engineering_id']]) ? $mon_category_name : '';
            $list[$k]['show_status']       = $v['project_type'] === 1 ? 0 : 1;

        }

        $result = array("total" => count($list), "rows" => $list);

        return json($result);
    }


    /**
     *  以项目id获取监测内容
     *
     */
    public function get_item_list()
    {
        $project_id =  $this->request->get('id');
        $project_mon_type = Db::name("project_mon_type")
            ->where('project_id',$project_id)
            ->select();

        //测点数量
        foreach ($project_mon_type as &$v){
            $v['point_num'] = Db::name('point')
                ->where('project_mon_type_id',$v['id'])
                ->count();
        }

        $result = array("total" => count($project_mon_type), "rows" => $project_mon_type);
        return json($result);
    }

}
