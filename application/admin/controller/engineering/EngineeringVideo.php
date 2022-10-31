<?php

namespace app\admin\controller\engineering;

use app\common\controller\Backend;
use Exception;
use think\Db;
use think\exception\PDOException;
use think\exception\ValidateException;
use app\admin\model\Video as VideoModel;

/**
 * 监控视频管理
 *
 * @icon fa fa-circle-o
 */
class EngineeringVideo extends Backend
{

    /**
     * EngineeringVideo模型对象
     * @var \app\admin\model\EngineeringVideo
     */
    protected $model = null;

    //需要登录，不需要授权的方法
    protected $noNeedRight = ['get_devs'];
    public function _initialize()
    {
        parent::_initialize();
        $this->model = new \app\admin\model\EngineeringVideo;

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
        $engineering_id = $this->request->get("engineering_id");
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
                    ->with(['video'])
                    ->where('engineering_id',$engineering_id)
                    ->where($where)
                    ->order($sort, $order)
                    ->paginate($limit);


            $result = array("total" => $list->total(), "rows" => $list->items());

            return json($result);
        }
        return $this->view->fetch();
    }

    /**
     * 添加
     * @param integer engineering_id   工程id
     * @return mixed
     */
    public function add()
    {
        $engineering_id = $this->request->get('engineering_id');
        if ($this->request->isPost()) {
            $params = $this->request->post("row/a");
            if ($params) {
                $params = $this->preExcludeFields($params);
                $params['engineering_id'] = $engineering_id;
                //传感器名称
                $video = VideoModel::get($params['dev_id']);
                $params['dev_name'] = $video->dev_name;

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
     *  监控设别选择
     *
     */
    public function get_devs()
    {
//        dev_code: "6L0A557PAJ996A0"
//        dev_name: "SD-96A0"
//        id: 4
        $this->request->filter(['strip_tags', 'trim']);
        if ($this->request->isAjax()) {
            //查找同一机构下的设备id  先查询所有
            $video = Db::name('video')
//            ->where()
                ->select();
            $result = array("total" => count($video), "rows" => $video);

            return json($result);
        }
        return $this->view->fetch();
    }

}
