<?php

namespace app\admin\controller\inspection;

use app\admin\model\Engineering as EngineeringModel;
use app\admin\model\Manual;
use app\common\controller\Backend;
use think\Db;
use think\Exception;

/**
 * 巡检历史
 *
 * @icon fa fa-circle-o
 */
class InspectionHistory extends Backend
{

    /**
     * InspectionHistory模型对象
     * @var \app\admin\model\InspectionHistory
     */
    protected $model = null;

    //搜索字段:任务名称&工程名称&房屋地址
    protected $searchFields = 'inspection.name,engineering_name,house.super_address';

    protected $noNeedRight = ['getPart'];

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
     * 巡检历史
     */
    public function index()
    {
        //设置过滤方法
        $this->request->filter(['strip_tags', 'trim']);
        if ($this->request->isAjax()) {

            $request = $this->request->param();

            $where1 = ' AND status = 1 AND confirm_completion = 1 AND confirm_audit = 1';

            if(isset($request['time'])   &&  isset($request['time'])){

                $timestamp  = strtotime(urldecode($request['time']));

                $monthLast  = date('t',$timestamp);

                $monthStart = (date('Y-m-1 00:00:00',$timestamp));

                $monthEnd   = (date('Y-m-'.$monthLast.' 23:59:59',$timestamp));

                $where1    .= " AND ( start_time between '{$monthStart}' AND '{$monthEnd}' OR end_time between '{$monthStart}' AND '{$monthEnd}' )";

            }else{

                //获取当月时间范围

                $timestamp  = time();

                $monthLast  = date('t',$timestamp);

                $monthStart = (date('Y-m-1 00:00:00',$timestamp));

                $monthEnd   = (date('Y-m-'.$monthLast.' 23:59:59',$timestamp));

                $where1    .= " AND ( start_time between '{$monthStart}' AND '{$monthEnd}' OR end_time between '{$monthStart}' AND '{$monthEnd}' )";
            }


            if(isset($request['is_time_out']) && $request['is_time_out'] == 0){
                $where1 .= " AND  end_time > '".date('Y-m-d H:i:s')."'";
            }

            if(isset($request['is_time_out']) && $request['is_time_out'] == 1){
                $where1 .= " AND end_time < '".date('Y-m-d H:i:s')."'";
            }

            $isSuperAdmin = $this->auth->isSuperAdmin();
            if(!$isSuperAdmin){
                //分配的任务
                $admin_id = $this->auth->id;
                $engineering_staff = Db::name('engineering_staff')
                    ->field('id,staff_id')
                    ->where('adminid', $admin_id)
                    ->find();

                $where1 .= " AND join_staff_id in ({$engineering_staff['staff_id']})";
            }


            //如果发送的来源是Selectpage，则转发到Selectpage
            if ($this->request->request('keyField')) {
                return $this->selectpage();
            }
            list($where, $sort, $order, $offset, $limit) = $this->buildparams();

            $list = $this->getInspectInfo($where,$sort,$order,$limit,$where1);

            foreach ($list as $row){

                $row->getRelation('house')->visible(['rate','structure','total_layer','address','super_address']);
            }

/*
            $list = $this->model
                ->with(['house'])
                ->where($where)
                ->where($where1)
                ->order($sort, $order)
                ->paginate($limit);

            //数据处理   1.去掉开始时间和结束时间的 时间部分  2。判断是否超时 3.标签

            $houseModel = new House();

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


                $row->city                 = $city;
                $row->address              = $row->house->address;
                $row->end_time             = explode(" ", $row->end_time)[0];
                $row->house_rate           = isset($houseModel->rate[$row->house->rate]) ? $houseModel->rate[$row->house->rate] : '未鉴定';
                $row->start_time           = explode(" ", $row->start_time)[0];
                $row->is_timeout           = strtotime($row->end_time) > time() ? 0 : 1;
                $row->house_structure      = isset($houseModel->structure[$row->house->structure]) ? $houseModel->structure[$row->house->structure] : '砖混结构';
                $row->house_total_layer    = $row->house->total_layer;
                $row->house_super_address  = $row->house->super_address;

                $row->getRelation('house')->visible(['rate','structure','total_layer','address','super_address']);
            }
*/
            $start  = Db::name('inspection')->order('start_time asc')->value('start_time');

            $end    = Db::name('inspection')->order('end_time desc')->value('end_time');

            $result = array("total" => $list->total(), "rows" => $list->items(),'start'=>$start,'end'=>$end);


            return json($result);
        }
        return $this->view->fetch();
    }



    /**
     * 巡检详情
     *
     */
    public function detail($ids = null)
    {
        $row         = $this->model->get($ids);
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
                    $row->status       = 1;
                    $row->time         = date("Y-m-d H:i:s",time());
                    $row->update_time  = time();
                    $result = $row->save();

                    //巡检部位
//                    halt(json_decode($params['part1'],true));

                    //先删除绑定的数据
                    $res = Db::name('inspection_part')
                        ->where('inspection_id',$ids)
                        ->delete();


                    $part1 = json_decode($params['part1'],true);
                    $part2 = json_decode($params['part2'],true);
                    $part3 = json_decode($params['part3'],true);
                    $part4 = json_decode($params['part4'],true);
                    $part5 = json_decode($params['part5'],true);
                    $part6 = json_decode($params['part6'],true);
                    $part7 = json_decode($params['part7'],true);
                    $part8 = json_decode($params['part8'],true);
                    $part9 = json_decode($params['part9'],true);
                    $part = array_merge($part1,$part2,$part3,$part4,$part5,$part6,$part7,$part8,$part9);


                    $res1 = Db::name('inspection_part')
                        ->where('inspection_id',$ids)
                        ->insertAll($part);



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

        //巡检部位

        $part10 = $this->getPart($ids,10);
        $part11 = $this->getPart($ids,11);
        $part12 = $this->getPart($ids,12);


        $address .= $row->address;


        $this->assign('part10', $part10);
        $this->assign('part11', $part11);
        $this->assign('part12', $part12);
        $this->assign('row', $row);
        $this->assign('house', $house);
        $this->assign('address', $address);
        $this->assign('engineering', $engineering);
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








}
