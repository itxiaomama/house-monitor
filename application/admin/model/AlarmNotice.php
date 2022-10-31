<?php

namespace app\admin\model;

use think\Model;
use function Sodium\compare;


class AlarmNotice extends Model
{
    // 表名
    protected $name = 'alarm_notice';

    // 自动写入时间戳字段
    protected $autoWriteTimestamp = 'int';

    // 定义时间戳字段名
    protected $createTime = 'createtime';
    protected $updateTime = 'updatetime';
    protected $deleteTime = false;

    // 追加属性
    protected $append = [

    ];

    /**
     *  警情通知 - 阿里云短信 06.24
     * @param $mobile 手机号
     * @param $template 模板code
     * @param $param 需要的参数: 工程名称'name',测点名称'point',告警内容'conter',发生时间'date'
     * @return \think\model\relation\BelongsTo
     */
    public function aliNoteSend($mobile,$param,$template)
    {
        $alisms = new \addons\alisms\library\Alisms();
        $result = $alisms->mobile($mobile)
            ->template($template)
            ->sign('巨安科技')
            ->param($param)
            ->send();

        return $result;
    }


    /**
     *  警情通知 - 邮件通知   06.24
     * @return \think\model\relation\BelongsTo
     */
    public function EmailSend( $email )
    {
        $mail = new \app\common\library\Email();

        $result = $mail
            //接收邮箱地址
            ->to('xxxxxxxxx@qq.com')
            //邮件主题
            ->subject(__("This is a test mail"))
            //邮件正文内容
            ->message('你好')
            //附件 第一个参数为文件地址  第二个参数为邮件展示的文件名
            ->attachment('demo.txt','文件1.txt')
            //发送
            ->send();
    }









    public function staff()
    {
        return $this->belongsTo('Staff', 'staff_id', 'id', [], 'LEFT')->setEagerlyType(0);
    }
}
