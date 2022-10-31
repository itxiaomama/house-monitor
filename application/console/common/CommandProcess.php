<?php
namespace app\console\common;

use app\admin\model\DataCloud;
use app\handlers\ZHuiHandler;
use app\api\model\ConfigApi as ConfigApiModel;
use app\admin\model\Point as PointModel;
use think\Db;


//处理命令行的逻辑
class CommandProcess
{
    /**
     * 同步多个传感器的数据
     *
     * @param $config
     * @param $command
     * @return string
     */
    public static function syncMultiLever($config)
    {
        if(empty($config)){
            return false;
        }

        //同步的所有朝晖的设备
        $points = Db::name('point')
            ->alias('point')
            ->join('project', 'project.id = point.project_id')
            ->field('point.id,point.card,point.port,point.sensor_name')
            ->where('point.point_status', 0)
            ->where('point.is_test', 0)
            ->where('project.config_api_id',  $config['id'])
            ->select();

        //传感器 应变计的名称必须为"应变计"
        $strain = "应变计";
        $client  = new ZHuiHandler($config);
        $num = 0;
        foreach ($points as $point)
        {
            if($point['sensor_name'] == $strain){
                $num += $client->syncLeverStrain($point['card'],$point['port']);
            }else{
                $num += $client->syncLever($point['card'],$point['port']);
            }
        }

        $msg = '数据同步成功，共' . $num. '条';
        return $msg;
    }

    /**
     * 获取有人云数据
     *
     * @param $config
     * @return false|string
     * @throws \think\db\exception\DataNotFoundException
     * @throws \think\db\exception\ModelNotFoundException
     * @throws \think\exception\DbException
     */
    public static function syncSensorCloud($config)
    {
        if (empty($config)) {
            return false;
        }

        $points = Db::name('point')
            ->alias('point')
            ->join('project', 'project.id = point.project_id')
            ->field('point.*')
            ->where([
                'point.point_status'    => 0,
                'point.is_test'         => 0,
                'project.config_api_id' => 2
            ])
            ->select();


        $rows     = []; //['dataPointId' => 'id']数组 方便后期获取point_id
        $jsonRows = []; //全部json集合数组

        $client = new ZHuiHandler($config);
        foreach ($points as $point) {
            if ($point['json']) {
                $json            = json_decode($point['json'], true);
                $dataPointIdRows = array_flip(array_column($json, 'dataPointId')); //将得到的数组取出dataPointId值变成一维数组并反转 = ['dataPointId' => 'id']
                foreach ($dataPointIdRows as $key => $value) {
                    $dataPointIdRows[$key] = $point;
                }
                $rows     += $dataPointIdRows; //将所有的json数组合并成一个数组
                $jsonRows = array_merge($json, $jsonRows); //将所有的json数组合并成一个数组
            }
        }

        $num = !empty($jsonRows) ? $client->cloudSensorData($jsonRows, $rows) : 0;
        $msg = '数据同步成功，共' . $num . '条';

        return $msg;
    }



    /*
    public static function syncSensorCloud($config)
    {
        if (empty($config)) {
            return false;
        }

        $points = Db::name('point')
            ->alias('point')
            ->join('project', 'project.id = point.project_id')
            ->field('point.*')
            ->where('point.point_status', 0)
            ->where('point.is_test', 0)
//            ->where('project.config_api_id',  $config['id'])
            ->where('project.config_api_id', 2)
            ->select();

        $rows     = []; //['dataPointId' => 'id']数组 方便后期获取point_id
        $jsonRows = []; //全部json集合数组

        $client = new ZHuiHandler($config);
        foreach ($points as $point) {
            if ($point['json']) {
                $json            = json_decode($point['json'], true);
                $dataPointIdRows = array_flip(array_column($json, 'dataPointId')); //将得到的数组取出dataPointId值变成一维数组并反转 = ['dataPointId' => 'id']
                foreach ($dataPointIdRows as $key => $value) {
                    $dataPointIdRows[$key] = $point;
                }
                $rows     += $dataPointIdRows; //将所有的json数组合并成一个数组
                $jsonRows = array_merge($json, $jsonRows); //将所有的json数组合并成一个数组
            }
        }

        $num = $client->cloudSensorData($jsonRows, $rows);

        $msg = '数据同步成功，共' . $num . '条';
        return $msg;
    }
    */







    /**
     * 生成传感器测试数据
     * @param $config
     * @return false|string
     * @throws \think\db\exception\DataNotFoundException
     * @throws \think\db\exception\ModelNotFoundException
     * @throws \think\exception\DbException
     */
    public static function syncMultiTestLever($config)
    {
        if(empty($config)){
            return false;
        }

        //同步的所有朝晖的设备
        $points = Db::name('point')
            ->alias('point')
            ->join('project', 'project.id = point.project_id')
            ->field('point.id,point.card,point.port,point.sensor_name')
            ->where('point.point_status', 0)
            ->where('project.config_api_id',  $config['id'])
            ->where('point.is_test', 1)
            ->select();

        //传感器 应变计的名称必须为"应变计"
        $strain = "应变计";
        $client  = new ZHuiHandler($config);
        $num = 0;
        foreach ($points as $point)
        {
            if($point['sensor_name'] == $strain){
                $num += $client->syncTestLever($point['id'],$point['card'],$point['port'],1);
            }else{
                $num += $client->syncTestLever($point['id'],$point['card'],$point['port']);
            }
        }

        $msg = '数据同步成功，共' . $num. '条';
        return $msg;
    }


    /**
     * 删除报警记录脚本
     *
     * @return string
     * @throws \think\Exception
     * @throws \think\exception\PDOException
     */
    public static function deleteAlarmLog(){
        $exceptionCount = Db::name('exception_alarm_log')->count();

        //当报警记录达到1百万时删除8个月前记录 并删除关联表记录
        if($exceptionCount > 1000){
            $deleteTime = strtotime("-0 year -8 month -0 day"); //8个月前时间戳

            $alarmLogTotal = Db::name('exception_alarm_log')->where('record_time','<',$deleteTime)->delete();

            $alarmTotal    = Db::name('exception_alarm')->where('createtime','<',$deleteTime)->delete();

            $notice = '删除报警记录脚本执行时间为'.date('Y-m-d H:i:s').'删除报警管理记录表数据：'.$alarmLogTotal.'条，删除报警管理表数据：'.$alarmTotal.'条';

            Db::name('alarm_delete_log')->insert([
                'notice' => $notice
            ]);

            return "数据删除成功，共{$alarmLogTotal}条";
        }else{
            return "暂未达到删除数据阀值";
        }






    }


}


