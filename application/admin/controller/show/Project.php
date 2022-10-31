<?php

namespace app\admin\controller\show;

use app\admin\model\MonType as MonTypeModel;
use app\admin\model\Engineering as EngineeringModel;
use app\admin\model\MonCategory as MonCategoryModel;
use app\common\controller\Backend;
use Exception;
use think\Db;
use think\exception\PDOException;
use think\exception\ValidateException;

/**
 * 机构名称
 * @author  lang
 * @icon fa fa-circle-o
 */
class Project extends Backend
{

    /**
     * Agency模型对象
     * @var \app\admin\model\Agency
     */
    protected $model = null;


    //需要登录，不需要授权的方法
    protected $noNeedRight = ['get_child_list'];

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new \app\admin\model\Project;

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
        //当前是否为关联查询
        $this->relationSearch = true;
        //设置过滤方法
        $this->request->filter(['strip_tags', 'trim']);
        if ($this->request->isAjax()) {
            //如果发送的来源是Selectpage，则转发到Selectpage
            if ($this->request->request('keyField')) {
                return $this->selectpage();
            }
            list($where, $sort, $order, $offset, $limit) = $this->buildparams();

//            $list = $this->model
//                ->with(['engineering'])
//                ->where($where)
//                ->where('status',0)
//                ->order($sort, $order)
//                ->paginate($limit);
            //关联查询

            $isSuperAdmin = $this->auth->isSuperAdmin();
            $engineering_staff_ids = [];
            if($isSuperAdmin){
                $list = $this->model
                    ->where($where)
                    ->where('status',0)
                    ->order($sort, $order)
                    ->paginate($limit);
            }else{
                //先查询与admin_id 关联的项目
                //7-12 bug:二级权限本人添加的数据 本人不显示  已修复
                //超级管理员其实就包含在admin_ids 数据中
                $admin_ids =  $this->auth->getChildrenAdminIds(true); //获取本人及其子类的管理员id

                $staff = Db::name('staff')
                    ->field('id,staff_name')
                    ->where('admin_id','in',$admin_ids)
                    ->select();

                $staff_id = [];
                foreach ($staff as $v)
                {
                    $staff_id[] = $v['id'];
                }

                $engineering_staff = Db::name('engineering_staff')
                    ->field('id,engineering_id')
                    ->where('staff_id','in',$staff_id)
                    ->select();

                foreach ($engineering_staff as $v)
                {
                    $engineering_staff_ids[] = $v['engineering_id'];
                }


                $list = $this->model
                    ->where($where)
                    ->where('status',0)
                    ->where('engineering_id','in',$engineering_staff_ids)
                    ->order($sort, $order)
                    ->paginate($limit);

            }

            $row = $list->items();

            //转换为数组试试
            $row = collection($row)->toArray();
            $mon_category = MonCategoryModel::all();
            $mon_category = array_select($mon_category,'mon_item_name');

            $engineering = EngineeringModel::all($engineering_staff_ids);
            $engineering = array_select($engineering,'name');


            //工程名称  监测项目
            foreach ($row as &$v){
                if(isset($engineering[$v['engineering_id']])){
                    $v['mon_item_name'] = $mon_category[$v['mon_category_id']];
                    $v['engineering_name'] = $engineering[$v['engineering_id']];
                }
            }
            unset($v);

            $result = array("total" => $list->total(), "rows" => $row);

            return json($result);
        }
        return $this->view->fetch();
    }

    /**
     *  以项目id获取监测内容
     *
     */
    public function get_child_list()
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


    /**
     * 查看
     */
    public function lists()
    {
        //当前是否为关联查询
        $this->relationSearch = true;
        //设置过滤方法
        $this->request->filter(['strip_tags', 'trim']);
        if ($this->request->isAjax()) {
            //如果发送的来源是Selectpage，则转发到Selectpage
            if ($this->request->request('keyField')) {
                return $this->selectpage();
            }
            list($where, $sort, $order, $offset, $limit) = $this->buildparams();
            //关联查询
            $engineering_staff_ids = [];
            $isSuperAdmin = $this->auth->isSuperAdmin();
            if($isSuperAdmin){
                $list = $this->model
                    ->where($where)
                    ->where('status',1)
                    ->order($sort, $order)
                    ->paginate($limit);
            }else{
                //先查询与admin_id 关联的项目
                //7-12 bug:二级权限本人添加的数据 本人不显示  已修复
                //超级管理员其实就包含在admin_ids 数据中
                $admin_ids =  $this->auth->getChildrenAdminIds(true); //获取本人及其子类的管理员id

                $staff = Db::name('staff')
                    ->field('id,staff_name')
                    ->where('admin_id','in',$admin_ids)
                    ->select();

                $staff_id = [];
                foreach ($staff as $v)
                {
                    $staff_id[] = $v['id'];
                }

                $engineering_staff = Db::name('engineering_staff')
                    ->field('id,engineering_id')
                    ->where('staff_id','in',$staff_id)
                    ->select();


                foreach ($engineering_staff as $v)
                {
                    $engineering_staff_ids[] = $v['engineering_id'];
                }


                $list = $this->model
                    ->where($where)
                    ->where('status',1)
                    ->where('engineering_id','in',$engineering_staff_ids)
                    ->order($sort, $order)
                    ->paginate($limit);

            }

            $row = $list->items();

            //转换为数组试试
            $row = collection($row)->toArray();
            $mon_category = MonCategoryModel::all();
            $mon_category = array_select($mon_category,'mon_item_name');

            $engineering = EngineeringModel::all($engineering_staff_ids);
            $engineering = array_select($engineering,'name');


            //工程名称  监测项目
            foreach ($row as &$v){
                $v['mon_item_name'] = isset($mon_category[$v['mon_category_id']]) ? $mon_category[$v['mon_category_id']] : '';
                $v['engineering_name'] =isset($engineering[$v['engineering_id']]) ? $engineering[$v['engineering_id']]: '';
            }
            unset($v);

            $result = array("total" => $list->total(), "rows" => $row);

            return json($result);
        }
        return $this->view->fetch();
    }



}


