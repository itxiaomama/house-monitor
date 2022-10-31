<?php

namespace app\admin\controller\cloud;

use app\admin\common\UsrCloud;
use app\admin\model\DataCloud;
use app\common\controller\Backend;
use think\Cache;
use think\Db;
use think\Exception;
use think\Request;

class Cloud extends Backend
{

    /**
     * @var string[]  无需鉴权的方法,但需要登录
     */
    protected $noNeedRight = ['getDataPointInfoByDevice'];

    /**
     * @var string[] 无需登录的方法,同时也就不需要鉴权了
     */
    protected  $noNeedLogin = ['getDataPointInfoByDevice','historyDataPoint','index','getDevice','historyLastDataPoint'];


    public function _initialize()
    {
        parent::_initialize();
//        $this->model = new \app\admin\model\Collector;

    }


    public function historyDataPoint(UsrCloud $usrCloud){

        $array = [
            'devDatapoints' => [

                [
                    'deviceNo'    => '00076868000000000170',
                    'dataPointId' => '6121071'
                ], [
                    'deviceNo'    => '00076868000000000170',
                    'dataPointId' => '6121072'
                ], [
                    'deviceNo'    => '00076868000000000170',
                    'dataPointId' => '6121073'
                ], [
                    'deviceNo'    => '00076868000000000170',
                    'dataPointId' => '6121074'
                ],
            ],
            'pageNo'        => 1,
            'start'         => 1661961600000,
            'end'           => 1662048000000,
            'pageSize'      => 1000
        ];

        $response = $usrCloud->historyDataPoint($array);

//echo "<pre>";
//print_r($response);
//echo "</pre>";
//exit;
        if($response['status'] == 0 ){
            $arr  = [];
            $data = $response['data']['list'];

            $itemCount = count($data);

            for ($j = 0; $j < count($data[0]['list']); $j++) {
                for ($i = 0; $i < $itemCount; $i++) {
                    $arr[$j]['data' . $data[$i]['list'][$j]['itemId']]            = $data[$i]['dataPointName'];
                    $arr[$j]['data' . $data[$i]['list'][$j]['itemId'] . '_this']  = $data[$i]['list'][$j]['value'];
                    $arr[$j]['data' . $data[$i]['list'][$j]['itemId'] . '_total'] = $data[$i]['list'][$j]['dataPointId'];
                    $arr[$j]['createtime']                                        = $data[$i]['list'][$j]['time'];
//                    $arr[$j]['dev_id']                                            = $data[$i]['deviceNo'];
                    $arr[$j]['dev_id']                                            = 1111111111111111;
                    $arr[$j]['point_name']                                        = $data[$i]['slaveName'];
                }
            }

            return responseJson(1, 'success', $arr);
        }
    }

    public function historyLastDataPoint(UsrCloud $usrCloud){

        $array = [
            'devDatapoints' => [
                [
                    'deviceNo'    => '00076868000000000170',
                    'dataPointId' => '6121071'
                ],
                [
                    'deviceNo'    => '00076868000000000170',
                    'dataPointId' => '6121072'
                ],
                [
                    'deviceNo'    => '00076868000000000170',
                    'dataPointId' => '6121073'
                ],
                [
                    'deviceNo'    => '00076868000000000170',
                    'dataPointId' => '6121074'
                ],
                [
                    'deviceNo'    => '00076868000000000087',
                    'slaveIndex'  => 1,
                    'dataPointId' => '3999137'
                ],
                [
                    'deviceNo'    => '00076868000000000087',
                    'slaveIndex'  => 2,
                    'dataPointId' => '3999138'
                ],
            ]
        ];

        $response = $usrCloud->historyLastDataPoint($array);


        if($response['status'] == 0 ){
            $arr  = [];
            $data = $response['data']['list'];
            $itemCount = count($data);
            $slaveName = array_unique(array_column($data,'slaveName'));

            for ($j = 0; $j < count($slaveName); $j++) {
                for ($i = 0; $i < $itemCount; $i++) {
                    if ($slaveName[$j] == $data[$i]['slaveName']) {
                        $arr[$j]['data' . ($i + 1)]            = $data[$i]['dataPointName'];
                        $arr[$j]['data' . ($i + 1) . '_this']  = $data[$i]['value'];
                        $arr[$j]['data' . ($i + 1) . '_total'] = $data[$i]['dataPointId'];
                        $arr[$j]['record_time']                = strtotime(date('Y-m-d H:i:s', substr($data[$i]['time'], 0, 10)));
                        $arr[$j]['dev_id']                     = $data[$i]['deviceNo'];
                        $arr[$j]['point_name']                 = $data[$i]['slaveName'];
                    }
                }
            }
            return responseJson(1, 'success', $arr);
        }
    }

    public function getDevice(UsrCloud $usrCloud){
        $response = $usrCloud->getDevice(['deviceId'=>'00076868000000000170']);
        return responseJson(1, 'success', $response->data);

    }


}

