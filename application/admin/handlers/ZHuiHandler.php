<?php

namespace app\admin\handlers;

use app\common\controller\Backend;
use Exception;
use GuzzleHttp\Client;
use think\Db;
use think\exception\PDOException;
use think\exception\ValidateException;
use app\admin\handlers\ZHuiSync;



class ZHuiHandler{

    use ZHuiSync;
    /**
     * Token.
     *
     * @var string
     */
    protected $token = '';


    /**
     * url.
     *
     * @var string
     */
    protected $url = '';


    protected $guzzleClient;



    /**
     * Create a new basic handler instance.
     *
     * DaHuaHandler constructor.
     * @param Config $config
     */
    public function __construct($config)
    {
        $this->config = $config;

        $this->url         = $config->url;
        $this->token       = $config->token;

        $this->guzzleClient =  new Client(array());
    }


    /**
     * Request Array
     *
     * @var array
     */
    protected $options = [
        'url_trans'   => '/LeverHtmlForJN/interface/gettrans.do',//获取采集器列表
        'url_line'    => '/LeverHtmlForJN/interface/getline.do',//获取线路列表
        'url_device'  => '/LeverHtmlForJN/interface/getdevice.do',//获取设备列表
        'url_leverdata'  => '/LeverHtmlForJN/interface/getleverdata.do',//获取传感器数据

    ];


    //获取采集器列表
    public function getTransData()
    {
        $response = $this->guzzleClient->request('POST', $this->url. $this->options['url_trans'], ['query' => ['token' =>$this->token]])->getBody()->getContents();
        return json_decode($response);
    }
    /**
     * 获取线路列表
     * @param  integer $transdeviceid  采集器id
     * @return mixed
     */
    public function getLineData( $transdeviceid )
    {
        $response = $this->guzzleClient->request('POST', $this->url. $this->options['url_line'], ['query' => ['token' =>$this->token,'transdeviceid'=>$transdeviceid]])->getBody()->getContents();
        return json_decode($response);
    }

    /**
     * 获取设备列表
     * @param  integer lineid  线路id
     * @return mixed
     */
    public function getDeviceData($lineid)
    {
        $response = $this->guzzleClient->request('POST', $this->url. $this->options['url_device'], ['query' => ['token' =>$this->token,'lineid'=>$lineid]])->getBody()->getContents();
        return json_decode($response);
    }

    /**
     * 获取传感器数据
     * @param   integer lineid  线路id
     * @param  integer deviceid  设备id
     * @param  string startTime  开始时间
     * @return mixed
     */
    public function getLeverData($data = [])
    {
        $params = [
            'token' =>$this->token,
            'lineid' =>$data['lineid'],
            'deviceid' =>$data['deviceid'],
        ];

        if(!empty($data['startTime'])){
            $params['startTime'] = $data['startTime'];
        }

        if(!empty($data['endTime'])){
            $params['endTime'] = $data['endTime'];
        }


        $response = $this->guzzleClient->request('POST', $this->url. $this->options['url_leverdata'],
            ['query' => $params ]
        )->getBody()->getContents();
        return json_decode($response);
    }





}
