<?php
namespace app\job;

use app\admin\model\ConfigApi as ConfigApiModel;
use app\admin\model\engineering\ProjectMonType as ProjectMonTypeModel;
use think\Db;
use think\queue\Job;
use app\admin\model\Data as DataModel;


class DemoJob {

    /**
     * fire方法是消息队列默认调用的方法
     * @param Job            $job      当前的任务对象
     * @param array|mixed    $data     发布任务时自定义的数据
     */
    public function fire(Job $job,$data)
    {
        // 有些消息在到达消费者时,可能已经不再需要执行了
        $isJobStillNeedToBeDone = $this->checkDatabaseToSeeIfJobNeedToBeDone($data);
        if(!$isJobStillNeedToBeDone)
        {
            $job->delete();
            return;
        }

        $isJobDone = $this->doHelloJob();

        if ($isJobDone) {
            // 如果任务执行成功， 记得删除任务
            $job->delete();
            print("<info>一条告警数据已成功被告警中心处理"."</info>\n");
        }else{
            if ($job->attempts() > 3) {
                //通过这个方法可以检查这个任务已经重试了几次了
                print("<warn>Hello Job has been retried more than 3 times!"."</warn>\n");

//                $job->delete();

                // 也可以重新发布这个任务
                //print("<info>Hello Job will be availabe again after 2s."."</info>\n");
                //$job->release(2); //$delay为延迟时间，表示该任务延迟2秒后再执行
            }
        }
    }

    /**
     * 有些消息在到达消费者时,可能已经不再需要执行了
     * @param array|mixed    $data     发布任务时自定义的数据
     * @return boolean                 任务执行的结果
     */
    private function checkDatabaseToSeeIfJobNeedToBeDone($data)
    {
        return true;
    }

    /**
     * 根据消息中的数据进行实际的业务处理...
     */
    private function doHelloJob()
    {
        return false;
        $res = Db::name('demo')->insert(['val'=>12312312]);
        return true;
    }
}
