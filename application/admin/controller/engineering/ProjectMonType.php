<?php

namespace app\admin\controller\engineering;

use app\common\controller\Backend;
use Exception;
use think\Db;
use think\exception\PDOException;
use think\exception\ValidateException;
use app\admin\model\Plan as PlanModel;

/**
 * 项目-监测内容管理
 *
 * @icon fa fa-circle-o
 */
class ProjectMonType extends Backend
{

    /**
     * Project_mon_type模型对象
     * @var \app\admin\model\engineering\Project_monType
     */
    protected $model = null;

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new \app\admin\model\engineering\ProjectMonType;

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
            //项目id
            $project_id = $this->request->get("id");

            list($where, $sort, $order, $offset, $limit) = $this->buildparams();

            if(!empty($project_id))
            {
                $list = $this->model
                    ->where($where)
                    ->where(['project_id'=>$project_id])
                    ->order($sort, $order)
                    ->paginate($limit);
            }else{
                $list = $this->model
                    ->where($where)
                    ->order($sort, $order)
                    ->paginate($limit);
            }

            //测点数量
            foreach ($list as &$v){
                $v-> point_num = Db::name('point')
                    ->where('project_mon_type_id',$v->id)
                    ->count();
            }

            $result = array("total" => $list->total(), "rows" => $list->items());

            return json($result);
        }
        return $this->view->fetch();
    }


    /**
     * 编辑
     */
    public function edit($ids = null)
    {
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
                $result = false;
                Db::startTrans();
                try {
                    //是否采用模型验证
                    if ($this->modelValidate) {
                        $name = str_replace("\\model\\", "\\validate\\", get_class($this->model));
                        $validate = is_bool($this->modelValidate) ? ($this->modelSceneValidate ? $name . '.edit' : $name) : $this->modelValidate;
                        $row->validateFailException(true)->validate($validate);
                    }
                    //需求:修改报警方案后，测点的报警方案也随之改变   ps：伪需求

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
        //报警方案
        $plan = PlanModel::get($row->plan_id);
        $plan_name = "";
        if($plan){
            $plan_name = $plan->plan_name;
        }else{
            $row->plan_id = 0; //plan是已删除的话，改为默认0
        }
        $this->view->assign("row", $row);
        $this->view->assign("project_id", $row->project_id);
        $this->view->assign("plan_name", $plan_name);
        return $this->view->fetch();
    }

    /**
     * 删除
     */
    public function del($ids = "")
    {
        if (!$this->request->isPost()) {
            $this->error(__("Invalid parameters"));
        }
        $ids = $ids ? $ids : $this->request->post("ids");
        if ($ids) {
            $pk = $this->model->getPk();
            $adminIds = $this->getDataLimitAdminIds();
            if (is_array($adminIds)) {
                $this->model->where($this->dataLimitField, 'in', $adminIds);
            }
            $list = $this->model->where($pk, 'in', $ids)->select();
            $this->pointIsDel($ids);

            $count = 0;
            Db::startTrans();
            try {
                foreach ($list as $k => $v) {
                    $count += $v->delete();
                }
                Db::commit();
            } catch (PDOException $e) {
                Db::rollback();
                $this->error($e->getMessage());
            } catch (Exception $e) {
                Db::rollback();
                $this->error($e->getMessage());
            }
            if ($count) {
                $this->success();
            } else {
                $this->error(__('No rows were deleted'));
            }
        }
        $this->error(__('Parameter %s can not be empty', 'ids'));
    }

    /**
     * 检测该项目监测内容下的测点是否已经删除
     * @param $ids  array 项目监测内容ids
     * @return mixed
     */
    public function pointIsDel($ids)
    {
        $has  = Db::name('point')
            ->where('project_mon_type_id','in',$ids)
            ->count();
        if($has){
            $this->error('该监测内容下的测点还未删除，请先删除');
        }

    }



}
