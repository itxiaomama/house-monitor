<?php
namespace app\admin\common;

use GuzzleHttp\Client;
use think\Cache;
use think\Env;

class UsrCloud {

    /**
     * 有人云平台 appKey
     * @var bool|mixed|string|null
     */
    protected $appKey;

    /**
     * 有人云平台 appSecret
     * @var bool|mixed|string|null
     */
    protected $appSecret;

    /**
     * 有人云平台api
     * @var string[]
     */
    protected $api = [
        'getAuthToken'             => 'https://openapi.mp.usr.cn/usrCloud/user/getAuthToken', //获取token
        'editUser'                 => 'https://openapi.mp.usr.cn/usrCloud/user/editUser',
        'getUser'                  => 'https://openapi.mp.usr.cn/usrCloud/user/getUser',
        'getUserCreateRole'        => 'https://openapi.mp.usr.cn/usrCloud/role/getUserCreateRole',
        'addUserRoleNexusDelOld'   => 'https://openapi.mp.usr.cn/usrCloud/role/addUserRoleNexusDelOld',
        'getDataPointInfoByDevice' => 'https://openapi.mp.usr.cn/usrCloud/datadic/getDataPointInfoByDevice', //获取传感器数据
        'getHistoryServerAddress'  => 'https://openapi.mp.usr.cn/usrCloud/vn/ucloudSdk/getHistoryServerAddress',
        'getDevice'                => 'https://openapi.mp.usr.cn/usrCloud/vn/dev/getDevice', //获取设备详情
    ];

    /**
     * HTTP/HTTPS请求客户端
     * @var Client
     */
    protected  $guzzleClient;

    /**
     * POST 传输数组
     * @var array[]
     */
    protected $option = [];

    /**
     * 请求接口X-Access-Token
     *
     * @var string
     */
    protected $accessToken = '';

    /**
     * UsrCloud constructor.
     */
    public function __construct()
    {
//        $this->appKey       = Env::get('cloud.appKey', 'suKOVMfn');
//        $this->appSecret    = Env::get('cloud.appSecret', '8uhfnnoxpwktakus2g8h82jgjhf3cplo');
        $this->appKey       = Env::get('cloud.appKey', 'GupBSN4D');
        $this->appSecret    = Env::get('cloud.appSecret', '0ucecuu68cei322lpfhtanmibnebj706');
        $this->guzzleClient = new Client(['verify'=>false]);
        $this->accessToken  = $this->getAuthToken();

    }

    /**
     * 获取X-Access-Token
     *
     * 1分钟内调用次数限制为3次，超过该限制会触发流控，一分钟内无法调用该接口。
     * 建议：在请求失败后不要立马频繁重试，可以等待一段时间后重试，避免触发流控。
     * 请求成功时返回的登录凭证(注意:X-Access-Token有效时间为2小时，两小时内可以重复使用)
     *
     * @return mixed
     */
    public function getAuthToken()
    {
        if (Cache::get('cache_request_error')) {

            return false;
        }
        if (Cache::has('access_token')) {
            return Cache::get('access_token');
        } else {
            $this->option['json']   = [
                'appKey'    => $this->appKey,
                'appSecret' => $this->appSecret,
            ];
            $this->option['header'] = [
                'Content-Type' => "application/json"
            ];
            $response               = $this->guzzleClient->post($this->api['getAuthToken'], $this->option)->getBody()->getContents();
            $response               = json_decode($response, true);
            if ($response['status'] != 0) {
                Cache::set('cache_request_error', 1, 30);
                return false;
            } else {
                Cache::set('access_token', $response['data']['X-Access-Token'], 7200 - 300);
                return $response['data']['X-Access-Token'];
            }
        }
    }

    /**
     * 根据设备获取变量信息
     *
     * @param $array
     * @return mixed
     */
    public function getDataPointInfoByDevice($array)
    {
        $this->option['json']   = $array;
        $this->option['headers'] = [
            'Content-Type'   => "application/json",
            'X-Access-Token' => $this->accessToken
        ];
        $response               = $this->guzzleClient->post($this->api['getDataPointInfoByDevice'], $this->option)->getBody()->getContents();
        $response               = json_decode($response);
        return $response;
    }

    /**
     * 获取设备变量历史记录
     *
     * @param $array
     * @return false|mixed
     */
    public function historyDataPoint($array)
    {
        $address = $this->getHistoryServerAddress();
        $url     = $address->status == 0 ? $address->data->historyServerAddr . '/history/datapoint' : '';
        if (empty($url)) {
            return false;
        }
        $this->option['json']    = $array;
        $this->option['headers'] = [
            'Content-Type'   => "application/json",
            'X-Access-Token' => $this->accessToken
        ];
        $response = $this->guzzleClient->post($url, $this->option)->getBody()->getContents();
        $response = json_decode($response,true);
        return $response;
    }

    /**
     * 获取历史记录最新数据
     *
     * @param $array
     * @return false|mixed
     */
    public function historyLastDataPoint($array)
    {
        $address = $this->getHistoryServerAddress();
        $url     = $address->status == 0 ? $address->data->historyServerAddr . '/history/lastDatapoint' : '';
        if (empty($url)) {
            return false;
        }
        $this->option['json']    = $array;
        $this->option['headers'] = [
            'Content-Type'   => "application/json",
            'X-Access-Token' => $this->accessToken
        ];
        $response = $this->guzzleClient->post($url, $this->option)->getBody()->getContents();
        $response = json_decode($response,true);
        return $response;
    }

    /**
     * 获取历史记录查询地址
     *
     * @return mixed
     */
    public function getHistoryServerAddress()
    {
        $this->option['headers'] = [
            'Content-Type'   => "application/json",
            'X-Access-Token' => $this->accessToken
        ];
        $response                = $this->guzzleClient->post($this->api['getHistoryServerAddress'], $this->option)->getBody()->getContents();
        $response                = json_decode($response);
        return $response;
    }

    /**
     * 获取设备详情
     *
     * @param $array
     * @return mixed
     */
    public function  getDevice($array)
    {
        $this->option['json']    = $array;
        $this->option['headers'] = [
            'Content-Type'   => "application/json",
            'X-Access-Token' => $this->accessToken
        ];
        $response                = $this->guzzleClient->post($this->api['getDevice'], $this->option)->getBody()->getContents();
        $response                = json_decode($response);
        return $response;
    }


    /**
     * 编辑用户信息
     *
     * @param $array
     * @return false|string
     */
    public function editUser($array)
    {
        $this->option['form_params'] = $array;
        $response                    = $this->guzzleClient->post($this->api['editUser'], $this->option)->getBody()->getContents();
        $response                    = json_encode($response, true);

        return $response;
    }

    /**
     * 获取用户信息
     *
     * @param $array
     * @return false|string
     */
    public function getUser($array){
        $this->option['form_params'] = $array;
        $response                    = $this->guzzleClient->post($this->api['getUser'], $this->option)->getBody()->getContents();
        $response                    = json_encode($response, true);
        return $response;
    }

    /**
     * 根据用户查询用户创建的角色
     *
     * @return false|string
     */
    public function getUserCreateRole()
    {
        $this->option['form_params'] = ['systemId' => '301'];
        $response                    = $this->guzzleClient->post($this->api['getUserCreateRole'], $this->option)->getBody()->getContents();
        $response                    = json_encode($response, true);
        return $response;
    }

    /**
     * 根据用户查询用户创建的角色
     *
     * @return false|string
     */
    public function addUserRoleNexusDelOld($array)
    {
        $this->option['form_params'] = $array;
        $response                    = $this->guzzleClient->post($this->api['addUserRoleNexusDelOld'], $this->option)->getBody()->getContents();
        $response                    = json_encode($response, true);
        return $response;
    }


}