<?php

namespace app\admin\controller\inspection;

use app\admin\model\Engineering as EngineeringModel;
use app\common\controller\Backend;
use think\Db;
use think\Exception;

/**
 * 审核
 *
 * @icon fa fa-circle-o
 */
class InspectionAudit extends Backend
{

    /**
     * InspectionAudit模型对象
     * @var \app\admin\model\InspectionAudit
     */
    protected $model = null;
    protected $audit_status = [0=>'未审核',1=> '审核通过',2=>'驳回']; //审核状态
    protected $noNeedRight = ['confirmAudit'];

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
     * 需要审核的巡检列表
     */
    public function index()
    {



        //设置过滤方法
        $this->request->filter(['strip_tags', 'trim']);
        if ($this->request->isAjax()) {

            $isSuperAdmin = $this->auth->isSuperAdmin();
            if(!$isSuperAdmin){
                //分配的任务
                $admin_id = $this->auth->id;
                $engineering_staff = Db::name('engineering_staff')
                    ->field('id,staff_id')
                    ->where('adminid', $admin_id)
                    ->find();
                $staff_id = $engineering_staff['staff_id'];
                $where['super_staff_id'] = $staff_id; //监督人员id
            }

            //如果发送的来源是Selectpage，则转发到Selectpage
            if ($this->request->request('keyField')) {
                return $this->selectpage();
            }
            list($where, $sort, $order, $offset, $limit) = $this->buildparams();

            $list = $this->getInspectInfo($where,$sort,$order,$limit," AND status = 1 AND confirm_completion = 1");

            $houseColl = new House();

            foreach ($list as $row){

                unset($row->house_rate);

//                $row->house->rate = $houseColl->rate[$row->house->rate];

                $row->getRelation('house')->visible(['rate','structure','total_layer','address']);
            }


            /*
            $list = $this->model
                ->with(['house'])
                ->where('status = 1 AND confirm_completion = 1')  //已巡检
                ->where($where)
                ->order($sort, $order)
                ->paginate($limit);

            //数据处理   1.去掉开始时间和结束时间的 时间部分  2。判断是否超时 3.标签
            foreach ($list as $row) {
                //房屋地址
                $city_ids = [
                    $row->house->province,
                    $row->house->city,
                    $row->house->area,
                    $row->house->street,
                ];
                $cityList = Db::name('area_code')
                    ->field('id,name')
                    ->where('id','in',$city_ids)
                    ->select();

                $city     = "";
                foreach($cityList as $v){
                    $city .= $v['name'] ;
                }
                $row->city    = $city;
                //是否超时
                $is_timeout = 1;
                if(strtotime($row->end_time) > time() ) {
                    $is_timeout = 0;
                }
                //鉴定等级
                $rate = [ 1=>'A级',2=>'B级',3=>'C级',4=>'D级'];
                $row->house->rate = $rate[$row->house->rate];
                $row->start_time = explode(" ", $row->start_time)[0];
                $row->end_time   = explode(" ", $row->end_time)[0];
                $row->address    = $row->house->address;
                $row->is_timeout    = $is_timeout;
                $row->is_timeout    = $is_timeout;
                $row->getRelation('house')->visible(['rate','structure','total_layer','address']);
            }
*/
            $result = array("total" => $list->total(), "rows" => $list->items());

            return json($result);
        }



        return $this->view->fetch();
    }



    /**
     * 查看详情
     *
     */
    public function detail($ids = null)
    {
        $row    = $this->model->get($ids);

        if ($this->request->isPost()) {
            $params = $this->request->post("row/a");
            if ($params) {

                if ($params['type'] == 2){ //审核报告

                    $row->audit_status = $params['audit_status'];
                    $row->audit_time   = date("Y-m-d H:i:s",time());
                    $row->update_time  = time();
                    $result = $row->save();

                    if($result){
                        $this->success();
                    }
                }

            }
            $this->error(__('Parameter %s can not be empty', ''));
        }


        $engineering = engineeringModel::get($row->engineering_id);
        $house       = \app\admin\model\House::get($row->house_id);
        //房屋地址
        $city_ids = [
            $house->province,
            $house->city,
            $house->area,
            $house->street,
        ];
        $cityList = Db::name('area_code')
            ->field('id,name')
            ->where('id','in',$city_ids)
            ->select();

        $address     = "";
        foreach($cityList as $v){
            $address .= $v['name'] ;
        }


        $part10 = $this->getPart($ids,10);
        $part11 = $this->getPart($ids,11);
        $part12 = $this->getPart($ids,12);

        $address .= $row->address;

        $audit_status = $this->audit_status;

        $this->assign('part10', $part10);
        $this->assign('part11', $part11);
        $this->assign('part12', $part12);
        $this->assign('row', $row);
        $this->assign('house', $house);
        $this->assign('address', $address);
        $this->assign('engineering', $engineering);
        $this->assign('audit_status', $audit_status);
        return $this->view->fetch();
    }

    public function getPart($inspection_id,$type)
    {
        $part = Db::name('inspection_part')
            ->field('inspection_id,type,issue,issue_desc,issue_img')
            ->where('inspection_id',$inspection_id)
            ->where('type',$type)
            ->select();
        return json_encode($part);

    }

    public function confirmAudit(){

        try{
            $request = $this->request->param();

            $auth    = $this->parameterValidation(['inspection_id','confirm_audit'],$request);

            if(!$auth){
                throw new Exception('缺失参数');
            }

            $manual  = \app\admin\model\Inspection::get(['id'=>$request['inspection_id']]);

            Db::startTrans();

            if($request['confirm_audit'] == 1){
                $data = ['confirm_audit'=>$request['confirm_audit'],'update_time'=>time(),'audit_status'=>1,'audit_time'=>date('Y-m-d H:i:s')];
            }else{
                $data = ['status'=>0,'confirm_completion'=>0,'time'=>null,'audit_status'=>0,'audit_time'=>date('Y-m-d H:i:s'),'update_time'=>time()];

                Db::name('inspection_over_rule')->insert([
                    'inspection_id' => $request['inspection_id'],
                    'manual_id'     => $manual->manual_id
                ]);

            }
            $result = Db::name('inspection')->where(['id'=>$request['inspection_id']])->update($data);

            if(!$result){
                Db::rollback();
                throw new Exception('更新内容异常，请联系管理人员');
            }
            Db::commit();
            $arr = ['code' => 200,'message' => '通过'];
        }catch(Exception $exception){
            Db::rollback();
            $arr = ['code' => 0,'message' => $exception->getMessage()];
        }
        return json($arr);

    }



}
