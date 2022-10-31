<?php
namespace  app\console\commands;

use app\console\common\CommandProcess;
use think\console\Command;
use think\console\Input;
use think\console\Output;

class SyncDelLogCommand extends Command
{
    protected function configure()
    {
        $this->setName('sync:del-log')->setDescription('删除报警日志')->setHelp("删除报警日志...");
    }


    protected function execute(Input $input, Output $output)
    {
        $output->writeln([
            '删除报警日志...', '============', '',
        ]);

        $msg = CommandProcess::deleteAlarmLog();

        $output->writeln($msg);
    }

}
