<?php
namespace app\console\commands;

use app\api\model\ConfigApi as ConfigApiModel;
use app\console\common\CommandProcess;
use think\console\Command;
use think\console\Input;
use think\console\Output;

class SyncZhuiTestCommand extends Command{

    protected function configure()
    {
        $this->setName('sync:zhui-test')->setDescription('模拟同步设备的数据...')->setHelp("模拟同步设备的数据...");
    }

    protected function execute(Input $input, Output $output)
    {
        // 输出多行到控制台（每一行的末尾添加 "\n"）
        $output->writeln([
            '模拟同步设备的数据...', '============', '',
        ]);

        sleep(10); //和定时任务配合
        //获取所有的配置
        $configs = ConfigApiModel::all();
        foreach ($configs as $config)
        {
            $msg = CommandProcess::syncMultiTestLever($config);
            $output->writeln($msg);
        }
    }
}