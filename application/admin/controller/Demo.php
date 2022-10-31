<?php

namespace app\admin\controller;

use app\common\controller\Backend;
use app\console\common\CommandProcess;
use Exception;
use think\Db;
use think\exception\PDOException;
use think\exception\ValidateException;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use app\admin\model\ConfigApi as ConfigApiModel;
use app\admin\handlers\ZHuiHandler;

/**
 * 测试
 *
 * @icon fa fa-circle-o
 */
class Demo extends Backend
{
    protected $request_url;


    public function __construct()
    {
        $this->request_url   = 'http://101.37.77.172:8080/LeverHtmlForJN/interface/gettrans.do';
//        $this->request_url   = 'https://www.baidu.com/';
    }



    public function _initialize()
    {
        parent::_initialize();
        $this->model = new \app\admin\model\Agency;

    }

    public function import()
    {
        parent::import();
    }

    /**
     * 默认生成的控制器所继承的父类中有index/add/edit/del/multi五个基础方法、destroy/restore/recyclebin三个回收站方法
     * 因此在当前控制器中可不用编写增删改查的代码,除非需要自己控制这部分逻辑
     * 需要将application/admin/library/traits/Backend.php中对应的方法复制到当前控制器,然后进行修改
     *




    /**
     * 测试$guzzle请求
     * @throws Error
     */
    public function post()
    {
        $guzzleClient = new Client(array());
        $response = $guzzleClient->request('POST', $this->baseUrl(), ['query' => ['token' =>'374694B266F5B1C681E6B1192AC4']])->getBody()->getContents();
        $response = json_decode($response);

        halt($response);

    }



    /**
     * 后台怎么来来取数据
     * 测试数据的同步
     *
     */
    public function sync()
    {

//        $config  = ConfigApiModel::get(1);
//        $client  = new ZHuiHandler($config);
//        $handler = $client->syncLever($startTime = "2021-10-19 08:00:00");


        $configs = \app\api\model\ConfigApi::all();
        foreach ($configs as $key => $config)
        {
            $points = Db::name('point')
                ->alias('point')
                ->join('project', 'project.id = point.project_id')
                ->field('point.id,point.card,point.port')
                ->where('point.point_status', 0)
                ->where('project.config_api_id',  $config['id'])
                ->select();
        }

    }



}


