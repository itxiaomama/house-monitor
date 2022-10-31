<?php

namespace app\admin\model;

use app\admin\common\UsrCloud;
use think\Model;
use think\Session;

class DataCloud extends Model
{
    /**
     * @var string 有人云数据表
     */
    protected $table = 'jc_data_cloud';

    /**
     * @var string 主键
     */
    protected $pk = 'id';

    /**
     * 有人云获取历史数据
     * @param $array
     * @return \think\response\Json
     */
    public static function historyDataPoint($array)
    {



        /*
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
            'end'           => 1663689600000,
            'pageSize'      => 10
        ];
        */

        $usrCloud = new UsrCloud();
        $response = $usrCloud->historyDataPoint($array);

        $arr      = [];
        if ($response['status'] == 0) {
            $data      = $response['data']['list'];
            if(empty($data[0]['list'])){
                return $arr;
            }
            $itemCount = count($data);
            for ($j = 0; $j < count($data[0]['list']); $j++) {
                for ($i = 0; $i < $itemCount; $i++) {
                    $arr[$j]['data' . $data[$i]['list'][$j]['itemId']]            = $data[$i]['dataPointName'];
                    $arr[$j]['data' . $data[$i]['list'][$j]['itemId'] . '_this']  = $data[$i]['list'][$j]['value'];
                    $arr[$j]['data' . $data[$i]['list'][$j]['itemId'] . '_total'] = $data[$i]['list'][$j]['dataPointId'];
                    $arr[$j]['record_time']                                       = strtotime(date('Y-m-d H:i:s', substr($data[$i]['list'][$j]['time'], 0, 10)));
                    $arr[$j]['dev_id']                                            = $data[$i]['deviceNo'];
                    $arr[$j]['point_name']                                        = $data[$i]['slaveName'];
                }
            }
//            self::insertAll($arr);
        }

        return $arr;
    }

    /**
     * 有人云获取历史记录最新数据
     *
     * @param $array
     * @return array
     */
    public static function historyLastDataPoint($array)
    {
        /*
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
                    'dataPointId' => '3999137'
                ],
                [
                    'deviceNo'    => '00076868000000000087',
                    'dataPointId' => '3999138'
                ],
            ]
        ];
*/
        $usrCloud = new UsrCloud();
        $response = $usrCloud->historyLastDataPoint($array);
        $arr      = [];
        if ($response['status'] == 0) {
            $data = $response['data']['list'];
            if (empty($data)) {
                return $arr;
            }
            $itemCount = count($data);
            $slaveName = array_unique(array_column($data, 'slaveName'));

            for ($j = 0; $j < count($slaveName); $j++) {
                $index = 1;
                for ($i = 0; $i < $itemCount; $i++) {
                    if ($slaveName[$j] == $data[$i]['slaveName']) {
                        $arr[$j]['data' . ($index)]            = $data[$i]['value'];
                        $arr[$j]['data' . ($index) . '_rate']  = $data[$i]['dataPointName'];
                        $arr[$j]['data' . ($index) . '_total'] = $data[$i]['dataPointId'];
                        $arr[$j]['record_time']                = date('Y-m-d H:i:s', substr($data[$i]['time'], 0, 10));
//                        $arr[$j]['dev_id']                     = $data[$i]['deviceNo'];
//                        $arr[$j]['point_name']                 = $data[$i]['slaveName'];
                        $index++;
                    }
                }
            }
        }
        return $arr;
    }


}
