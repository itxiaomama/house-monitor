<?php

namespace app\admin\controller\inspection;

use app\admin\model\Engineering as EngineeringModel;
use app\common\controller\Backend;
use think\Db;
use think\Exception;

/**
 * 巡检-房屋-前端管理
 *
 * @icon fa fa-circle-o
 */
class HouseFront extends Backend
{

    /**
     * HouseFront模型对象
     * @var \app\admin\model\HouseFront
     */
    protected $model = null;
    //搜索字段:任务名称&工程名称&房屋地址
    protected $searchFields = 'house.name,engineering_name,house.super_address';

    protected $noNeedRight  = ['houseFrontEdit'];

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new \app\admin\model\House;

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
        //设置过滤方法
        $this->request->filter(['strip_tags', 'trim']);
        if ($this->request->isAjax()) {

            //有权限的巡检任务  绑定的房屋信息
            $isSuperAdmin = $this->auth->isSuperAdmin();
            if(!$isSuperAdmin){
                //分配的任务
                $admin_id = $this->auth->id;
                $engineering_staff = Db::name('engineering_staff')
                    ->field('id,staff_id')
                    ->where('adminid', $admin_id)
                    ->find();
                $staff_id = $engineering_staff['staff_id'];
                $where['join_staff_id'] = $staff_id;
            }

            if ($this->request->request('keyField')) {
                return $this->selectpage();
            }
            list($where, $sort, $order, $offset, $limit) = $this->buildparams();

            $insModel = new \app\admin\model\Inspection;
            $list = $insModel
                ->with(['house'])
                ->where($where)
                ->order($sort, $order)
                ->paginate($limit);


            foreach ($list as &$row) {
                $row->getRelation('house')->visible(['id','name','year','address','lng','lat','rate','structure','total_layer','address','super_address']);
//                $house = $this->model
//                    ->where('id',$row->house_id)
//                    ->find();

                $row->id = $row->house->id;
                $row->name = $row->house->name;
                $row->year = $row->house->year;
                $row->address = $row->house->address;
                $row->lng = $row->house->lng;
                $row->lat = $row->house->lat;
                unset($row->house);

            }
            $result = array("total" => $list->total(), "rows" => $list->items());

            return json($result);

        }
        return $this->view->fetch();
    }



    /**
     * 房屋详情
     *
     */
    public function detail($ids = null)
    {
        $row  = $this->model->get($ids);
        if ($this->request->isPost()) {
            $params = $this->request->post("row/a");
            if ($params) {

                // 1. 巡检表任务表
                if ($params['type'] == 1){ //任务信息的提交

                    $row->note = $params['note'];
                    $row->feedback = $params['feedback'];
                    $result = $row->save();
                    $row->update_time  = time();

                    if($result){
                        $this->success();
                    }

                }elseif ($params['type'] == 2){ //巡检报告

                    $row->elevation    = $params['elevation'];
                    $row->house_status = $params['house_status'];
                    $row->house_assess = $params['house_assess'];
                    $row->other        = $params['other'];
                    $row->update_time  = time();
                    $result = $row->save();

                    if($result){
                        $this->success();
                    }
                }

            }
            $this->error(__('Parameter %s can not be empty', ''));
        }

        //房屋地址
        $city_ids = [
            $row->province,
            $row->city,
            $row->area,
            $row->street,
        ];
        $cityList = Db::name('area_code')
            ->field('id,name')
            ->where('id','in',$city_ids)
            ->select();

        $address     = "";
        foreach($cityList as $v){
            $address .= $v['name'] ;
        }

        $address .= $row->address;
        //鉴定等级的处理
        $rate = [ 1=>'A级',2=>'B级',3=>'C级',4=>'D级'];
        $row->rate =  $rate[$row->rate];

        $this->assign('row', $row);
        $this->assign('address', $address);
        return $this->view->fetch();
    }


    //处理程序
//    public function out(){
//        $inspection = Db::name('house')
//            ->field('id,street,province,city,area,address')
//            ->where('super_address','EQ','')
//            ->select();
//
//        foreach($inspection as $v){
//            $city_ids = [
//                $v['province'],
//                $v['city'],
//                $v['area'],
//                $v['street'],
//            ];
//            $cityList = Db::name('area_code')
//                ->field('id,name')
//                ->where('id','in',$city_ids)
//                ->select();
//
//            $address     = "";
//            foreach($cityList as $v1){
//                $address .= $v1['name'] ;
//            }
//            $super_address = $address.$v['address'];
//
//            $res = Db::name('house')
//                ->where('id',$v['id'])
//                ->update(['super_address'=> $super_address]);
//        }
//    }

public function houseFrontEdit(){
    try {
        $request = $this->request->param();

        $auth    = $this->parameterValidation(['house_id','lat','lng'],$request);

        if(!$auth){
            throw new Exception('缺失参数');
        }

        $result = Db::name('house')->where(['id'=>$request['house_id']])->update([
            'lat'           => $request['lat'],
            'lng'           => $request['lng'],
            'update_time'   => time()
        ]);

        if(!$result){
            throw new Exception('更新数据失败，请联系技术人员');
        }

        $arr = [
            'code'    => 200,
            'message' => 'success',
        ];

    }catch (Exception $exception){
        $arr = [
            'code'    => 0,
            'message' => $exception->getMessage(),
        ];
    }
    return json($arr);
}









}
