<?php

namespace app\admin\controller\inspection;

use app\common\controller\Backend;
use think\Db;
use think\Exception;
use think\exception\PDOException;
use think\exception\ValidateException;
use app\admin\model\Engineering as EngineeringModel;
use app\admin\model\Staff as StaffModel;


/**
 * 巡检
 *
 * @icon fa fa-circle-o
 */
class Inspection extends Backend
{

    /**
     * Inspection模型对象
     * @var \app\admin\model\Inspection
     */
    protected $model = null;
    protected $noNeedRight = ['getProjectByEngId','getPointByProId']; //无需鉴权的方法,但需要登录

    protected $status = [0=>'未巡检',1=>'已巡检'];


    protected $type = [ 1 =>'建筑物', 2 =>'传感器']; //巡检类型:1=房屋,2=传感器

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new \app\admin\model\Inspection;
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

        $adminIds = $this->auth->getChildrenAdminIds(true);

        $engineering_staff = Db::name('engineering_staff')
            ->field('id,engineering_id')
            ->where('adminid','in',$adminIds)
            ->select();

        $engineering_ids = array_column($engineering_staff,'engineering_id');

        $engineering_staff = Db::name('engineering_staff')
            ->where('engineering_id','in',$engineering_ids)
            ->select();

        $staff_ids = array_column($engineering_staff,'staff_id');

        $staff = StaffModel::all($staff_ids);

        $staff_list = array_column($staff,'staff_name','id');

        $type = $this->type;

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

            $engineering_staff_ids = implode(',',$this->authMethod());
            $isSuperAdmin = $this->auth->isSuperAdmin();

            $where1 = '';
            if(!$isSuperAdmin){
                $where1 = "engineering_id in ({$engineering_staff_ids})";
            }


            $list = $this->model
                    ->with(['engineering'])
                    ->where($where)
                    ->where($where1)
                    ->order($sort, $order)
                    ->paginate($limit);

            if($list){
                foreach ($list as $row) {
                    $row->visible(['id','engineering_name','city','address','start_time','end_time','status','join_staff_name','super_staff_name','house_name','name','type']);
                    $row->visible(['engineering']);
                    $row->getRelation('engineering')->visible(['name','city','address']);
                }
            }


            $result = [
                "total"             => $list->total(),
                "rows"              => $list->items(),
                'type'              => $type,
                'status'            => $this->status,
                'super_staff_id'    => $staff_list,
                'join_staff_id'     => $staff_list,
            ];
            
            return json($result);
        }


        //巡检类型

        $this->assign('type',$type);

        $this->assign('staff_list',$staff_list);

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

                if(!$this->parameterValidation(['name','start_time','end_time','num'],$params)){

                    $this->error(__('缺失参数'));
                }

                $params = $this->preExcludeFields($params);

                $engineering = EngineeringModel::get($params['engineering_id']);
                $house       = new \app\admin\model\House();

                $house_id = $params['house_id'];
                $house_ids = explode(",", $house_id);


                $house_name = $params['house_name'];
                $house_names = explode(",", $house_name);

                unset($params['house_name']);
                unset($params['house_id']);

                //人员信息
                $join_staff = staffModel::get($params['join_staff_id']);
                $join_staff_name = $join_staff->staff_name;
                $super_staff = staffModel::get($params['super_staff_id']);
                $super_staff_name = $super_staff->staff_name;

                $tmp = [];
                $result = false;
                Db::startTrans();

                //频次来区分开始时间和结束时间
                $diff = (strtotime($params['end_time'])-strtotime( $params['start_time'] )) / $params['num'];

                try {
                    for ($x=1; $x<=$params['num']; $x++)
                    {
                        $params['end_time'] =  date('Y-m-d', strtotime( $params['start_time'] )+$diff);

                        foreach($house_ids as $k => $v)
                        {
                            if($params['type'] == 1){

                                $houseInfo = $house->get($v);

                                $manual = Db::name('manual')->insert([
                                    'build_name'    => $house_names[$k],
                                    'build_address' => !empty($houseInfo) ? $houseInfo->address : '',
                                    'build_era'     => !empty($houseInfo) ? $houseInfo->year    : '',
                                    'build_area'    => !empty($houseInfo) ? $houseInfo->acreage : '',
                                    'build_use'     => !empty($houseInfo) ? $houseInfo->use     : '',
                                    'inspector_id'  => $params['join_staff_id'],
                                    'inspector'     => $join_staff_name
                                ]);
                            }else{
                                $manual = [];
                            }


                            $tmp['engineering_id']      = !empty($engineering) ? $engineering->id   : '';
                            $tmp['engineering_name']    = !empty($engineering) ? $engineering->name : '';
                            $tmp['city']                = !empty($engineering) ? $engineering->city : '';
                            $tmp['address']             = !empty($engineering) ? $engineering->address: '';
                            $tmp['join_staff_name']     = $join_staff_name;
                            $tmp['super_staff_name']    = $super_staff_name;
                            $tmp['house_id']            = $v;
                            $tmp['house_name']          = $house_names[$k];
                            $tmp['create_time']         = time();
                            $tmp['manual_id']           = !empty($manual) ? Db::name('manual')->getLastInsID() : '';

                            $data = array_merge($params,$tmp);
                            unset($data['num']);


                            $result = Db::name('inspection')->insert($data);

                            $tmp = [];
                        }

                        $params['start_time'] =  date('Y-m-d', strtotime( $params['end_time'] )+ 24*60*60);
                    }

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
        //有权限的工程
        $adminIds = $this->auth->getChildrenAdminIds(true);

        $engineering_staff = Db::name('engineering_staff')
            ->field('id,engineering_id')
            ->where('adminid','in',$adminIds)
            ->select();

        $engineering_ids = [];
        foreach ($engineering_staff as $v)
        {
            $engineering_ids[] = $v['engineering_id'];
        }
        $engineering = EngineeringModel::all($engineering_ids);

        $engineering_list = array();
        foreach ($engineering as $k1 => $v1) {
            $engineering_list[$v1['id']] = $v1['name'];
        }

        //人员信息  当前人员所拥有权限的工程  工程下的参与人员
        $engineering_staff = Db::name('engineering_staff')
            ->where('engineering_id','in',$engineering_ids)
            ->select();


        $staff_ids = [];
        foreach ($engineering_staff as $k2 => $v2) {
            $staff_ids[] = $v2['staff_id'];
        }

        $staff = StaffModel::all($staff_ids);
        $staff_list = array();
        foreach ($staff as $k3 => $v3) {
            $staff_list[$v3['id']] = $v3['staff_name'];
        }

        //巡检类型
        $type = $this->type;


        $this->assign('engineering_list',$engineering_list);
        $this->assign('staff_list',$staff_list);
        $this->assign('type',$type);
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


                    $params['join_staff_name']  = (staffModel::get($params['join_staff_id']))->staff_name;

                    $params['super_staff_name'] = (staffModel::get($params['super_staff_id']))->staff_name;

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
        //有权限的工程
        $adminIds = $this->auth->getChildrenAdminIds(true);

        $engineering_staff = Db::name('engineering_staff')
            ->field('id,engineering_id')
            ->where('adminid','in',$adminIds)
            ->select();

        $engineering_ids = [];
        foreach ($engineering_staff as $v)
        {
            $engineering_ids[] = $v['engineering_id'];
        }
        $engineering = EngineeringModel::all($engineering_ids);

        $engineering_list = array();
        foreach ($engineering as $k1 => $v1) {
            $engineering_list[$v1['id']] = $v1['name'];
        }

        //人员信息  当前人员所拥有权限的工程  工程下的参与人员
        $engineering_staff = Db::name('engineering_staff')
            ->where('engineering_id','in',$engineering_ids)
            ->select();


        $staff_ids = [];
        foreach ($engineering_staff as $k2 => $v2) {
            $staff_ids[] = $v2['staff_id'];
        }

        $staff = StaffModel::all($staff_ids);
        $staff_list = array();
        foreach ($staff as $k3 => $v3) {
            $staff_list[$v3['id']] = $v3['staff_name'];
        }
        //巡检类型
        $type = $this->type;

        $this->assign('type',$type);
        $this->assign('engineering_list',$engineering_list);
        $this->assign('staff_list',$staff_list);
        $this->view->assign("row", $row);
        return $this->view->fetch();
    }



    /**
     * 以工程id获取项目信息
     */
    public function getProjectByEngId()
    {
        $engineering_id = $this->request->post('engineering_id');

        $keyValue = $this->request->post("keyValue");
        $keyField = $this->request->post("keyField");
        $where = [];
        if(!empty($keyValue)){
            $where[$keyField] = $keyValue;
        }

        $project = Db::name('project')
            ->field('id,item_name')
            ->where('engineering_id',$engineering_id)
            ->where($where)
            ->select();


        $data = [
            'list' => $project,
            'total' => count($project)
        ];
        return $data;
    }



    /**
     * 以项目id获取测点信息
     */
    public function getPointByProId()
    {
        $project_id = $this->request->post('project_id');

        $keyValue = $this->request->post("keyValue");
        $keyField = $this->request->post("keyField");
        $where = [];
        if(!empty($keyValue)){
            $where[$keyField] = $keyValue;
        }


        $point = Db::name('point')
            ->field('id,point_code')
            ->where('project_id',$project_id)
            ->where($where)
            ->select();


        $data = [
            'list' => $point,
            'total' => count($point)
        ];
        return $data;
    }




}
