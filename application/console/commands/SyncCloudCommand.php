<?php

namespace app\console\commands;

use app\console\common\CommandProcess;
use think\console\Command;
use think\console\Input;
use think\console\Output;
use app\api\model\ConfigApi as ConfigApiModel;


class SyncCloudCommand extends Command
{
    /**
     * 生成命令 sync:cloud
     */
    protected function configure()
    {
        $this->setName('sync:cloud')->setDescription('同步有人云设备的数据')->setHelp("同步有人云设备的数据...");
    }

    /**
     * 调取数据
     *
     * @param Input $input
     * @param Output $output
     * @return int|void|null
     * @throws \think\db\exception\DataNotFoundException
     * @throws \think\db\exception\ModelNotFoundException
     * @throws \think\exception\DbException
     */
    protected function execute(Input $input, Output $output)
    {
        $output->writeln('同步有人云设备的数据...');
        //获取所有的配置
        $configs = ConfigApiModel::get(['id' => 2]);
        while (1) {
            sleep($configs->frequency*60); //和定时任务配合
            $msg     = CommandProcess::syncSensorCloud($configs);
            $output->writeln($msg);
        }

    }
}
