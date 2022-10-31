<?php

namespace app\admin\controller\inspection;

use app\admin\model\Engineering as EngineeringModel;
use app\common\controller\Backend;
use think\Db;

/**
 * 巡检报表打印
 *
 * @icon fa fa-circle-o
 */
class InspectionReport extends Backend
{

    /**
     * InspectionReport模型对象
     * @var \app\admin\model\InspectionReport
     */
    protected $model = null;

    protected $rate      = [1 => 'A级', 2 => 'B级', 3 => 'C级', 4 => 'D级', 5 => '未鉴定'];
    protected $structure = [
        0 => '砖混结构',
        1 => '框架结构',
        2 => '砖木结构',
        3 => '钢结构',
        4 => '木结构',
        5 => '混合结构',
    ];

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
     */
    public function index()
    {
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
                ->with(['engineering'])
                ->where($where)
                ->where('status = 1 AND confirm_completion = 1 AND confirm_audit = 1 ')
                ->order($sort, $order)
                ->paginate($limit);

            foreach ($list as $row) {
                $row->visible(['id','engineering_name','city','address','start_time','end_time','status','join_staff_name','super_staff_name','house_name']);
                $row->visible(['engineering']);
                $row->getRelation('engineering')->visible(['name','city','address']);
            }

            $result = array("total" => $list->total(), "rows" => $list->items());

            return json($result);
        }
        return $this->view->fetch();
    }


    /**
     * 巡检详情
     *  ids:34,33
     */
    public function report($ids = null)
    {
        $rows  = $this->model->select($ids);

        $data = [];

        foreach($rows as $key=> $row ){
            $house            = \app\admin\model\House::get($row->house_id);
            if(!$house){
                echo "<script>alert('房屋不存在'); window.history.go(-1); </script>";
            }else{
                $house->rate      = strlen($house->rate) > 0 ? $this->rate[$house->rate] : '';
                $house->structure = strlen($house->structure) > 0 ? $this->structure[$house->structure] : '';
                //房屋地址

                $cityList = Db::name('area_code')
                    ->field('id,name')
                    ->where('id','in',[
                        $house->province,
                        $house->city,
                        $house->area,
                        $house->street,
                    ])
                    ->select();

                $address     = "";
                foreach($cityList as $v){
                    $address .= $v['name'] ;
                }

                $address .= $row->address;

                //巡检部位
                $inspection_part =  Db::name('inspection_part')
                    ->field('inspection_id,type,issue,issue_desc,issue_img')
                    ->where('inspection_id',$ids)
                    ->select();

                $last = $this->getInsByHouseId(1,$row->id,$row->house_id);

                $arr  = $this->getInsByHouseId(0,$row->id);

                $data[$key]['last']               = $this->changeArr($last);
                $data[$key]['arr']                = $this->changeArr($arr);
                $data[$key]['inspection_part']    = $inspection_part;
                $data[$key]['elevation']          = 'http://monitor.cngiantech.com'.$row->elevation;
                $data[$key]['row']                = $row   ->toArray();
                $data[$key]['house']              = $house ->toArray();
                $data[$key]['address']            = $address;

                if(isset($data[$key]['row']['update_time'])){
                    $data[$key]['row']['update_time'] = date('Y-m-d H:i:s',$data[$key]['row']['update_time']);
                }

            }

        }

        $this->assign('data', $data);
        return $this->view->fetch();
    }

    public function changeArr($inspection_part){
        foreach ($inspection_part as $k => $v){
            foreach ($v as $kk => $vv){
                $inspection_part[$k][$kk]['img'] = "";
                if(strstr($vv['issue_img'],'/')){
                    $img = explode("/", $vv['issue_img'])[3];
                    $img = explode(".", $img)[0];
                    $inspection_part[$k][$kk]['img'] = substr($img,-6);
                }
            }
        }

        return $inspection_part;
    }

    public function getInsByHouseId($type,$inspection_id,$house_id = null)
    {
        $model = new InspectionFront();


        if($type){
            if(!empty($house_id)){
                $_data = Db::name('inspection')
                    ->where(['house_id'=>$house_id])
                    ->where(['status' =>1])
                    ->where(['confirm_completion'=>1])
                    ->where('id','<',$inspection_id)
                    ->order('id desc')
                    ->find();

                if(empty($_data)){
                    return empty($_data) ? ['part10'=>[],'part11'=>[],'part12'=>[]] : $_data;
                }
            }

            $id = $_data['id'];

        }else {

            $id = $inspection_id;

        }

        $part10 = json_decode($model->getPart($id,10),true);
        $part11 = json_decode($model->getPart($id,11),true);
        $part12 = json_decode($model->getPart($id,12),true);

        $part = compact('part10','part11','part12');


        return $part;
    }



}
