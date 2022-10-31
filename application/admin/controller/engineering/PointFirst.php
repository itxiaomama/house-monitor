<?php

namespace app\admin\controller\engineering;

use app\admin\model\engineering\ProjectMonType as ProjectMonTypeModel;
use app\admin\model\MonType as MonTypeModel;
use app\common\controller\Backend;
use think\Db;
use think\exception\PDOException;
use think\exception\ValidateException;

/**
 * 测点-初始值管理
 *
 * @icon fa fa-circle-o
 */
class PointFirst extends Backend
{

    /**
     *  pointFirst模型对象
     * @var \app\admin\model\ pointFirst
     */
    protected $model = null;

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new \app\admin\model\PointFirst;

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
     * @params $item_id 项目监测id
     * @params $ids  测点id
     */
    public function index()
    {
        $item_id =  $this->request->get("item_id");
        $ids     =  $this->request->get("ids");

        $project_mon_type = ProjectMonTypeModel::get($item_id);
        $models = $this->getAlarmSetInit($project_mon_type->mon_type_id);

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
                ->where('point_id', 'in',$ids)
                ->order($sort, $order)
                ->paginate($limit);

            $result = array("total" => $list->total(), "rows" => $list->items());

            return json($result);
        }

        $this->assignconfig('demo',
            ['item_id'=>$item_id,
            'point_id'=>$ids,
             'models'=>$models
            ]);

        return $this->view->fetch();
    }

    /**
     * 添加
     */
    public function add()
    {
        $item_id  =  $this->request->get("item_id");
        $point_id =  $this->request->get("point_id");

        $project_mon_type = ProjectMonTypeModel::get($item_id);
        $models = $this->getAlarmSetInit($project_mon_type->mon_type_id);

        if ($this->request->isPost()) {
            $params = $this->request->post("row/a");
            if ($params) {
                $params = $this->preExcludeFields($params);
            //参数的处理
            $_params = $this->request->post("out/a");
            $_params =  array_values($_params);
            $array = ['first_data1','first_data2','first_data3','first_data4','first_data5','first_data6','first_data7','first_data8'];
            foreach($_params as $key => $val){
                $params[$array[$key]] = $val;
            }
                $params['point_id'] = $point_id;

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
        $this->assignconfig('demo',
            ['item_id'=>$item_id,
             'point_id'=>$point_id,
             'models'=>$models
            ]);

        $this->assign('models',$models);
        return $this->view->fetch();
    }


    /**
     * 编辑
     */
    public function edit($ids = null)
    {
        $item_id  =  $this->request->get("item_id");
        $point_id =  $this->request->get("point_id");

        $project_mon_type = ProjectMonTypeModel::get($item_id);
        $oldModels = $this->getAlarmSetInit($project_mon_type->mon_type_id);

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

                //参数的处理
                $_params = $this->request->post("out/a");
                $_params =  array_values($_params);
                $array = ['first_data1','first_data2','first_data3','first_data4','first_data5','first_data6','first_data7','first_data8'];
                foreach($_params as $key => $val){
                    $params[$array[$key]] = $val;
                }

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
        //models的处理
        $models = [];
        foreach ($oldModels as $key => $model){
            $models['first_'.$key] = $model;
        }

        $this->assign('models',$models);
        $this->view->assign("row", $row);
        return $this->view->fetch();
    }

    /**
     * 根据 监测内容id 获取 参数
     * @param integer $mon_type_id
     * @return mixed
     */
    public function getAlarmSetInit($mon_type_id)
    {
        $mon_type = MonTypeModel::get($mon_type_id);
        if(empty($mon_type))
        {
            return [];
        }
        $mon_type = $mon_type->toArray();

        unset($mon_type['id']);
        unset($mon_type['mon_type_name']);
        unset($mon_type['status']);

        //剔除空的数组
        foreach($mon_type as $k=>$v){
                if(empty($v) || strpos($k,"_this") || strpos($k,"_rate") || strpos($k,"_total") ){
                unset($mon_type[$k]);
            }
        }

        $number = 0;
        $jianfa = 0;
        foreach ($mon_type as $key => $value){
            $number++;
            $isset = strpos($key,'param');
            if(isset($isset)){

                $jianfa++;
                 $str  = 'data'.$number;
                 $prr  = 'param'.$jianfa;

                $mon_type[$str] = $value;
                unset($mon_type[$prr]);

            }

        }



        return $mon_type;
    }

}
