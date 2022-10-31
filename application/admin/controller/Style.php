<?php

namespace app\admin\controller;

use app\common\controller\Backend;

/**
 * 首页现场图片
 *
 * @icon fa fa-circle-o
 */
class Style extends Backend
{

    /**
     * Style模型对象
     * @var \app\admin\model\Style
     */
    protected $model = null;
    //不需要授权的方法
    protected $noNeedRight = ['getStylePhoto'];

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new \app\admin\model\Style;

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
     * 获取现场图片
     *
     */
    public function getStylePhoto()
    {
        $list = $this->model->select();
        $tmp = [];
        foreach ($list as $k=> &$v){
            if(!empty($v['image'])){
                $v['image']  = "http://".$_SERVER['HTTP_HOST']. $v['image'];
                $tmp[] = "p".$k;
            }
            $v['isShow'] = false;

        }

        $result = array("total" => count($list), "data" => $list,"code" =>1,'count'=>$tmp);
        return json($result);
    }


}
