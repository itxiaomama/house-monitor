<?php

namespace app\admin\controller\engineering;

use app\admin\model\Engineering as EngineeringModel;
use app\admin\model\Staff as StaffModel;
use app\admin\model\EngineeringStaff as EngineeringStaffModel;
use app\common\controller\Backend;
use Exception;
use think\Db;
use think\exception\PDOException;
use think\exception\ValidateException;

/**
 * 工程人员参与管理
 *
 * @icon fa fa-circle-o
 */
class EngineeringStaff extends Backend
{

    /**
     * EngineeringStaff模型对象
     * @var \app\admin\model\EngineeringStaff
     */
    protected $model = null;
    protected $searchFields = 'staff.staff_name';

    //需要登录，不需要授权的方法
    protected $noNeedRight = ['get_staffs'];


    public function _initialize()
    {
        parent::_initialize();
        $this->model = new \app\admin\model\EngineeringStaff;

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
        $engineering_id = $this->request->get('engineering_id');
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
                    ->with(['staff'])
                    ->where($where)
                    ->where('engineering_id',$engineering_id)
                    ->order($sort, $order)
                    ->paginate($limit);

            foreach ($list as $row) {

                $row->getRelation('staff')->visible(['staff_name','phone','email']);
            }

            $result = array("total" => $list->total(), "rows" => $list->items());

            return json($result);
        }
        return $this->view->fetch();
    }


    /**
     * 添加参与人员
     * @param $engineering_id  : 1
     * @param $ids  13,16

     */
    public function add()
    {
        $engineering_id = $this->request->get("engineering_id");
        if ($this->request->isPost()) {
            $ids = $this->request->post("ids");


            $params['engineering_id'] = $this->request->post("engineering_id");
            if ($params) {
                //admin_id 写入数据的后台管理员id  adminid 为员工的管理员id
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
                    //当前工程所属的监测机构   该机构下所有的员工
                    $engineering = EngineeringModel::get($params['engineering_id']);

                    $staff = staffModel::all(['agency_id' => $engineering->monitor_id]);
                    $staff = array_select($staff,'admin_id');

                    $staff_ids = explode(',',$ids);
                    $data = [];
                    foreach ($staff_ids as $key => $staff_id){
                        //参与人员必须先分配账号
                        $has = Db::name('staff_admin')
                            ->where('staff_id',$staff_id)
                            ->find();
                        if(empty($has)){
                            return json(['code' => 0,'msg'=>'请先给该人员分配账号']);
                        }


                        $data[$key]['staff_id'] = $staff_id;
                        $data[$key]['engineering_id'] = $params['engineering_id'];
                        $data[$key]['admin_id'] = $admin_id;
                        $data[$key]['adminid'] = $staff[$staff_id];
                        $data[$key]['createtime'] = time();
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
        $this ->assign('engineering_id',$engineering_id);
        return $this->view->fetch();
    }


    /**
     *  获取员工
     *
     */
    public function get_staffs()
    {
        $engineering_id = $this->request->get('engineering_id');
        $engineering = EngineeringModel::get($engineering_id);
        $agency_id   = $engineering['monitor_id'];

        //过滤掉已经选择的人员
        $engineering_staff = EngineeringStaffModel::all(['engineering_id' => $engineering_id]);
        $staff_ids = [];
        foreach($engineering_staff as $v){
            $staff_ids[] = $v['staff_id'];
        }
        $staff       = StaffModel::getStaffListByAgencyId($agency_id,$staff_ids);

        return json(['rows' => $staff,'total'=>count($staff)]);
    }



}
