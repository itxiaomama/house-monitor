<?php

namespace app\admin\controller;

use app\admin\model\Staff as StaffModel;
use app\common\controller\Backend;
use Exception;
use think\Db;
use think\exception\PDOException;
use think\exception\ValidateException;
use think\Session;

/**
 * 监控视频
 *
 * @icon fa fa-circle-o
 */
class Monitoring extends Backend
{

    /**
     * Monitoring模型对象
     * @var \app\admin\model\Monitoring
     */
    protected $model = null;

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new \app\admin\model\Monitoring;

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
     * 添加
     */
    public function createMonitoring()
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
