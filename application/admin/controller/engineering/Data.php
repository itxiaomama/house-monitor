<?php

namespace app\admin\controller\engineering;


use app\admin\model\ConfigApi;
use app\admin\model\ConfigApi as ConfigApiModel;
use app\admin\model\Engineering as EngineeringModel;
use app\admin\model\MonCategory as MonCategoryModel;
use app\admin\model\MonType as MonTypeModel;
use app\admin\model\Point;
use app\admin\model\PointAlarm;
use app\admin\model\Project as ProjectModel;
use app\common\controller\Backend;
use app\admin\model\engineering\ProjectMonType as ProjectMonTypeModel;
use app\admin\model\Point as PointModel;
use app\common\exception\UploadException;
use app\common\library\Upload;
use Exception;
use think\Config;
use think\Db;
use think\exception\PDOException;
use think\exception\ValidateException;

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use think\Model;
use think\Request;



/**
 * 岩联数据管理
 *
 * @icon fa fa-circle-o
 */
class Data extends Backend
{

    /**
     * Data模型对象
     * @var \app\admin\model\Data
     */
    protected $model = null;
    protected $ids = ""; //ids的字符串
    protected $alarm_ids = [];
    protected $point_ids = [];
    protected $updatePointTrue = false;
    protected $alarm_state = 0; //正常


    public function _initialize()
    {
        parent::_initialize();
        $this->model = new \app\admin\model\Data;

    }


    /**
     * 默认生成的控制器所继承的父类中有index/add/edit/del/multi五个基础方法、destroy/restore/recyclebin三个回收站方法
     * 因此在当前控制器中可不用编写增删改查的代码,除非需要自己控制这部分逻辑
     * 需要将application/admin/library/traits/Backend.php中对应的方法复制到当前控制器,然后进行修改
     */

    //不需要授权的方法
    protected $noNeedRight = ['excel_template' ,'import_excel','down','getEchart' ,'down_list','down_excel'];

    /**
     * 查看
     * @params $ids 项目监测内容id
     */
    public function index($ids = null)
    {
        $project_mon_type_id = $ids;
        //需要的参数  mon_type   需要监测的内容
        $project_mon_type = ProjectMonTypeModel::get($project_mon_type_id);
        $config  = ConfigApiModel::get($project_mon_type->config_api_id);
        //获取当前用户的场景值
        $this->model->setTable( $this->model->getTable(). '_' . $config->mark );


        //设置过滤方法
        $this->request->filter(['strip_tags', 'trim']);
        if ($this->request->isAjax()) {
            //如果发送的来源是Selectpage，则转发到Selectpage
            if ($this->request->request('keyField')) {
                return $this->selectpage();
            }
            list($where, $sort, $order, $offset, $limit) = $this->buildparams();

            //查询 同一项目检测内容id 下的信息
            $list = $this->model
                ->where($where)
                ->where('project_mon_type_id',$project_mon_type_id)
                ->order($sort, $order)
                ->paginate($limit);

            $result = array("total" => $list->total(), "rows" => $list->items());

            return json($result);
        }


        $modelsData = $this->getAlarmSet($project_mon_type->mon_type_id);
        $models = json_encode($modelsData);
        $modelsDataKey = array_keys($modelsData)[0];


        //查询工程信息名称       监测类型   项目名称   监测内容
        $project      = ProjectModel::get($project_mon_type->project_id);
        $engineering  = EngineeringModel::get($project_mon_type->engineering_id);
        $mon_category = MonCategoryModel::get($project->mon_category_id);

        $row = [
            'engineering_id' =>$project_mon_type['engineering_id'],
            'engineering_name' => $engineering['name'],
            'mon_item_name'    => $mon_category['mon_item_name'],
            'project_name'     => $project['item_name'],
            'mon_type_name'   => $project_mon_type['mon_type_name'],
            'mon_type_id'   => $project_mon_type['mon_type_id'],
        ];


        $this->assign('row',$row);
        $this->assign('modelsDataKey',$modelsDataKey);
        $this->assign('modelsData',$modelsData);
        $this->assign('models',$models);
        $this->assign('mon_type',$project_mon_type->mon_type_id);
        $this->assign('item_id',$project_mon_type_id);

        return $this->view->fetch();
    }

    /**
     * 添加
     * @params $id 项目监测内容id
     */
    public function add($id = null)
    {
        $project_mon_type = ProjectMonTypeModel::get($id);
        $config  = ConfigApiModel::get($project_mon_type->config_api_id);
        //获取当前用户的场景值
        $this->model->setTable( $this->model->getTable(). '_' . $config->mark );

        if ($this->request->isPost()) {
            $params = $this->request->post("row/a");
            if ($params) {
                $params = $this->preExcludeFields($params);

                $point_id = $params['point'];
                $params['point_id'] = $params['point'];
                $point = PointModel::get($point_id);

                //需要的其他参数   "upload_code":"20190705#0#1#0" , //组合方式： 采集仪编号#板卡序号#通道序号#传感器地址
                $params['upload_code'] = $point->dev_code.'#'.$point->card.'#'.$point->port.'#'.$point->addr;
                $params['createtime'] = time();
                $params['dev_id']     =  $point->dev_id; //采集仪id
                $params['point_name'] =  $point->point_code; //测点名称
                $params['point_id']   =  $point->id; //测点名称
                $params['mon_type']   =  $point->mon_type_id; //监测类型id
                $params['dev_type']   =  $point->sensor_id;//传感器类型：传感器id
                $params['project_mon_type_id'] =  $id; //项目检测内筒id

                //检查该测点是否有阈值
                $alarm = collection(PointAlarm::all(['point_id'=>$point->id]));
                $alarm = $alarm ->toArray();
                if(empty($alarm)){//该测点未设置报警方案
                    $this->error('该测点未设置警情参数:  ' .$point->point_code);
                }

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
                    $data_id = $this->model->id;

                    //判断是否超过阈值
                    $this->model->compare($params,$data_id);


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
        //查询需要的参数
        $project_mon_type = ProjectMonTypeModel::get($id);
        $params = $this->getAlarmSet($project_mon_type->mon_type_id);

        //测点数据
        $point = PointModel::all(['project_mon_type_id'=>$id]);
        $point =  collection($point)->toArray();

        $point = array_select($point,'point_code');

        $this->assign('params',$params);
        $this->assign('point',$point);

        return $this->view->fetch();
    }


    /**
     * 编辑
     */
    public function edit($ids = null)
    {
        $ids = $this->request->get("ids");

        $project_mon_type_id = $this->request->get("item_id");
        $project_mon_type = ProjectMonTypeModel::get($project_mon_type_id);
        $config  = ConfigApiModel::get($project_mon_type->config_api_id);
        //获取当前用户的场景值
        $this->model->setTable( $this->model->getTable(). '_' . $config->mark );

        $row = $this->model->where('id',$ids)->find();
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

        //查询需要的参数
        $params = $this->getAlarmSet($row->mon_type);

        //测点暂时不可以修改
        $this->assign('params',$params);
        $this->view->assign("row", $row);
        return $this->view->fetch();
    }


    /**
     * 删除
     */
    public function del($ids = "")
    {
        $project_mon_type_id = $this->request->get("item_id");
        $project_mon_type = ProjectMonTypeModel::get($project_mon_type_id);
        $config  = ConfigApiModel::get($project_mon_type->config_api_id);
        //获取当前用户的场景值
        $this->model->setTable( $this->model->getTable(). '_' . $config->mark );

        if (!$this->request->isPost()) {
            $this->error(__("Invalid parameters"));
        }
        $ids = $ids ? $ids : $this->request->post("ids");
        $base64Ids = base64_decode($ids);
        $base64Id = explode("#", $base64Ids);
        if($ids == base64_encode($base64Ids)){
            $ids = $base64Id[0];
        }


        if ($ids) {
            $pk = $this->model->getPk();
            $adminIds = $this->getDataLimitAdminIds();
            if (is_array($adminIds)) {
                $this->model->where($this->dataLimitField, 'in', $adminIds);
            }
            $list = $this->model->where($pk, 'in', $ids)->select();

            $this->out($ids);

            $count = 0;
            Db::startTrans();
            try {
                foreach ($list as $k => $v) {
                    $count += $v->delete();
                }
                Db::commit();
            } catch (PDOException $e) {
                Db::rollback();
                $this->error($e->getMessage());
            } catch (Exception $e) {
                Db::rollback();
                $this->error($e->getMessage());
            }
            if ($count) {
                $this->success();
            } else {
                $this->error(__('No rows were deleted'));
            }
        }
        $this->error(__('Parameter %s can not be empty', 'ids'));
    }

    /**
     * 标记无效数据
     *
     */
    public function invalid($ids = "")
    {
        $ids = $ids ? $ids : $this->request->post("ids");
        $enable =  intval($this->request->request("enable"));
        $project_mon_type_id =  $this->request->request("item_id");

        //获取当前用户的场景值
        $project_mon_type = ProjectMonTypeModel::get($project_mon_type_id);
        $config  = ConfigApiModel::get($project_mon_type->config_api_id);
        $this->model->setTable( $this->model->getTable(). '_' . $config->mark );

        $base64Ids = base64_decode($ids);
        $base64Id = explode("#", $base64Ids);
        if($ids == base64_encode($base64Ids)){
            $ids = $base64Id[0];
        }
        $res = $this->model
            ->where('id',$ids)
            ->where('project_mon_type_id',$project_mon_type_id)
            ->update(['enable'=>$enable]);

        $res?$this->success('修改成功'):$this->error('修改错误');
    }



    /**
     * 下载页面
     * @param
     *
     */
    public function down()
    {
        $project_mon_type_id =  $this->request->get("id"); //项目检测内容id

        //测点数据
        $point = PointModel::all(['project_mon_type_id'=>$project_mon_type_id]);
        $point =  collection($point)->toArray();
        $point = array_select($point,'point_code');

        $this->assign('point',$point);
        $this->assign('project_mon_type_id',$project_mon_type_id);
        return $this->view->fetch();
    }

    /**
     * 下载列表
     * @param
     *
     */
    public function down_list()
    {
        $project_mon_type_id =  $this->request->get("id"); //项目检测内容id
        $points =  $this->request->get("points"); //测点ids
        $data_time =  $this->request->get("data_time"); //测点ids

        //获取当前用户的场景值
        $project_mon_type = ProjectMonTypeModel::get($project_mon_type_id);
        $config  = ConfigApiModel::get($project_mon_type->config_api_id);
        $this->model->setTable( $this->model->getTable(). '_' . $config->mark );


        //查询数据数量
       $this->model->where('project_mon_type_id',$project_mon_type_id);


        $start_time = "";
        $end_time = "";
        if(!empty($data_time))
        {
            $time  = explode(" - ", $data_time);
            $start_time = $time[0];
            $end_time   = $time[1];

            $this->model->where('createtime','between time',[$start_time,$end_time]);
        }


        if(!empty($points))
        {
            $this->model ->where('point_id','in', $points);
        }

        $count = $this->model->count();

        $page_size = 10000;
        $row =  $this->getGroup($count,$page_size);

        $this->assign('row',$row);
        $this->assign('project_mon_type_id',$project_mon_type_id);
        $this->assign('points',$points);
        $this->assign('start_time',$start_time);
        $this->assign('end_time',$end_time);

        return $this->view->fetch();
    }


    /**
     * 测点导出模板
     *
     */
    public function excel_template()
    {
        $project_mon_type_id =  $this->request->get("id");

        $project_mon_type = ProjectMonTypeModel::get($project_mon_type_id);
        $param = $this->getAlarmSet($project_mon_type->mon_type_id);


        $xlsName = '数据批量导入模板';//文件名称
        $head = ['测点编号', '采集时间'];// 表头信息
        //表字段和表头信息一一对应
        $keys = ['point_name', 'record_time'];


        //获取动态参数
        $keys2 = $head2 = [];
        foreach($param as $k=>$v){
            $keys2[] = $k;
            $head2[] = $v;
        }

        $keys = array_merge($keys,$keys2);
        $head = array_merge($head,$head2);

        $tmp = array_flip($keys);
        foreach($tmp as $k=>$v){
            $tmp[$k] = '';
        }

        $tmp['point_name'] = "A01";
        $tmp['record_time'] = "2021-07-23 16:27:11";

        $data = [
            $tmp,$tmp,$tmp
        ];

        $this->downloadExcel($xlsName, $data, $head, $keys);// 传递参数

    }

    /**
     *下载
     * 现在只支持选择单测点
     */
    public function down_excel()
    {
            set_time_limit(0);
            $project_mon_type_id =  $this->request->get("id");
            $points =  $this->request->get("points");
            $start_time =  $this->request->get("start_time");
            $end_time =  $this->request->get("end_time");
            $offset =  $this->request->get("offset");

        $num = 20000;

        //获取当前用户的场景值
        $project_mon_type = ProjectMonTypeModel::get($project_mon_type_id);
        $config  = ConfigApiModel::get($project_mon_type->config_api_id);
        $this->model->setTable( $this->model->getTable(). '_' . $config->mark );


        $data = $this->model
            ->field('id,point_id,mon_type,point_name,record_time,
            data1,data1_this,data1_total,data1_rate,
            data2,data2_this,data2_total,data2_rate,
            data3,data3_this,data3_total,data3_rate,
            data4,data4_this,data4_total,data4_rate,
            data5,data5_this,data5_total,data5_rate')
            ->where('createtime','between time',[$start_time,$end_time])
            ->where('point_id','in', $points)
            ->where('project_mon_type_id',$project_mon_type_id)
            ->limit($offset*$num ,$num)
            ->select();

        $point = Db::name('point')
            ->field('id,project_id')
            ->where('id',$data[0]['point_id'])
            ->find();

        $project = Db::name('project')
            ->field('id,item_name')
            ->where('id',$point['project_id'])
            ->find();
        $mon_type = Db::name('mon_type')
            ->field('id,mon_type_name')
            ->where('id',$data[0]['mon_type'])
            ->find();


        $xlsName = $project['item_name']. ' ('.$mon_type['mon_type_name'].' ）'.'监测数据';//文件名称
        $head = ['测点编号', '采集时间'];// 表头信息
        //表字段和表头信息一一对应
        $keys = ['point_name', 'record_time'];


        //获取动态参数
        $param = $this->getAlarmSet($data[0]['mon_type']);
        $keys2 = $head2 = [];
        foreach($param as $k=>$v){
            $keys2[] = $k;
            $head2[] = $v;
        }

        $keys = array_merge($keys,$keys2);
        $head = array_merge($head,$head2);


        $this->downloadExcel($xlsName, $data, $head, $keys);// 传递参数

    }

    /*
    * 导出数据
    */
    public function downloadExcel($name, $data = [], $head = [], $keys = [])
    {
        $count = count($head);  //计算表头数量
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        for ($i = 65; $i < $count + 65; $i++) {     //数字转字母从65开始，循环设置表头：
            $sheet->setCellValue(strtoupper(chr($i)) . '1', $head[$i - 65]);
        }
        //循环设置单元格：
        foreach ($data as $key => $item) {
            //$key+2,因为第一行是表头，所以写到表格时   从第二行开始写
            for ($i = 65; $i < $count + 65; $i++) {
                //数字转字母从65开始：
                $sheet->setCellValue(strtoupper(chr($i)) . ($key + 2), $item[$keys[$i - 65]]);
                //固定列宽
                $spreadsheet->getActiveSheet()->getColumnDimension(strtoupper(chr($i)))->setWidth(20);
            }

        }
        header('Content-Type: application/vnd.ms-excel');
        header('Content-Disposition: attachment;filename="' . $name . '.xlsx"');
        header('Cache-Control: max-age=0');
        $writer = \PhpOffice\PhpSpreadsheet\IOFactory::createWriter($spreadsheet, 'Xlsx');
        $writer->save('php://output');
        exit;

    }


    /**
     *  日报页面
     *
     */
    public function daily()
    {
        $project_mon_type_id =  $this->request->get("id"); //项目检测内容id
        $this->assign('project_mon_type_id',$project_mon_type_id);
        return $this->view->fetch();
    }

    /**
     *  日报导出
     * benchmark_id
     */
    public function down_daily()
    {
        $project_mon_type_id =  $this->request->get("id"); //项目检测内容id
        $date =  $this->request->get("date");


        //获取当前用户的场景值
        $project_mon_type = ProjectMonTypeModel::get($project_mon_type_id);
        $config  = ConfigApiModel::get($project_mon_type->config_api_id);
        $this->model->setTable( $this->model->getTable(). '_' . $config->mark );

        $start_time = $date.' 00:00:00';
        $end_time   = $date.' 23:59:59';

        $data = $this->model
            ->field('id,point_id,mon_type,point_name,record_time,alarm_state,
            data1,data1_this,data1_total,data1_rate,
            data2,data2_this,data2_total,data2_rate,
            data3,data3_this,data3_total,data3_rate,
            data4,data4_this,data4_total,data4_rate,
            data5,data5_this,data5_total,data5_rate')
            ->where('createtime','between time',[$start_time,$end_time])
            ->where('project_mon_type_id',$project_mon_type_id)
            ->select();
        $data = collection($data)->toArray();

        $point = Db::name('point')
            ->field('id,project_id')
            ->where('id',$data[0]['point_id'])
            ->find();

        $project = Db::name('project')
            ->field('id,item_name')
            ->where('id',$point['project_id'])
            ->find();
        $mon_type = Db::name('mon_type')
            ->field('id,mon_type_name')
            ->where('id',$data[0]['mon_type'])
            ->find();

        //初始值的字段名称
        $monTYpeName = $this->getMonTypeInit($project_mon_type->mon_type_id);

        //项目名称（监测内容）日报
        $xlsName = $project['item_name']. ' ('.$mon_type['mon_type_name'].' ）'.'日报';//文件名称
        $head = $project['item_name'].'日报';
        $field = ['测点编号', '记录时间'];// 小表头信息
        //表字段和表头信息一一对应
        $keys = ['point_name', 'record_time'];


        //处理数据 加入初始值
        $point_ids = [];
        foreach($data as  $val){
            $point_ids[$val['point_id']] = $val['point_id'];
        }

        //查询初始数据
        $dataInits = [];

        foreach($point_ids as $point_id){
            $pointInits = Db::name('point_first')
                ->field('first_data1,first_data2,first_data3,first_data4,first_data5,first_data6,first_data7,first_data8')
                ->where('point_id',$point_id)
                ->where('status',1)
                ->limit(1)
                ->find();
            if(empty($pointInits)){
                $this->error('请先给测点设置 初始值');
            }
            //去除空数组
            $init_field = $init_keys = [];
            foreach($pointInits as  $pKey =>$pointInit)
            {
                if(empty($pointInit) && $pointInit == null)
                {
                    unset($pointInits[$pKey]);
                }else{
                    $init_field[] = $monTYpeName[$pKey];
                    $init_keys[]  = $pKey;
                }
            }
            //表头字段名称
            $dataInits[$point_id] = $pointInits;
        }
        $alarm_state = [0=>'正常',1=>'预警',2=>'报警',3=>'控制'];
        foreach($data as  $_key => $_val){
             $tmp = $dataInits[$_val['point_id']];
             $_val['alarm_state'] = $alarm_state[ $_val['alarm_state']];
            $data[$_key] = array_merge($_val,$tmp) ;
        }

        //需要的单独显示的参数:项目名称,报表编号，监测内容，监测日期,仪器型号,检定日期
        $params = [
            'project_name' => $project['item_name'],
            'no' => '',
            'mon_type' => $mon_type['mon_type_name'],
            'mon_type_date' => $date,
        ];



        //获取动态参数
        $param = $this->getAlarmSet($data[0]['mon_type']);
        $keys2 = $head2 = [];
        foreach($param as $k=>$v){
            $keys2[] = $k;
            $head2[] = $v;
        }

        $keys  = array_merge($keys,$keys2,$init_keys,['alarm_state']);
        $field = array_merge($field,$head2,$init_field,['告警状态']);

        $this->downloadExcelDaily($xlsName, $data, $field, $keys,$head,$params);// 传递参数
    }

  /**
   * 导出数据
   * @params $name string  表格名称
   * @params $params array 单独显示的字段
   * @params $keys  array 和表头字段对应的数据  ：point_name
   * @params $field  array 和表头字段对应的数据  ：测点编号
   * @params $head  array   ：西边楼房屋监测日报
   * @return mixed
   **/
    public function downloadExcelDaily($name, $data = [], $field = [], $keys = [] ,$head = [],$params = [])
    {
        $line  = count($data); //行数 380
        $count = count($field);  //计算表头数量  6

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        #表格设置
        //表头： 设置行高40 ;A,B,C,D,E,F,G,H,I 第一行单元格合并
        $spreadsheet->getActiveSheet()->getRowDimension('1')->setRowHeight(40);
        $spreadsheet->getActiveSheet()->mergeCells('A1:'.strtoupper(chr($count + 64).'1'));


        //设置黑框
        $styleArray = [
            'borders' => [
                'allBorders' => [
                    'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                    'color' => ['argb' => '000000'],
                ],
            ],

        ];

        $styleArray2 = [
            'alignment' => [
                'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
                'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER,
            ],
        ];

        $styleArray3 = [
            'alignment' => [
                'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_TOP,
            ],
        ];
        //结尾的行数得动态
        $sheet->setCellValue( 'A1', $head);
        $sheet->getStyle('A1:'.strtoupper(chr($count + 64).($line+7)))->applyFromArray($styleArray); //画框
        $sheet->getStyle('A1')->applyFromArray($styleArray2); //水平垂直 居中对齐
        $spreadsheet->getActiveSheet()->getStyle('A1')->getFont()->setBold(true)->setName('方正书宋_GBK')
            ->setSize(14);

        //需要的字段:项目名称project_name,报表编号no，监测内容mon_type，监测日期mon_type_date,仪器型号,检定日期

        $partition  =  floor($count/2);
        $spreadsheet->getActiveSheet()->mergeCells('A2:'.strtoupper(chr($partition + 65-1)).'2');
        $sheet->setCellValue( 'A2', '项目名称：'.$params['project_name']);

        $spreadsheet->getActiveSheet()->mergeCells(strtoupper(chr($partition + 65)).'2'.':'.strtoupper(chr($count + 65-1)).'2');
        $sheet->setCellValue( strtoupper(chr($partition + 65)).'2', '报表编号：');


        $spreadsheet->getActiveSheet()->mergeCells('A3:'.strtoupper(chr($partition + 65-1)).'3');
        $sheet->setCellValue( 'A3', '监测内容：'.$params['mon_type']);

        $spreadsheet->getActiveSheet()->mergeCells(strtoupper(chr($partition + 65)).'3'.':'.strtoupper(chr($count + 65-1)).'3');
        $sheet->setCellValue( strtoupper(chr($partition + 65)).'3', '监测日期：'.$params['mon_type_date']);


        $partition2  =  floor($count/3);
        $mo =  $count%3;
        $spreadsheet->getActiveSheet()->mergeCells('A4:'.strtoupper(chr($partition2 + 65-1)).'4');
        $sheet->setCellValue( 'A4', '仪器型号：');

        $spreadsheet->getActiveSheet()->mergeCells(strtoupper(chr($partition2 + 65)).'4'.':'.strtoupper(chr($partition2*2 + 65-1)).'4');
        $sheet->setCellValue( strtoupper(chr($partition2 + 65)).'4', '仪器出厂编号：');

        $spreadsheet->getActiveSheet()->mergeCells(strtoupper(chr($partition2*2 + 65)).'4'.':'.strtoupper(chr($partition2*3 + 65-1+$mo)).'4');
        $sheet->setCellValue( strtoupper(chr($partition2*2 + 65)).'4', '检定日期：');
        //行高 20
        $spreadsheet->getActiveSheet()->getRowDimension('2')->setRowHeight(20);
        $spreadsheet->getActiveSheet()->getRowDimension('3')->setRowHeight(20);
        $spreadsheet->getActiveSheet()->getRowDimension('4')->setRowHeight(20);


        //施工工况和监测结论及建议  行高80
        $spreadsheet->getActiveSheet()->mergeCells('A'.($line+6).':'.strtoupper(chr(64+$count)).($line+6));
        $spreadsheet->getActiveSheet()->getRowDimension($line+6)->setRowHeight(80);
        $sheet->setCellValue( 'A'.($line+6), '施工工况：');
        $sheet->getStyle('A'.($line+6))->applyFromArray($styleArray3); //顶端对齐


        $spreadsheet->getActiveSheet()->mergeCells('A'.($line+7).':'.strtoupper(chr(64+$count)).($line+7));
        $spreadsheet->getActiveSheet()->getRowDimension($line+7)->setRowHeight(80);
        $sheet->setCellValue( 'A'.($line+7), '监测结论及建议：');
        $sheet->getStyle('A'.($line+7))->applyFromArray($styleArray3); //顶端对齐



        for ($i = 65; $i < $count + 65; $i++) {     //数字转字母从65开始，循环设置表头：
            $sheet->setCellValue(strtoupper(chr($i)) . '5', $field[$i - 65]);
        }
        //循环设置单元格：
        foreach ($data as $key => $item) {
            //$key+2,因为第一行是表头，所以写到表格时   从第五行开始写
            for ($i = 65; $i < $count + 65; $i++) {
                //数字转字母从65开始：
                $sheet->setCellValue(strtoupper(chr($i)) . ($key + 6), $item[$keys[$i - 65]]);
                //固定列宽
                $spreadsheet->getActiveSheet()->getColumnDimension(strtoupper(chr($i)))->setWidth(15);
            }
        }




        header('Content-Type: application/vnd.ms-excel');
        header('Content-Disposition: attachment;filename="' . $name . '.xlsx"');
        header('Cache-Control: max-age=0');
        $writer = \PhpOffice\PhpSpreadsheet\IOFactory::createWriter($spreadsheet, 'Xlsx');
        $writer->save('php://output');
        exit;

    }


    /**
     *  计算分组
     *
     */
    public function getGroup($count,$page_size)
    {
        //2w一条  进行分页
        $num = floor($count/$page_size);
        $yu  = $count%$page_size;

        $row = [];
        for ($i=0; $i<$num; $i++)
        {
            $a = ($i*$page_size)+1;
            $b = ($i+1)*$page_size;
            $row[] = $a." ~ " .$b;
        }
        $row[] = ($page_size*$num)+1 ." ~ ".($page_size*$num+$yu);

        return $row;
    }



    /**
     * 根据 监测内容id 获取 告警内容
     * @param integer $mon_type_id
     * @return mixed
     */
    public function getAlarmSet($mon_type_id)
    {
        $mon_type = MonTypeModel::get($mon_type_id);
        if(empty($mon_type))
        {
            return [];
        }
        $mon_type = $mon_type->toArray();
        //剔除空的数组
        foreach($mon_type as $k=>$v){
            if(empty($v)){
                unset($mon_type[$k]);
            }
        }

        unset($mon_type['id']);
        unset($mon_type['mon_type_name']);
        unset($mon_type['status']);
        unset($mon_type['param1']); //添加时  不需要连续xx天的参数
        unset($mon_type['param2']); //添加时  不需要连续xx天的参数

        return $mon_type;
    }



    /**
     * 根据 监测内容id 获取 初始值的参数
     * @param integer $mon_type_id
     * @return mixed
     */
    public function getMonTypeInit($mon_type_id)
    {
        $mon_type = MonTypeModel::get($mon_type_id);
        if(empty($mon_type))
        {
            return [];
        }
        $mon_type = $mon_type->toArray();
        //剔除空的数组
        foreach($mon_type as $k=>$v){
            if(empty($v)){
                unset($mon_type[$k]);
            }else{
                $mon_type['first_'.$k] = $v.'初始值';
            }
        }

        unset($mon_type['id']);
        unset($mon_type['mon_type_name']);
        unset($mon_type['status']);
        return $mon_type;
    }

    /**
     *  添加测试数据
     *
     */
    public function addData(){
        $data = [
            "upload_code"=> "20190705#0#1#0",
            "point_name"=> "C-01",
            "mon_type"=> 3,
            "dev_type"=> 11,
            "depth"=> 0.5,
            "data1"=> 193.36,
            "data2"=> -123.36,
            "data3"=> 3.36,
            "data4"=> -8.36,
            "data1_this"=> 1.265,
            "data2_this"=> -4.265,
            "data3_this"=> -4.265,
            "data4_this"=> -4.265,
            "data1_total"=> 3.265,
            "data2_total"=> -5.321,
            "data3_total"=> -5.321,
            "data4_total"=> -5.321,
            "data1_rate"=> 0.265,
            "data2_rate"=> -1.265,
            "data3_rate"=> -1.265,
            "data4_rate"=> -1.265,
            "alarm_state"=> 1,
        ];

        $res = Db::name('data')->insert($data);
        halt($res);
    }



    /**
     * 数据的导入
     * @param $ids 项目检测内容id
     * @return mixed
     */
    public function import_excel(Request $request)
    {
        $project_mon_type_id = $this->request->get('id');
        if(empty($project_mon_type_id)){
            $this->error('项目检测内容不能为空');
        }

        $project_mon_type = ProjectMonTypeModel::get($project_mon_type_id);

        $config = ConfigApi::get(['id'=>$project_mon_type->config_api_id]);

        if(!strstr($this->model->getTable(),$config->mark)){
            $this->model->setTable($this->model->getTable(). '_' . $config->mark);
        }


        $param = $this->getAlarmSet($project_mon_type->mon_type_id);


        Config::set('default_return_type', 'json');
        //必须设定cdnurl为空,否则cdnurl函数计算错误
        Config::set('upload.cdnurl', '');
            $attachment = null;
            //默认普通上传文件
            $file = $this->request->file('file');
            try {
                $upload = new Upload($file);
                $attachment = $upload->upload();
            } catch (UploadException $e) {
                $this->error($e->getMessage());
            }
        $excelFielname = '.'.$attachment->url;
        $extension = $attachment->imagetype;

        //区分上传文件格式
        if($extension == 'xlsx') {
            $objReader =\PhpOffice\PhpSpreadsheet\IOFactory::createReader('Xlsx');
            $objPHPExcel = $objReader->load($excelFielname, $encode = 'utf-8');
        }else if($extension == 'xls'){
            $objReader =\PhpOffice\PhpSpreadsheet\IOFactory::createReader('Xls');  //报错
            $objPHPExcel = $objReader->load($excelFielname, $encode = 'utf-8');
        }



        $excel_array = $objPHPExcel->getsheet(0)->toArray();   //转换为数组格式

        //计算所需要的字段
        $params = array_flip($param);
        $header = array_shift($excel_array);  //字段名称

        $fields = [];
        foreach ($header as $k=>$v){
            if(isset($params[$v])){
                $fields[] = $params[$v];
            }
        }

        //查询当天添加的数据
        $severe = [];
        $todayData = $this->model
            ->whereTime('createtime', 'today')
            ->where('project_mon_type_id', $project_mon_type_id)
            ->select();

        foreach ($todayData as $key =>$val){
            $severe[$val['point_name'].$val['record_time']] = $val['id'];
        }

        $save_data = [];
        foreach($excel_array as $k=>$v) {
            if(empty($v[0])){continue;}
            //反正数据重复导入
            $record_time = strtotime($v[1]);

            if(empty($v[1])){
                $record_time = time();
            }
            if(isset($severe[$v[0].date('Y-m-d H:i:s',$record_time)])){
                continue;
            }

            $save_data[$k]["point_name"]      = $v[0]; //测点名称
            $save_data[$k]["record_time"]     = date('Y-m-d H:i:s',$record_time); //采集时间



            $point = PointModel::get(['project_mon_type_id'=>$project_mon_type_id,'point_code'=>$v[0]]);
            if(empty($point)){
                $this->error('该测点名称对应的测点不存在:'.$v[0]);
            }
            //检查该测点是否有阈值
            $alarm = collection(PointAlarm::all(['point_id'=>$point->id]));
            $alarm = $alarm ->toArray();
            if(empty($alarm)){//该测点未设置报警方案
                $this->error('该测点未设置警情参数:  ' .$v[0]);
            }



            //需要的其他参数   "upload_code":"20190705#0#1#0" , //组合方式： 采集仪编号#板卡序号#通道序号#传感器地址
            $save_data[$k]['upload_code'] = $point->dev_code.'#'.$point->card.'#'.$point->port.'#'.$point->addr;
            $save_data[$k]['createtime'] = time();
            $save_data[$k]['dev_id']     =  $point->dev_id; //采集仪id
            $save_data[$k]['point_id']   =  $point->id; //测点名称
            $save_data[$k]['mon_type']   =  $point->mon_type_id; //监测类型id
            $save_data[$k]['dev_type']   =  $point->sensor_id;//传感器类型：传感器id
            $save_data[$k]['project_mon_type_id'] =  $project_mon_type_id; //项目检测内筒id
            foreach($fields as $key =>$field){
                $save_data[$k][$field]    = $v[$key+2];
            }
        }

       $result =  $this->model->saveAll($save_data);

        //判断是否超过阈值
       $okData =collection($result)->toArray();
       if(!empty($okData))
       {
           foreach($okData as $k=>$v)
           {
               $this->model = new \app\admin\model\Data; //为解决不知为何触发的bug，只能使model初始化
               $this->model->compare($v,$v['id']);
           }
       }



       $this->success('导入成功');

        }



    /**
     * 测点曲线图
     * @params  project_mon_type_id   $item_id   int 项目检测内容id
     * @params  points array 测点们
     * @params  time string  时间段
     * @params  model string 显示的参数
     */
    public function  getEchart()
    {
        $points = $this->request->post("points/a");
        $time   = $this->request->post("time");
        $model  = $this->request->post("model");

        $item_id =  $this->request->post("item_id");
        $project_mon_type = ProjectMonTypeModel::get($item_id);
        $config  = ConfigApiModel::get($project_mon_type->config_api_id);
        //获取当前用户的场景值
        $this->model->setTable( $this->model->getTable(). '_' . $config->mark );


        if(empty($model)){
            $this->error('参数model不能为空');
        }

        $dataModel = $this->model;
        if(!empty($item_id)){
            $dataModel->where('project_mon_type_id',$item_id);
        }

        if(!empty($points)){
            $dataModel->where('point_id','in' ,$points);
        }

        if(!empty($time)){
            $x_row  =  explode(" - ", $time);
            $dataModel->where('record_time','between time',[$x_row[0],$x_row[1]]);
        }
        if(strpos($model,"data") != 0){
            $tmpData  =  explode("_", $model);
            $model = $tmpData[1].'_'.$tmpData[0];
        }


        $list = $dataModel
            ->field('id,point_id,record_time,'.$model)
            ->order('record_time')
            ->select();
        $list = collection($list)->toArray();

        $row = $point_ids = $tmp = $tmp2 = [] ;
        foreach ($list as $k=>$v){
            $tmp  = [strtotime($v['record_time'])*1000,(float)$v[$model]];
            $row[$v['point_id']][] = $tmp;
            $tmp2[$v['point_id']][] = (float)$v[$model];
            $point_ids[$v['point_id']] = $v['point_id'];
        }


        $point_ids = array_values($point_ids);

        $point = PointModel::all($point_ids);
        $point = array_select($point,'point_code');

        $data = $tmp = [];
        foreach ($row as $k =>$v){
            $tmp['max'] = max($tmp2[$k]);
            $tmp['min'] = min($tmp2[$k]);
            $tmp['name'] = $point[$k];
            $tmp['data'] = $v;
            $data[] = $tmp;
        }

        //总工程数
        $configs = ConfigApiModel::all();
        $totalData = 0;
        foreach ($configs as $key => $config)
        {
            $totalData += Db::name('data_'.$config->mark)->count();
        }

        $result = [
            'code' => 1,
            'data' => $data,
            'count' => $totalData,
            'msg' => '加载完成'
        ];
        return json($result);
    }

    /**
     * 数据删除后，告警状态的改变
     * @params $ids 数据ids
     * @return mixed
     *
     */
    public function out($ids)
    {
        $this->ids = $ids;
        //告警记录
        $this->delExceptionAlarmLog();
        //告警管理
        $this->delExceptionAlarm();
        //测点表
        $this->updatePoint();
        //项目表
        $this->updateProject();
    }



    /**
     * 删除告警
     *@params  ids integer 数据ids
     *@return mixed
     */
    public function delExceptionAlarm()
    {
        $res = Db::name('exception_alarm')
            ->where('id','in',$this->alarm_ids)
            ->delete();
    }

    /**
     * 删除告警记录
     *@params  ids integer 数据ids
     *@return mixed
     */
    public function delExceptionAlarmLog()
    {
        $data_ids = $this->ids;

        $alarm_log  = Db::name('exception_alarm_log')
            ->where('data_id','in',$data_ids)
            ->select();
        $alarm_ids = [];
        foreach ($alarm_log as $v){
            $alarm_ids[$v['exception_alarm_id']] = $v['exception_alarm_id'];
        }
        sort($alarm_ids);
        $this->alarm_ids = $alarm_ids;


        //删除
        $res = Db::name('exception_alarm_log')
            ->where('data_id','in',$data_ids)
            ->delete();
    }


    /**
     *  测点修改
     */
    public function updatePoint()
    {
        //判断测点下的所有数据是否还有报警的
        $data  = \app\admin\model\Data::all($this->ids);
        $point_ids = [];
        foreach ($data as $key => $val){
            $point_ids[] = $val['point_id'];
        }
        $this->point_ids = $point_ids;
        //错误了
        $hasData = Db::name('data')
            ->where('id','not in', $this->ids )
            ->where('point_id','in', $point_ids)
            ->where('alarm_state','in', [1,2] ) //预警和告警的
            ->count();

        if($hasData == 0){
            $res = Db::name('point')
                ->where('id','in',$point_ids)
                ->update(['alarm_status'=>$this->alarm_state,'updatetime'=>time()]);
            $this->updatePointTrue = true;
        }
    }


    /**
     *  项目修改
     */
    public function updateProject()
    {
        if($this->updatePointTrue == false)
        {
            return false;
        }

        //判断测点下的所有数据是否还有报警的
        $point = Point::all($this->point_ids);
        $project_ids = [];
        foreach ($point as $key => $val){
            $project_ids[] = $val['project_id'];
        }

        $hasProject = Db::name('point')
            ->where('id','not in', $this->point_ids  )
            ->where('project_id','in', $project_ids)
            ->where('alarm_status','in', [1,2] ) //预警和告警的
            ->count();

        if($hasProject == 0){
            $res = Db::name('project')
                ->where('id','in',$project_ids)
                ->update(['alarm_state'=> 0,'updatetime'=>time()]);  //项目的告警状态改为正常
        }

    }

}
