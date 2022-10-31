<?php

namespace app\admin\controller\inspection;

use app\admin\model\Point;
use app\admin\model\PointAlarm;
use app\common\controller\Backend;
use think\Db;
use app\admin\model\Engineering as EngineeringModel;
use app\admin\model\engineering\ProjectMonType as ProjectMonTypeModel;
use app\admin\model\Project as ProjectModel;
use think\Exception;
use think\exception\PDOException;
use think\exception\ValidateException;


/**
 * 巡检
 *
 * @icon fa fa-circle-o
 */
class InspectionFront extends Backend
{

    /**
     * InspectionFront模型对象
     * @var \app\admin\model\InspectionFront
     */
    protected $model = null;
    protected $type = [ 1 =>'建筑物', 2 =>'传感器']; //巡检类型:1=房屋,2=传感器

    //需要登录，不需要授权的方法
    protected $noNeedRight = ['confirmCompletion'];

    //搜索字段:任务名称&工程名称&房屋地址
    protected $searchFields = 'inspection.name,engineering_name,house.super_address';

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
     * 未巡检列表
     */
    public function index(){

        //设置过滤方法
        $this->request->filter(['strip_tags', 'trim']);

        if ($this->request->isAjax()) {

            $request = $this->request->param();

            $where1 = '  AND confirm_completion = 0 ';

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

            $list = (new \app\admin\model\Inspection())->getInspectInfo($where,$sort,$order,$limit,$where1);

            foreach ($list as $row){

                $row->getRelation('house')->visible(['rate','structure','total_layer','address','super_address']);
            }


            /*
            $list = $this->model
                ->with(['house'])
                ->where('status',0)
                ->where($where)
                ->where($where1)
                ->order($sort, $order)
                ->paginate($limit);
//            echo $this->model->getLastSql();exit;

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
            $start  = date('Y-m-d',strtotime('last month'));

            $end    = date('Y-m-d',strtotime('+1 month'));

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
                    Db::name('inspection_part')
                        ->where('inspection_id',$ids)
                        ->delete();


                    //2022年4月29日09:45:54 修改功能 part1~part9参数值不要 新增part10~part12具体备注对照数据库type值
                    /*
                    $part1  = json_decode($params['part1'],true);
                    $part2  = json_decode($params['part2'],true);
                    $part3  = json_decode($params['part3'],true);
                    $part4  = json_decode($params['part4'],true);
                    $part5  = json_decode($params['part5'],true);
                    $part6  = json_decode($params['part6'],true);
                    $part7  = json_decode($params['part7'],true);
                    $part8  = json_decode($params['part8'],true);
                    $part9  = json_decode($params['part9'],true);
                    */
                    $part10 = isset($params['part10']) ? json_decode($params['part10'],true) : [];
                    $part11 = isset($params['part11']) ? json_decode($params['part11'],true) : [];
                    $part12 = isset($params['part12']) ? json_decode($params['part12'],true) : [];


                    //$part = array_merge($part1,$part2,$part3,$part4,$part5,$part6,$part7,$part8,$part9,$part10,$part11,$part12);

                    $part = array_merge($part10,$part11,$part12);

                    Db::name('inspection_part')
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

        //巡检类型 是传感器的话，使用传感器的经纬度
        $type = $row->type;

        if($type == 2){
            $pointModel = new Point();
            if(!empty($row->point_id) ){
                $point = $pointModel
                    ->where('id',$row->point_id)
                    ->find();
                $house->lng = $point->lng;
                $house->lat = $point->lat;
            }
        }


        //如果已经巡检过了，显示填写的巡检信息: 未巡检的调取上次巡检此房屋的数据
        if($row->status == 0 && empty($row->audit_time)){
            //同一房屋的最新信息
            $_data = $this->getInsByHouseId($row->house_id);
            if(!empty($_data)){
                $row   = $_data['data'];
                $row->id = $ids;  //伪装成新数据

                $part10 = $_data['part']['part10'];
                $part11 = $_data['part']['part11'];
                $part12 = $_data['part']['part12'];
            }
        }

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

    /**
     *  通过房屋id获取最近一次的已巡检记录
     *
     */
    public function getInsByHouseId($house_id = null)
    {
        if(!empty($house_id)){
            $_data = $this->model
                ->where(['house_id'=>$house_id])
                ->where(['status' =>1])
                ->order('id desc')
                ->find();
            if(empty($_data)){
                return [];
            }

            $part10 = $this->getPart($_data->id,10);
            $part11 = $this->getPart($_data->id,11);
            $part12 = $this->getPart($_data->id,12);

            $part = compact('part10','part11','part12');


            return ['data'=>$_data,'part'=>$part];
        }

    }

    public function confirmCompletion(){

        try{
            $inspection_id = $this->request->param('inspection_id');

            if(!$inspection_id){
                throw new Exception('缺失参数');
            }

            $result = Db::name('inspection')->where(['id'=>$inspection_id])->update(['confirm_completion'=>1,'status'=>1,'update_time'=>time()]);

            if(!$result){
                throw new Exception('更新内容异常，请联系管理人员');
            }

            $arr = ['code' => 200,'message' => '已提交审核'];
        }catch(Exception $exception){
            $arr = ['code' => 0,'message' => $exception->getMessage()];
        }
        return json($arr);

    }




}
