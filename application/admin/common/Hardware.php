<?php

namespace app\admin\common;

class Hardware
{

    /**
     * 重力加速度值 9.8m/s²
     *
     * @var string
     */
    protected $gravity = '9.8';

    /**
     * Hardware constructor.
     * @param $data
     */
    public function __construct($data)
    {
        echo "<pre>";
        print_r($data);
        echo "</pre>";
        exit;
    }

    public function acceleration(){
//        return
    }
}
