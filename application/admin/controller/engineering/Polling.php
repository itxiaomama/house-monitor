<?php

namespace app\admin\controller\engineering;

use app\common\controller\Backend;
use Exception;
use think\Db;
use think\exception\PDOException;
use think\exception\ValidateException;
use think\Session;
use app\admin\model\Staff as StaffModel;


/**
 *
 * 巡检报告管理
 * @icon fa fa-circle-o
 */
class Polling extends Backend
{

    /**
     * Polling模型对象
     * @var \app\admin\model\Polling
     */
    protected $model = null;

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new \app\admin\model\Polling;

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
     *
     */
    public function index()
    {
        $engineering_id = $this->request->get("engineering_id");

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
                ->where('engineering_id',$engineering_id)
                ->order($sort, $order)
                ->paginate($limit);

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
        if ($this->request->isPost()) {
            $params = $this->request->post("row/a");
            if ($params) {
                $params = $this->preExcludeFields($params);
                $params['admin_id'] = $this->auth->id;

                $engineering_id = $this->request->get("engineering_id");

                //查询绑定的人员id
                $staff = StaffModel::get(['admin_id' => $params['admin_id']]);

                if($this->auth->isSuperAdmin()){
                    $params['staff_name'] = 'admin';
                }else{
                    if(!empty($staff)){
                        $params['staff_id'] = $staff->id;
                        $params['staff_name'] = $staff->staff_name;
                    }
                }

                $result = false;
                Db::startTrans();
                try {
                    //是否采用模型验证
                    if ($this->modelValidate) {
                        $name = str_replace("\\model\\", "\\validate\\", get_class($this->model));
                        $validate = is_bool($this->modelValidate) ? ($this->modelSceneValidate ? $name . '.add' : $name) : $this->modelValidate;
                        $this->model->validateFailException(true)->validate($validate);
                    }
                    $params['engineering_id'] = $engineering_id;

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
        return $this->view->fetch();
    }


    /**
     * 添加
     */
    public function createPolling()
    {
        if ($this->request->isPost()) {
            $params = $this->request->post("");
            if ($params) {
                $params = $this->preExcludeFields($params);

                //参数验证  没做


                //文件的上传 base64
                $params['img'] = $this -> uploads($params['img']);

                $admin    = Session::get('admin');
                $admin_id = $admin['id'];
                $params['admin_id'] = $admin_id;

                $staff = StaffModel::get(['admin_id' => $admin_id]);
                $params['staff_id']   = $staff['id'];
                $params['staff_name'] = $staff['staff_name'];

                if ($this->dataLimit && $this->dataLimitFieldAutoFill) {
                    $params[$this->dataLimitField] = $this->auth->id;
                }
                $result = false;
                Db::startTrans();
                try {
                    //是否采用模型验证
                    if ($this->modelValidate) {
                        $name = str_replace("\\model\\", "\\validate\\", get_class($this->model));
                        $validate = is_bool($this->modelValidate) ? ($this->modelSceneValidate ? $name . '.add' : $name) : $this->modelValidate;
                        $this->model->validateFailException(true)->validate($validate);
                    }

                    $result = $this->model->allowField(true)->save($params);


                    Db::commit();
                } catch (ValidateException $e) {
                    Db::rollback();
                    $this->win(500,$e->getMessage());
                } catch (PDOException $e) {
                    Db::rollback();
                    $this->win(500,$e->getMessage());
                } catch (Exception $e) {
                    Db::rollback();
                    $this->win(500,$e->getMessage());
                }
                if ($result !== false) {
                    $this->win(200,'successful');
                } else {
                    $this->win(500,__('No rows were inserted'));
                }
            }
            $this->win(500,__('Parameter %s can not be empty', ''));
        }
    }



    /**
     *  bse64 的文件上传
     */
    public function uploads($img = "")
    {
        if(!empty($img)){
            $reg = '/data:image\/(\w+?);base64,(.+)$/si';
            preg_match($reg,$img,$match_result);

            $file_name = time().'.'.$match_result[1];

            $logo_path = ROOT_PATH.'public/uploads/polling/'.$file_name;
            $num = file_put_contents($logo_path,base64_decode($match_result[2]));

            $img  = '/uploads/avatar/' . $file_name;

            if($img)
            {
                return $img;
            }else{
                return 500;
            }

        }else{
        }
    }

}
