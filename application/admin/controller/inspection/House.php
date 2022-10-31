<?php

namespace app\admin\controller\inspection;

use app\admin\library\Auth;
use app\common\controller\Backend;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Reader\Csv;
use PhpOffice\PhpSpreadsheet\Reader\Xls;
use PhpOffice\PhpSpreadsheet\Reader\Xlsx;
use think\Db;
use think\Exception;
use think\exception\PDOException;
use think\exception\ValidateException;

/**
 * 巡检-房屋管理
 *
 * @icon fa fa-circle-o
 */
class House extends Backend
{

    protected $noNeedRight = ['get_house','housePosition']; //无需鉴权的方法,但需要登录


    /**
     * House模型对象
     * @var \app\admin\model\House
     */
    protected $model = null;
    protected $type = [ 0=>'房屋',1=>'桥梁'];
    public    $rate = [ 1=>'A级',2=>'B级',3=>'C级',4=>'D级',5=>'未鉴定'];
    public    $structure = [
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
        $this->model = new \app\admin\model\House;

    }

//    public function import()
//    {
//        parent::import();
//    }

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
            //如果发送的来源是Selectpage，则转发到Selectpage
            if ($this->request->request('keyField')) {
                return $this->selectpage();
            }
            list($where, $sort, $order, $offset, $limit) = $this->buildparams();

            $list = $this->model
                ->where($where)
                ->order($sort, $order)
                ->paginate($limit);

            foreach ($list as &$row) {
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
                $city     = [];
                foreach($cityList as $v){
                    $city[$v['id']] =$v['name'];
                }

                $row->citys = $city;

                $row->structure = isset($this->structure[$row->structure]) ? $this->structure[$row->structure] : '';
            }


            $result = array("total" => $list->total(), "rows" => $list->items());

            return json($result);
        }
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
                $params = $this->preExcludeFields($params);

                if ($this->dataLimit && $this->dataLimitFieldAutoFill) {
                    $params[$this->dataLimitField] = $this->auth->id;
                }

                //超级房屋的处理
                $city_ids = [
                    $params['province'],
                    $params['city'],
                    $params['area'],
                    $params['street'],
                ];
                $cityList = Db::name('area_code')
                    ->field('id,name')
                    ->where('id','in',$city_ids)
                    ->select();

                $city     = "";
                foreach($cityList as $v){
                    $city .= $v['name'] ;
                }

                $params['super_address'] = $city.$params['address'];
                $params['lng']           = !empty(explode(',',$params['lnglat'])) ? explode(',',$params['lnglat'])[0] : '';
                $params['lat']           = !empty(explode(',',$params['lnglat'])) ? explode(',',$params['lnglat'])[1] : '';

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
        //房屋类型
        $type = $this->type;
        //鉴定等级
        $rate = $this->rate;
        //房屋结构
        $structure = $this->structure;

        $this->assign('type',$type);
        $this->assign('rate',$rate);
        $this->assign('structure',$structure);
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

                //超级房屋的处理
                $city_ids = [
                    $params['province'],
                    $params['city'],
                    $params['area'],
                    $params['street'],
                ];
                $cityList = Db::name('area_code')
                    ->field('id,name')
                    ->where('id','in',$city_ids)
                    ->select();

                $city     = "";
                foreach($cityList as $v){
                    $city .= $v['name'] ;
                }

                $params['super_address'] = $city.$params['address'];
                $params['lng']           = !empty(explode(',',$params['lnglat'])) ? explode(',',$params['lnglat'])[0] : '';
                $params['lat']           = !empty(explode(',',$params['lnglat'])) ? explode(',',$params['lnglat'])[1] : '';

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
        $city = '';
        foreach($cityList as $v){
            $city.= $v['name'].'/';

        }

        $this->view->assign("row", $row);
        $this->view->assign("city", rtrim($city,'/'));


        $this->assign('type',$this->type);
        $this->assign('rate',$this->rate);
        $this->assign('structure',$this->structure);

        return $this->view->fetch();
    }


    //选择房屋
    public function get_house()
    {
        $this->request->filter(['strip_tags', 'trim']);
        if ($this->request->isAjax()) {

            list($where, $sort, $order, $offset, $limit) = $this->buildparams();

            $list = $this->model
                ->where($where)
                ->order($sort, $order)
                ->paginate($limit);

            $result = array("total" => $list->total(), "rows" => $list->items());

            return json($result);
        }
        return $this->view->fetch();
    }


    /**
     * 导入
     */
    public function import()
    {
        $file = $this->request->request('file');
        if (!$file) {
            $this->error(__('Parameter %s can not be empty', 'file'));
        }
        $filePath = ROOT_PATH . DS . 'public' . DS . $file;
        if (!is_file($filePath)) {
            $this->error(__('No results were found'));
        }
        //实例化reader
        $ext = pathinfo($filePath, PATHINFO_EXTENSION);
        if (!in_array($ext, ['csv', 'xls', 'xlsx'])) {
            $this->error(__('Unknown data format'));
        }
        if ($ext === 'csv') {
            $file = fopen($filePath, 'r');
            $filePath = tempnam(sys_get_temp_dir(), 'import_csv');
            $fp = fopen($filePath, "w");
            $n = 0;
            while ($line = fgets($file)) {
                $line = rtrim($line, "\n\r\0");
                $encoding = mb_detect_encoding($line, ['utf-8', 'gbk', 'latin1', 'big5']);
                if ($encoding != 'utf-8') {
                    $line = mb_convert_encoding($line, 'utf-8', $encoding);
                }
                if ($n == 0 || preg_match('/^".*"$/', $line)) {
                    fwrite($fp, $line . "\n");
                } else {
                    fwrite($fp, '"' . str_replace(['"', ','], ['""', '","'], $line) . "\"\n");
                }
                $n++;
            }
            fclose($file) || fclose($fp);

            $reader = new Csv();
        } elseif ($ext === 'xls') {
            $reader = new Xls();
        } else {
            $reader = new Xlsx();
        }

        //导入文件首行类型,默认是注释,如果需要使用字段名称请使用name
        $importHeadType = isset($this->importHeadType) ? $this->importHeadType : 'comment';

        $table = $this->model->getQuery()->getTable();
        $database = \think\Config::get('database.database');
        $fieldArr = [];
        $list = db()->query("SELECT COLUMN_NAME,COLUMN_COMMENT FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = ? AND TABLE_SCHEMA = ?", [$table, $database]);
        foreach ($list as $k => $v) {
            if ($importHeadType == 'comment') {
                $fieldArr[$v['COLUMN_COMMENT']] = $v['COLUMN_NAME'];
            } else {
                $fieldArr[$v['COLUMN_NAME']] = $v['COLUMN_NAME'];
            }
        }

        //加载文件
        $insert = [];
        try {
            if (!$PHPExcel = $reader->load($filePath)) {
                $this->error(__('Unknown data format'));
            }
            $currentSheet = $PHPExcel->getSheet(0);  //读取文件中的第一个工作表
            $allColumn = $currentSheet->getHighestDataColumn(); //取得最大的列号
            $allRow = $currentSheet->getHighestRow(); //取得一共有多少行
            $maxColumnNumber = Coordinate::columnIndexFromString($allColumn);
            $fields = [];
            for ($currentRow = 1; $currentRow <= 1; $currentRow++) {
                for ($currentColumn = 1; $currentColumn <= $maxColumnNumber; $currentColumn++) {
                    $val = $currentSheet->getCellByColumnAndRow($currentColumn, $currentRow)->getValue();
                    $fields[] = $val;
                }
            }

            for ($currentRow = 2; $currentRow <= $allRow; $currentRow++) {
                $values = [];
                for ($currentColumn = 1; $currentColumn <= $maxColumnNumber; $currentColumn++) {
                    $val = $currentSheet->getCellByColumnAndRow($currentColumn, $currentRow)->getValue();
                    $values[] = is_null($val) ? '' : $val;
                }
                $row = [];
                //$temp 表格中的字段   $fields 数据库注释的字段
                $temp = array_combine($fields, $values);
                foreach ($temp as $k => $v) {
                    if (isset($fieldArr[$k]) && $k !== '') {
                        $row[$fieldArr[$k]] = $v;
                    }
                }

                //需要处理的值:类型， 省市区街道，鉴定等级
                $type = array_flip($this->type);  //键值互换
                $rate = array_flip($this->rate);
                $match = array($row['province'],$row['city'],$row['area'],$row['street']);
                $cityList = Db::name('area_code')
                        ->field('id,name,parent_id')
                        ->where('name','in',$match)
                        ->select();

                $childData = $this->getAreaChildData($cityList);

                $row['province']   = $childData[0]['id'];
                $row['city']       = $childData[0]['children'][0]['id'];
                $row['area']       = $childData[0]['children'][0]['children'][0]['id'];
                $row['street']     = $childData[0]['children'][0]['children'][0]['children'][0]['id'];

                $row['type']   = $type[$row['type']];
                $row['rate']   = $rate[$row['rate']];
                if ($row) {
                    $insert[] = $row;
                }
            }
        } catch (Exception $exception) {
            $this->error($exception->getMessage());
        }
        if (!$insert) {
            $this->error(__('No rows were updated'));
        }

        try {
            //是否包含admin_id字段
            $has_admin_id = false;
            foreach ($fieldArr as $name => $key) {
                if ($key == 'admin_id') {
                    $has_admin_id = true;
                    break;
                }
            }
            if ($has_admin_id) {
                $auth = Auth::instance();
                foreach ($insert as &$val) {
                    if (!isset($val['admin_id']) || empty($val['admin_id'])) {
                        $val['admin_id'] = $auth->isLogin() ? $auth->id : 0;
                    }
                }
            }
            $this->model->saveAll($insert);
        } catch (PDOException $exception) {
            $msg = $exception->getMessage();
            if (preg_match("/.+Integrity constraint violation: 1062 Duplicate entry '(.+)' for key '(.+)'/is", $msg, $matches)) {
                $msg = "导入失败，包含【{$matches[1]}】的记录已存在";
            };
            $this->error($msg);
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }

        $this->success();
    }


    function getAreaChildData($array, $pid = 0)
    {
        $tree = [];
        foreach ($array as $key => $value) {
            if ($value['parent_id'] == $pid ) {
                $value['children'] = $this->getAreaChildData($array, $value['id']);
                if (empty($value['children'])) {
                    unset($value['children']);
                }
                unset($value['parent_id']);
                $tree[] = $value;
            }
        }
        return $tree;
    }

    /*
     * 查看建筑物位置
     */

    public function housePosition(){
        try {
            $house_ids = $this->request->param('house_ids');

            if(!$house_ids){
                throw new Exception('当前尚未选择建筑物，无法查看建筑物位置');
            }

            $house_ids_arr = explode(',',$house_ids);

            $house_arr     = Db::name('house')->where(['id'=>['in',$house_ids_arr]])->field('name,lat,lng')->select();

            $arr = [
                'code'    => 200,
                'message' => 'success',
                'data'    => [
                    'house_arr' => $house_arr
                ]
            ];

        }catch (Exception $exception){
            $arr = [
                'code'    => 0,
                'message' => $exception->getMessage(),
                'data'    => []
            ];
        }
        return json($arr);
    }


}
