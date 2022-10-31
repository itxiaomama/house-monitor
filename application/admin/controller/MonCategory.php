<?php

namespace app\admin\controller;

use app\common\controller\Backend;
use think\Db;

/**
 * 监测类型
 *
 * @icon fa fa-circle-o
 */
class MonCategory extends Backend
{

    /**
     * MonCategory模型对象
     * @var \app\admin\model\MonCategory
     */
    protected $model = null;

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new \app\admin\model\MonCategory;

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
        $this->relationSearch = false;
        //设置过滤方法
        $this->request->filter(['strip_tags', 'trim']);
        if ($this->request->isAjax()) {
            //如果发送的来源是Selectpage，则转发到Selectpage
            if ($this->request->request('keyField')) {
                return $this->selectpage();
            }
            list($where, $sort, $order, $offset, $limit) = $this->buildparams();

            $list = $this->model
                    ->where($where)
                    ->order($sort, $order)
                    ->paginate($limit);

            foreach ($list as $row) {
                $row->visible(['id','mon_item_name']);

            }

            $result = array("total" => $list->total(), "rows" => $list->items());

            return json($result);
        }
        return $this->view->fetch();
    }

    /**
     * 分配监测内容
     *
     */
    public function allot($ids = null)
    {
        $mon_category_id = $ids;
        $has = Db::name('mon_category_type')
            ->field('id,mon_type_ids')
            ->where('mon_category_id',$mon_category_id)
            ->find();
        if ($this->request->isPost())
        {
            //监测内容id
            $mon_type = $this->request->post('row/a')['mon_types'];

            $mon_type_ids = '';
            foreach($mon_type as $v)
            {
                $mon_type_ids .= $v .',';
            }
            $mon_type_ids = substr($mon_type_ids, 0,-1);

            if(!empty($has))
            {
                $res = Db::name('mon_category_type')
                    ->where('mon_category_id',$mon_category_id)
                    ->update(['mon_type_ids' => $mon_type_ids,'updatetime' => time()]);
            }else{
                $res = Db::name('mon_category_type')
                    ->insert(['mon_category_id' => $mon_category_id, 'mon_type_ids' => $mon_type_ids,'createtime' => time()]);
            }

            $this->success();
            return true;
        }
            $mon_type_list_old = Db::name('mon_type')
            ->where('status',1)
            ->field('id,mon_type_name')
            ->select();

        $mon_type_list    = [];
        foreach ($mon_type_list_old as $k => $v) {
            $mon_type_list[$v['id']] = $v['mon_type_name'];
        }

        $mon_type_ids = [];
        if(!empty($has['mon_type_ids']))
        {
            $mon_type_ids = explode(",", $has['mon_type_ids']);
        }

        $this->assign('mon_category_id',$mon_category_id);
        $this->assign('mon_type_list',$mon_type_list);
        $this->assign('mon_type_ids',$mon_type_ids);
        return $this->view->fetch();
    }

}
