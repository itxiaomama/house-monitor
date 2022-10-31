<?php

namespace app\admin\controller;

use app\common\controller\Backend;
use Exception;
use think\Db;
use think\exception\PDOException;
use think\exception\ValidateException;

/**
 * 机构名称
 *
 * @icon fa fa-circle-o
 */
class Agency extends Backend
{

    /**
     * Agency模型对象
     * @var \app\admin\model\Agency
     */
    protected $model = null;
    protected $dataLimit = 'auth'; //表示显示当前自己和所有子级管理员的所有数据
    protected $dataLimitField = 'admin_id'; //数据关联字段,当前控制器对应的模型表中必须存在该字段


    public function _initialize()
    {
        parent::_initialize();
        $this->model = new \app\admin\model\Agency;

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

            $list = $this->model
                ->with(['agencycategory'])
                ->where($where)
                ->order($sort, $order)
                ->paginate($limit);

            foreach ($list as $row) {
                $row->visible(['id', 'agency_name', 'city', 'engineer_total', 'device_total', 'staff_total', 'exception_total','cs_end_time','create_time']);
                $row->visible(['agencycategory']);
                $row->getRelation('agencycategory')->visible(['id', 'name']);

                //修改统计数
                //工程数量
                $row->engineer_total = Db::name('engineering')->where('monitor_id',$row->id)->count();
                //设备总数  算的是：传感器的还是采集仪
                $row->device_total = Db::name('point')
                    ->where('agency_id',$row->id)
                    ->count();
                //报警总数
                $row->exception_total = Db::name('exception_alarm')->where('agency_id',$row->id)->count();
            }

            $result = array("total" => $list->total(), "rows" => $list->items());

            return json($result);
        }
        return $this->view->fetch();
    }

    /**
     * 添加
     */
    public function add()
    {
        $this->request->filter(['strip_tags', 'trim']);
        if ($this->request->isPost()) {
            $params = $this->request->post("row/a");
            if ($params) {
                $params = $this->preExcludeFields($params);

                //剔除参数为空的数据
                foreach ($params as $k => $v) {
                    if (empty($v)) {
                        unset($params[$k]);
                    }
                }

                if ($this->dataLimit && $this->dataLimitFieldAutoFill) {
                    $params[$this->dataLimitField] = $this->auth->id;
                }
                $result = false;
                Db::startTrans();
                try {
                    //是否采用模型验证
                    if ($this->modelValidate) {
                        $name     = str_replace("\\model\\", "\\validate\\", get_class($this->model));
                        $validate = is_bool($this->modelValidate) ? ($this->modelSceneValidate ? $name . '.add' : $name) : $this->modelValidate;
                        $this->model->validateFailException(true)->validate($validate);
                    }
                    //二级管理员 只能创建一个 监测类型的机构    代码没写
                    $params['create_time'] = time();

                    $result = $this->model->allowField(true)->save($params);
                    Db::commit();
                } catch (ValidateException $e) {
                    Db::rollback();
                    $this->error($e->getMessage());
                } catch (PDOException $e) {
                    Db::rollback();
                    $this->error($e->getMessage());
                } catch (Exception $e) {
                    Db::rollback();
                    $this->error($e->getMessage());
                }
                if ($result !== false) {
                    $this->success();
                } else {
                    $this->error(__('No rows were inserted'));
                }
            }
            $this->error(__('Parameter %s can not be empty', ''));
        }

        //查询分类   处理为一维数组
        $categoryListOld = Db::name('agency_category')
            ->field('id,name')->select();
        $categoryList    = [];
        foreach ($categoryListOld as $k => $v) {
            $categoryList[$v['id']] = $v['name'];
        }
        //如果当前管理员分组不为超级管理员 不能选择 监测单位
        $isSuperAdmin = $this->auth->isSuperAdmin();
        if(!$isSuperAdmin){
            unset($categoryList[4]);
        }


        $this->view->assign("categoryList", $categoryList);
        return $this->view->fetch();
    }

    /**
     * 编辑
     */
    public function edit($ids = null)
    {
        //查询分类   处理为一维数组
        $categoryListOld = Db::name('agency_category')
            ->field('id,name')->select();
        $categoryList    = [];
        foreach ($categoryListOld as $k => $v) {
            $categoryList[$v['id']] = $v['name'];
        }


        $row = $this->model->get($ids);

        if (!$row) {
            $this->error(__('No Results were found'));
        }
        $adminIds = $this->getDataLimitAdminIds();
        if (is_array($adminIds)) {
            if (!in_array($row[$this->dataLimitField], $adminIds)) {
                $this->error(__('You have no permission'));
            }
        }
        if ($this->request->isPost()) {
            $params = $this->request->post("row/a");
            if ($params) {
                $params = $this->preExcludeFields($params);
                foreach($params as $k=>$v){
                    if(empty($v)){
                        unset($params[$k]);
                    }
                }
                $result = false;
                Db::startTrans();
                try {
                    //是否采用模型验证
                    if ($this->modelValidate) {
                        $name     = str_replace("\\model\\", "\\validate\\", get_class($this->model));
                        $validate = is_bool($this->modelValidate) ? ($this->modelSceneValidate ? $name . '.edit' : $name) : $this->modelValidate;
                        $row->validateFailException(true)->validate($validate);
                    }
                    $result = $row->allowField(true)->save($params);
                    Db::commit();
                } catch (ValidateException $e) {
                    Db::rollback();
                    $this->error($e->getMessage());
                } catch (PDOException $e) {
                    Db::rollback();
                    $this->error($e->getMessage());
                } catch (Exception $e) {
                    Db::rollback();
                    $this->error($e->getMessage());
                }
                if ($result !== false) {
                    $this->success();
                } else {
                    $this->error(__('No rows were updated'));
                }
            }
            $this->error(__('Parameter %s can not be empty', ''));
        }
        $this->view->assign("row", $row);
        $this->view->assign("categoryList", $categoryList);
        return $this->view->fetch();
    }


}


