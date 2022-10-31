<?php

namespace app\admin\controller\senor;

use app\admin\common\Hardware;
use app\common\controller\Backend;
use ModbusTcpClient\Composer\Address;
use ModbusTcpClient\Composer\Read\ReadRegistersBuilder;
use ModbusTcpClient\Network\NonBlockingClient;
use Monolog\Handler\SyslogUdp\UdpSocket;
use think\Db;
use think\log\driver\Socket;


/**
 * 传感器管理
 *
 * @icon fa fa-circle-o
 */
class Senor extends Backend
{

    /**
     * Sensor模型对象
     * @var \app\admin\model\Sensor
     */
    protected $model = null;

    protected $noNeedLogin = ['index','create']; //无需登录的方法,同时也就不需要鉴权了

    protected $noNeedRight = ['index','allot','create']; //无需鉴权的方法,但需要登录

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new \app\admin\model\Sensor;

    }

    public function import()
    {
        parent::import();
    }


    public function index()
    {
//        $address = 'tcp://192.168.0.215:8001'; // 采集仪 DTU
        $address = 'tcp://192.168.0.215:8001'; // 采集仪 DTU
        $unitID = 0; // also known as 'slave ID'
        $fc3 = ReadRegistersBuilder::newReadHoldingRegisters($address, $unitID)
            ->bit(256, 15, 'pump2_feedbackalarm_do')
            // will be split into 2 requests as 1 request can return only range of 124 registers max
            ->int16(657, 'battery3_voltage_wo')
            // will be another request as uri is different for subsequent int16 register
            ->useUri('tcp://127.0.0.1:5023') // 可能是传感器的地址
            ->string(
                669,
                10,
                'username_plc2',
                function ($value, $address, $response) {
                    return 'prefix_' . $value; // optional: transform value after extraction
                },
                function (\Exception $exception, Address $address, $response) {
                    // optional: callback called then extraction failed with an error
                    return $address->getType() === Address::TYPE_STRING ? '' : null; // does not make sense but gives you an idea
                }
            )
            ->build(); // returns array of 3 ReadHoldingRegistersRequest requests

// this will use PHP non-blocking stream io to recieve responses
        $responseContainer = (new NonBlockingClient(['readTimeoutSec' => 0.2]))->sendRequests($fc3);
        print_r($responseContainer->getData()); // array of assoc. arrays (keyed by address name)
        print_r($responseContainer->getErrors());


    }

    public function create(){
        $st="socket send message";
        $length = strlen($st);
        //创建tcp套接字
        $socket = socket_create(AF_INET,SOCK_STREAM,SOL_TCP);
        //连接tcp
        socket_connect($socket, '192.168.0.215',8001);
        //向打开的套集字写入数据（发送数据）
        $s = socket_write($socket, $st, $length);
        //从套接字中获取服务器发送来的数据
        $msg = socket_read($socket,8190);

        echo $msg;
        //关闭连接
        socket_close($socket);
    }




}
