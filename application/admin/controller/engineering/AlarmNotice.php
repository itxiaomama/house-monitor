<?php

namespace app\admin\controller\engineering;

use app\admin\model\Engineering as EngineeringModel;
use app\admin\model\AlarmNotice as AlarmNoticeModel;
use app\admin\model\Staff as StaffModel;
use app\common\controller\Backend;
use Exception;
use think\Db;
use think\exception\PDOException;
use think\exception\ValidateException;

/**
 * 告警通知管理
 *
 * @icon fa fa-circle-o
 */
class AlarmNotice extends Backend
{

    /**
     * AlarmNotice模型对象
     * @var \app\admin\model\AlarmNotice
     */
    protected $model = null;

    //需要登录，不需要授权的方法
    protected $noNeedRight = ['get_staffs'];

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new \app\admin\model\AlarmNotice;

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
     * 工程管理-警情列表
     */
    public function index()
    {
        $engineering_id = $this->request->get("engineering_id");
        //当前是否为关联查询
        $this->relationSearch = true;
        //设置过滤方法
        $this->request->filter(['strip_tags', 'trim']);
        if ($this->request->isAjax()) {
            $type           = $this->request->get("type");//告警类型

            //如果发送的来源是Selectpage，则转发到Selectpage
            if ($this->request->request('keyField')) {
                return $this->selectpage();
            }
            list($where, $sort, $order, $offset, $limit) = $this->buildparams();

            $list = $this->model
                    ->with(['staff'])
                    ->where($where)
                    ->where('type',$type)
                    ->where('engineering_id',$engineering_id)
                    ->order($sort, $order)
                    ->paginate($limit);

            foreach ($list as $row) {

                $row->getRelation('staff')->visible(['id','staff_name','phone','email']);
            }

            $result = array("total" => $list->total(), "rows" => $list->items());

            return json($result);
        }
        $this->assign('engineering_id',$engineering_id);
        return $this->view->fetch();
    }


    /**
     * 添加
     */
    public function add()
    {
        $request = $this->request->request("");
        if ($this->request->isPost()) {
            $ids = $this->request->post("ids");
            $type = $this->request->post("type");
            $params['engineering_id'] = $this->request->post("engineering_id");
            if ($params) {
                $admin_id = $this->auth->id;

                $result = false;
                Db::startTrans();
                try {
                    //是否采用模型验证
                    if ($this->modelValidate) {
                        $name = str_replace("\\model\\", "\\validate\\", get_class($this->model));
                        $validate = is_bool($this->modelValidate) ? ($this->modelSceneValidate ? $name . '.add' : $name) : $this->modelValidate;
                        $this->model->validateFailException(true)->validate($validate);
                    }

                    $staff_ids = explode(',',$ids);
                    $data = [];
                    $staffOld = Db::name('staff')
                        ->field('id,phone,email')
                        ->where('id','in',$staff_ids)
                        ->select();

                    $staff = [];
                    foreach ($staffOld as $k=>$v){
                        $staff[$v['id']] = $v;
                    }


                    foreach ($staff_ids as $key => $staff_id){
                        $data[$key]['staff_id'] = $staff_id;
                        $data[$key]['engineering_id'] = $params['engineering_id'];
                        $data[$key]['admin_id'] = $admin_id;
                        $data[$key]['createtime'] = time();
                        $data[$key]['type'] = $type;
                        $data[$key]['phone'] = $staff[$staff_id]['phone'];
                        $data[$key]['email'] = $staff[$staff_id]['email'];
                    }
                    $result = $this->model->allowField(true)->saveAll($data);

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
        $this->assign('engineering_id',$request['engineering_id']);
        $this->assign('type',$request['type']);
        return $this->view->fetch();
    }


    /**
     * 添加
     */
    public function createAlarmNotice()
    {
        if ($this->request->isPost()) {
            $params = $this->request->post("");
            if ($params) {
                $params = $this->preExcludeFields($params);

                //参数验证   不能为空 &&  engineering_id&type 必须为int

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
                    $staff_ids = $params['staff_ids'];
                    $staff_ids = explode(",", $params['staff_ids']);

                    //兼容添加的多个员工id
                    foreach ($staff_ids as $staff_id)
                    {
                        $params['staff_id'] = $staff_id;
                        $result = $this->model->allowField(true)->save($params);
                    }

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
     *  获取员工
     *
     */
    public function get_staffs()
    {
        $engineering_id = $this->request->get('engineering_id');
        $type = $this->request->get('type');
        $engineering = EngineeringModel::get($engineering_id);
        $agency_id   = $engineering['monitor_id'];

        //过滤掉已经选择的人员
        $engineering_staff = AlarmNoticeModel::all(['engineering_id' => $engineering_id,'type'=>$type]);
        $staff_ids = [];
        foreach($engineering_staff as $v){
            $staff_ids[] = $v['staff_id'];
        }
        $staff       = StaffModel::getStaffListByAgencyId($agency_id,$staff_ids);

        return json(['rows' => $staff,'total'=>count($staff)]);
    }




}
