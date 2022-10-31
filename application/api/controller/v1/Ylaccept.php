<?php

namespace app\api\controller\v1;


use REST;

use app\api\model\AppBanner as BannerModel;
use think\View;

/**
 *
 */
class YlAccept extends Api
{
    protected $noNeedLogin = ['getAppBanner','getPcBanner'];
    protected $noNeedRight = '*';

    public function _initialize()
    {
        parent::_initialize();
    }

    /**
     *  获取轮播图
     *
     */
    public function getAppBanner()
    {
        halt('debug');
    }


    /**
     *  获取轮播图
     *
     */
    public function getPcBanner()
    {
        // 使用闭包查询
        $list    = BannerModel::all(function($query){
            $query->where('status', 1)->where('type', 1)->order('weigh', 'desc');
        });

        array_walk($list, function(&$v) {
            $v['image'] = config('baseUrlNew'). $v['image'];
        });
        $this->success('successful', $list);
    }








}
