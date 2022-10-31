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
 *
 * @icon fa fa-circle-o
 */
class Scene extends Backend
{

    /**
     * Polling模型对象
     * @var \app\admin\model\Polling
     */
    protected $model = null;

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new \app\admin\model\Scene;

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
    public function add()
    {
        $engineering_id = $this->request->get('engineering_id');
        if ($this->request->isPost()) {
            $params = $this->request->post("row/a");
            if ($params) {
                $params = $this->preExcludeFields($params);
                $params['admin_id'] = $this->auth->id;
                $params['engineering_id'] = $engineering_id;

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
        $this ->assign('engineering_id',$engineering_id);
        return $this->view->fetch();
    }


    /**
     * 查看
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

            foreach($list as $key => $value){
                $list[$key]['url'] = $value['img'];
            }

            $result = array("total" => $list->total(), "rows" => $list->items());

            return json($result);
        }
        return $this->view->fetch();
    }

    public function emp(){
        //有用的参数  file_id  id  title  url
        $tmp = [
            [ 'file_id' =>138,
              'id' =>29,
              'title' =>'测试',
              'url' =>'/uploads/20210524/cc999a36faa7f4650f5e62e044780a76.jpg',
            ]
        ];

        return $tmp;
    }


}
