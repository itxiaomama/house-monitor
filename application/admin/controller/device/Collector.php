<?php

namespace app\admin\controller\device;

use app\admin\common\UsrCloud;
use app\api\model\ConfigApi as ConfigApiModel;
use app\common\controller\Backend;
use app\handlers\ZHuiHandler;
use Exception;
use think\Db;
use think\exception\PDOException;
use think\exception\ValidateException;

/**
 * 采集仪设备
 *
 * @icon fa fa-circle-o
 */
class Collector extends Backend
{

    /**
     * Collector模型对象
     * @var \app\admin\model\Collector
     */
    protected $model = null;
    protected $dataLimit = 'auth'; //表示显示当前自己和所有子级管理员的所有数据
    protected $dataLimitField = 'admin_id'; //数据关联字段,当前控制器对应的模型表中必须存在该字段

    protected $noNeedRight = ['getCompanyIdByDevId','getTransOnlineState']; //无需鉴权的方法,但需要登录


    public function _initialize()
    {
        parent::_initialize();
        $this->model = new \app\admin\model\Collector;

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

            $usrCloud = new UsrCloud();
            $list     = $this->model
                ->with(['devicemodel','company'])
                ->where($where)
                ->order($sort, $order)
                ->paginate($limit);


            foreach ($list as $row) {
                //使用with后返回数组会有多余字段 直接去掉
                $row->model = $row->devicemodel->model;
                $row->company_name = $row->company->company_name;
                unset($row->company);
                unset($row->devicemodel);
                //筛选显示字段
                $row->visible(['id','dev_name','dev_code','channel','owe_date','online_state','factory','company_name','model']);

				//多个产家判断设备离线状态
                switch ($row->factory){
                    case '2':
                        $row->online_state = $this->get_online_state($row->dev_code) ;
                        break;
                    case '3':
                        $row->online_state = $usrCloud->getDevice($row->dev_code)->status == 0 ? $usrCloud->getDevice($row->dev_code)->data->device->deviceStatus->onlineOffline : 0 ;
                        break;
                    default:
                        $row->online_state = 0;
                        break;
                }
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
        $device = \app\admin\model\DeviceModel::all();

        $device_model = [];
        foreach($device as $v){
            $device_model[$v['id']] = $v['model'];
        }

        //厂商
        $company = \app\admin\model\Company::all();

        $factory = [];
        foreach($company as $v){
            $factory[$v['id']] = $v['company_name'];
        }

        $this -> assign('device_model', $device_model);
        $this -> assign('factory', $factory);
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

        $device = \app\admin\model\DeviceModel::all();
        $device_model = [];
        foreach($device as $v){
            $device_model[$v['id']] = $v['model'];
        }


        //厂商
        $company = \app\admin\model\Company::all();

        $factory = [];
        foreach($company as $v){
            $factory[$v['id']] = $v['company_name'];
        }

        $this-> assign('factory', $factory);
        $this-> assign('device_model', $device_model);
        $this->view->assign("row", $row);
        return $this->view->fetch();
    }

    /**
     *
     * 根据传感器id获取厂商
     */
    public function getCompanyIdByDevId()
    {
        $dev_id = $this->request->post("dev_id");
        $device = \app\admin\model\Collector::get($dev_id);
        if ($dev_id != 0  && !empty($dev_id))
        {
            $this->success($msg = '', $url = null, $device->factory);
        }
    }


    //怎么获取 api_id
    //查询 测点使用的传感器  【规定一个传感器只能使用一次】：绑定一个工程，其他工程不可以使用


    //采集仪使用流程 : 测点时选择采集仪 和传感器类型
    //采集仪 ==》 所属公司     只有该公司下的人员有权限


    //添加的角度:
    //采集仪是可以添加的
    //传感器  只是传感器 和


    //监测类型【房屋监测】和监测内容【测距（位移）】 的关系：房屋监测下有多个监测内容
    //传感器【应变计】 和 监测内容【测距（位移）】的关系：一个传感器下有多个监测内容



    //@data 2022-3-3 可代码优化的地方：之后考虑 对接的是不同厂商的情况
    /**
     * 朝晖 采集仪是否在线
     * @params  $dev_code 采集仪编号
     * @return mixed
     */
    public function get_online_state($dev_code)
    {
        if(empty($dev_code)){
            return 0;
        }
        //获取 api配置id
        $point = Db::name('point')
            ->field('project_id')
            ->where('dev_code',$dev_code)
            ->find();

        if(empty($point)){
            return 0;
        }

        $project = Db::name('project')
            ->field('config_api_id')
            ->where('id',$point['project_id'])
            ->find();

        if(empty($project)){
            return 0;
        }

        $config  = ConfigApiModel::get($project['config_api_id']);

        $client  = new ZHuiHandler($config);
        $trans   = $client->getTransDataList();

        $interval = 24*60*60; //间隔时间
        foreach ($trans as $v){
            //采集仪名称存在且上次通讯时间不小于24小时
            if($v['name'] == $dev_code && strtotime($v['lastget'])+ $interval > time() ){
                return 1;
            }
        }
        return 0;
    }


    /**
     * 所有的 采集仪是否在线
     *
     */
    public function getTransOnlineState()
    {
        //20222-3-9 log:打开页面请求一次接口，请求频繁，限制为 半小时一次
        $configs  = ConfigApiModel::all(['id'=>1]);

        $outTime = 30*60; //过期时间:半小时
        $options = [
            'type'   => 'File',  // 缓存类型为File
            'expire' => $outTime, // 缓存有效期为永久有效
            'path'   => APP_PATH . 'runtime/cache/', // 指定缓存目录
        ];
        cache($options);// 缓存初始化。不进行缓存初始化的话，默认使用配置文件中的缓存配置


       $hasVal =  cache('OnlineState');
       //没有值的话，返回fasle
        if(!$hasVal){
            $str = "";
            $trans = true;
            $interval = 12*60*60; //间隔时间
            foreach ($configs as $config){
                $client  = new ZHuiHandler($config);
                $handles   = $client->getTransDataList();

                foreach ($handles as $v){
                    //距离上次通讯时间不小于12小时
                    if( strtotime($v['lastget'])+ $interval < time() ){
                        $str  .= $v['name'].' ';
                        $trans = false;
                    }
                }
            }
            if($trans){$isOnline = 1;}else{$isOnline = 2;}
            cache('OnlineState', $isOnline, $outTime);      // 设置缓存数据
        }else{
            //缓存中有值的话  直接取
            if($hasVal == 1){
                $trans = true;
            }else{
                $trans = false;
            }
        }

        //判断是否有设备断电
        if ($trans == false){
            return $this->error( "采集仪".$str." 已掉线");
        }
        else{
            return $this->success( '采集仪未掉线');
        }

    }

}
