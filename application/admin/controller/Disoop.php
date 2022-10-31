<?php

namespace app\admin\controller;

use app\admin\model\AreaCode;
use app\admin\model\Data;
use app\admin\model\Inspection;
use app\admin\model\MonType as MonTypeModel;
use app\admin\model\Point;
use app\api\model\ConfigApi as ConfigApiModel;
use app\common\controller\Backend;
use app\console\common\CommandProcess;
use GuzzleHttp\Client;
use think\Db;
use app\admin\model\Engineering as EngineeringModel;
use app\admin\model\Agency as AgencyModel;
use app\admin\model\Project as ProjectModel;
use think\Exception;
use think\Request;


/**
 *
 *
 * @icon fa fa-circle-o
 */
class Disoop extends Backend
{

    /**
     * Display模型对象
     * @var \app\admin\model\Display
     */
    protected $model = null;

    //需要登录，不需要授权的方法
    protected $noNeedRight = ['getHouseInfo','getAreaInspectInfo','Inspectpercentage','engineeringInfor','getAreaInfo','getPointInfo'];

    protected $url = 'http://monitor.cngiantech.com';

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new \app\admin\model\Display;

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
     * 查看 @已弃用
     */
    public function index()
    {
        return $this->view->fetch();
    }


    public function getHouseInfo(){

        try {
            $area   = $this->request->param('area', '');
            $street = $this->request->param('street', '');

            if (!$area || !$street) {
                throw new Exception('缺失参数');
            }

            $engineering_staff_ids = $this->authMethod();
            $isSuperAdmin          = $this->auth->isSuperAdmin();

            $where = [];

            if (!$isSuperAdmin) {
                $where['id'] = ['in', $engineering_staff_ids];
            }



            $areaCode   = Db::name('area_code')->where('name', $area)->value('id');
            $streetCode = Db::name('area_code')->where(['name' => $street])->value('id');
            $house      = Db::name('house')->where(['area' => $areaCode, 'street' => $streetCode])->select();
            $enginner   = Db::name('engineering')->where($where)->where('city','like','%'.$area.'/'.$street.'%')->select();
            foreach ($enginner as &$value){
                $value['item_map_image'] = !empty($value['item_map_image']) ? $this->url . $value['item_map_image'] : '';
                $value['plan_file_file'] = !empty($value['plan_file_file']) ? $this->url . $value['plan_file_file'] : '';
                $value['bim_file_file']  = !empty($value['bim_file_file'])  ? $this->url . $value['bim_file_file']  : '';
            }

            $arr = [
                'code' => 0,
                'msg'  => 'success',
                'data' => [
                    'house'    => $house,
                    'enginner' => $enginner
                ]
            ];
        }catch (Exception $exception){
            $arr = [
                'code' => 0,
                'msg'  => $exception->getMessage(),
                'data' => []
            ];
        }

        return json($arr);


    }

    /**
     *
     * 获取巡检任务
     * @param Inspection $inspection
     * @param string $status 0 未完成 1 已完成
     * @param string  $street 街道
     * @param string  $area  区域
     * @return \think\response\Json
     * @throws Exception
     * @throws \think\db\exception\DataNotFoundException
     * @throws \think\db\exception\ModelNotFoundException
     * @throws \think\exception\DbException
     */
    public function getAreaInspectInfo(Inspection $inspection){


        $area   = $this->request->param('area', '');
        $street = $this->request->param('street', '');
        $status = $this->request->param('status', 0);
        $level  = $this->request->param('level', 1);
        $limit  = $this->request->param('limit', 15);
        $page   = $this->request->param('page', 1);
        $where  = [];

        $staff_id     = $this->authMethod(1);
        $isSuperAdmin = $this->auth->isSuperAdmin();
        $areaCode     = Db::name('area_code')->where('name', $area)->value('id');

        if (!$isSuperAdmin) {
            $where['join_staff_id'] = [ 'in', $staff_id];
        }

        if ($status) {
            $where['confirm_completion'] = 1;
            $where['confirm_audit'] = 1;
        }

        if ($level == 1) {
            $where['house_id'] = ['in', array_column(Db::name('house')->where(['area' => $areaCode])->select(), 'id')];
        }
        if ($level == 2) {
            $streetCode = Db::name('area_code')->where(['name' => $street])->value('id');
            $where['house_id']    = ['in', array_column(Db::name('house')->where(['area' => $areaCode, 'street' => $streetCode])->select(), 'id')];
        }

        $total  = $inspection->where($where)->count();
        $result = $inspection->where($where)->order('create_time desc')->page($page,$limit)->select();
        $count  = count($result);


        return responseJson(1,'success',[
            'list' => $result,
            'total' => $total,
            'count' => $count,
            'page'  => $page,
            'limit' => $limit
        ]);

    }

    /**
     * @param Inspection $inspection
     * @return \think\response\Json
     */
    public function Inspectpercentage(Inspection $inspection){
        $area   = $this->request->param('area', '');
        $street = $this->request->param('street', '');
        $level  = $this->request->param('level', 1);
        $where  = [];

        $staff_id     = $this->authMethod(1);
        $isSuperAdmin = $this->auth->isSuperAdmin();
        $areaCode     = Db::name('area_code')->where('name', $area)->value('id');

        if (!$isSuperAdmin) {
            $where['join_staff_id'] = [ 'in', $staff_id];
        }

        if ($level == 1) {
            $where['house_id'] = ['in', array_column(Db::name('house')->where(['area' => $areaCode])->select(), 'id')];
        }
        if ($level == 2) {
            $streetCode = Db::name('area_code')->where(['name' => $street])->value('id');
            $where['house_id']    = ['in', array_column(Db::name('house')->where(['area' => $areaCode, 'street' => $streetCode])->select(), 'id')];
        }

        $total = $inspection->where($where)->count();


        $where['confirm_completion'] = 1;
        $where['confirm_audit']      = 1;

        $finish = $inspection->where($where)->count();

        $result = $total != 0  ? (number_format(($finish/$total), 2, '.', ' ')) : 0;

        return responseJson(1,'success',[
            'finish' => $result-0,
            'undone' => 1-$result ,
        ]);
    }

    /**
     *
     *
     * @param Request $request
     * @return \think\response\Json
     */
    public function engineeringInfor(Request $request){

        $limit = $request->param('limit',10);
        $page  = $request->param('page',1);

        $engineering_id = 15; //先弄死数据 地址库统一在更改

        $point_id = array_column(Point::all(['engineering_id'=>$engineering_id]),'id');

        $data     = Db::name('data_zh')->where(['point_id'=>implode(',',$point_id)])->page($page,$limit)->order('createtime desc')->select();

        return json([
            'status'  => 1,
            'message' => '成功',
            'data'    => !empty($data) ? $data : [],
            'page'    => $page,
            'limit'   => $limit
        ]);
    }

    /**
     *
     * 获取地区信息
     *
     * @param  $pid  ID标识
     * @param $level 级别
     * @param Request $request
     * @param AreaCode $areaCode
     * @return \think\response\Json
     * @throws \think\db\exception\DataNotFoundException
     * @throws \think\db\exception\ModelNotFoundException
     * @throws \think\exception\DbException
     */
    public function getAreaInfo(Request $request,AreaCode $areaCode){

        $level = $request->param('level', 1);
        $pid   = $request->param('id', 0);


        $result = $areaCode->where(['pid' => $pid, 'level' => $level])->select();

        foreach ($result as $value){

            if($level == 1){
                if(in_array($value['lnitials'],['a','b','c','d','e','f','g'])){
                    $data[0][] = $value;
                }
                if(in_array($value['lnitials'],['l','m','n','o','p','q','r','s'])){
                    $data[1][] = $value;
                }
                if(in_array($value['lnitials'],['t','u','v','w','x','y','z'])){
                    $data[2][] = $value;
                }
                if(in_array($value['lnitials'],['h','i','j','k'])){
                    $data[3][] = $value;
                }

            }
        }

        return json([
            'status'  => 1,
            'message' => 'success',
            'data'    => $level == 1 ? $data : $result
        ]);

    }


    /**
     *
     * 获取项目下所有测点信息
     *
     * @param  $id
     * @param Request $request
     * @param ProjectModel $project
     * @param Point $pointModel
     * @return \think\response\Json
     */
    public function getPointInfo(Request $request, ProjectModel $project, Point $pointModel)
    {
        try {
            $project_id = $request->param('id');

            if (!$project::get(['id' => $project_id])) {
                throw new Exception('该工程下项目不存在');
            }

            $point = $pointModel::all(['project_id' => $project_id]);

            $point = collection($point)->toArray();

            $arr = returnFormat(1, 'success', ['list' => $point]);

        } catch (Exception $exception) {

            $arr = returnFormat(0, $exception->getMessage());
        }

        return json($arr);
    }




}