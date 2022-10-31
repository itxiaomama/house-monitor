<?php

namespace app\admin\controller;

use app\admin\model\AuthGroup;
use app\admin\model\ConfigApi;
use app\common\controller\Backend;
use Exception;
use fast\Random;
use fast\Tree;
use think\Db;
use think\exception\PDOException;
use think\exception\ValidateException;
use app\admin\model\AlarmNotice;



/**
 * 人员管理
 *
 * @icon fa fa-circle-o
 */
class Staff extends Backend
{

    /**
     * Staff模型对象
     * @var \app\admin\model\Staff
     */
    protected $model = null;
    protected $groupdata = null;
    protected $childrenGroupIds = [];
    protected $childrenAdminIds = [];

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new \app\admin\model\Staff;

        $this->childrenAdminIds = $this->auth->getChildrenAdminIds($this->auth->isSuperAdmin());
        $this->childrenGroupIds = $this->auth->getChildrenGroupIds($this->auth->isSuperAdmin());

        $groupList = collection(AuthGroup::where('id', 'in', $this->childrenGroupIds)->select())->toArray();

        Tree::instance()->init($groupList);
        $groupdata = [];
        if ($this->auth->isSuperAdmin()) {
            $result = Tree::instance()->getTreeList(Tree::instance()->getTreeArray(0));
            foreach ($result as $k => $v) {
                $groupdata[$v['id']] = $v['name'];
            }
        } else {
            $result = [];
            $groups = $this->auth->getGroups();
            foreach ($groups as $m => $n) {
                $childlist = Tree::instance()->getTreeList(Tree::instance()->getTreeArray($n['id']));
                $temp = [];
                foreach ($childlist as $k => $v) {
                    $temp[$v['id']] = $v['name'];
                }
                $result[__($n['name'])] = $temp;
            }
            $groupdata = $result;
        }

        $this->groupdata = $groupdata;

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
     * 查看该机构下的人员
     * @params  agency_id  机构id
     * @return mixed
     */
    public function index($ids = null)
    {
        $agency_id = $ids;
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
                ->where('agency_id', $agency_id)
                ->order($sort, $order)
                ->paginate($limit);

            foreach ($list as $row) {
                $row->visible(['id', 'staff_name', 'phone', 'duty', 'project_count']);
            }

            $result = array("total" => $list->total(), "rows" => $list->items());

            return json($result);
        }
        $this->assign('agency_id', $agency_id);
        return $this->view->fetch();
    }

    /**
     * 添加
     */
    public function add($agency_id = 0)
    {
        if ($this->request->isPost()) {
            $params = $this->request->post("row/a");
            if ($params) {
                $params = $this->preExcludeFields($params);

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
                    $result = $this->model->allowField(true)->save($params);
                    Db::commit();
                    //修改机构中的人员数量
                    $staff_total = Db::name('staff')->where('agency_id', $agency_id)->count();
                    Db::name('agency')->where('id', $agency_id)->update(['staff_total' => $staff_total]);
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
        $this->assign('agency_id', $agency_id);
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
            $pk       = $this->model->getPk();
            $adminIds = $this->getDataLimitAdminIds();
            if (is_array($adminIds)) {
                $this->model->where($this->dataLimitField, 'in', $adminIds);
            }
            $list = $this->model->where($pk, 'in', $ids)->select();

            $count = 0;
            Db::startTrans();
            try {
                foreach ($list as $k => $v) {
                    $count += $v->delete();

                    //修改机构中的人员数量
                    $staff_total = Db::name('staff')->where('agency_id', $v->agency_id)->count();
                    Db::name('agency')->where('id', $v->agency_id)->update(['staff_total' => $staff_total]);

                    //删除staff_admin 和 admin 的数据
                    Db::name('staff_admin')->where('staff_id', $v->id)->delete();
                    Db::name('admin')->where('id', $v->admin_id)->delete();

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
     * 分配账号
     */
    public function account_assignment_show($ids = null)
    {

        if ($this->request->isPost()) {
            $params = $this->request->post("row/a");
            if ($params) {
                $params = $this->preExcludeFields($params);
                $staff_id = $params['staff_id'];
                $result = false;
                Db::startTrans();
                try {

                    $staffAdminModel = new \app\admin\model\StaffAdmin;
                    $staffAdminRow = $staffAdminModel->get(['staff_id' => $staff_id]);
                    //创建数据
                    if($staffAdminRow){
                        $res = $staffAdminRow -> save($params);
                        $staff = $this->model->get($staff_id);
                        $admin_id = $staff->admin_id;
                    }else{
                        $res = $staffAdminModel -> save($params);
                        $admin_id = 0;
                    }

                    //创建后台账号
                    $params['salt']     = Random::alnum();
                    $params['password'] = md5(md5($params['password']) . $params['salt']);
                    $params['avatar']   = '/assets/img/avatar.png'; //设置新管理员默认头像。
                    $params['nickname'] = $params['username']; //设置新管理员默认头像。


                    $adminModel = new \app\admin\model\Admin;
                    $group = [$params['group_id']];
                    unset($params['group_id']);
                    unset($params['staff_id']);


                    if($admin_id == 0){
                        $result = $adminModel->validate('Admin.staff_add')->allowField(true)->save($params);
                        if ($result === false)
                        {
                            exception($adminModel->getError());
                        }
                        $admin_id = $adminModel->id ;

                    }else{ //修改数据
                        $params['updatetime'] = time();
                        $result = Db::name('admin')->where('id',$admin_id)->update($params);
                        // 先移除所有权限
                        model('AuthGroupAccess')->where('uid', $admin_id)->delete();
                    }

                    //赋予权限
                    // 过滤不允许的组别,避免越权
                    $group = array_intersect($this->childrenGroupIds, $group);
                    if (!$group) {
                        exception(__('The parent group exceeds permission limit'));
                    }

                    $dataset = [];
                    foreach ($group as $value) {
                        $dataset[] = ['uid' => $admin_id, 'group_id' => $value];
                    }
                    model('AuthGroupAccess')->saveAll($dataset);


                    //staff表更新admin_id  字段
                    Db::name('staff')->where('id',$staff_id)->update(['admin_id' => $admin_id,'updatetime'=>time()]);

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
        $row = Db::name('staff_admin')->where('staff_id',$ids)->find();
        $this->assign('staff_id', $ids);
        $this->assign('row', $row);
        $this->assign('groupdata', $this->groupdata);
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
                    $result = $row->allowField(true)->save($params);
                    //修改关联的项目警情通知的联系方式
                    $this->updateAlarmNotice($ids);

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
        return $this->view->fetch();
    }

    /**
     *
     * 修改关联的项目警情通知的联系方式
     */
    public function updateAlarmNotice($ids)
    {
        $row = $this->model->get($ids);

        $has = AlarmNotice::all(['staff_id' => $ids]);
        if($has){
            $res = Db::name('alarm_notice')
                ->where(['staff_id'=>$ids])
                ->update(['phone'=>$row->phone,
                    'email'=>$row->email
                    ]);
        }

    }

    /**
     *
     *获取树状数据
     */
    public function getTreeList(){




    }




}
