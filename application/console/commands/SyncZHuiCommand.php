<?php
namespace app\console\commands;

use app\console\common\CommandProcess;
use think\console\Command;
use think\console\Input;
use think\console\Output;
use app\api\model\ConfigApi as ConfigApiModel;


class SyncZHuiCommand extends Command
{
    // ...
    protected function configure()
    {
        $this
            // 命令的名字（"think" 后面的部分）
            ->setName('sync:zhui')

            // 运行 "php think list" 时的简短描述
            ->setDescription('同步设备的数据')

            // 运行命令时使用 "--help" 选项时的完整命令描述
            ->setHelp("同步设备的数据...");
    }

    protected function execute(Input $input, Output $output)
    {
        // 输出多行到控制台（每一行的末尾添加 "\n"）
        $output->writeln([
            '同步设备的数据...', '============', '',
        ]);
        sleep(10); //和定时任务配合
        //获取所有的配置
        $configs = ConfigApiModel::all();
        foreach ($configs as $key => $config)
        {
            $msg = CommandProcess::syncMultiLever($config);
            $output->writeln($msg);
        }
    }
}
