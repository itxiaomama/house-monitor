#!/bin/sh
#this is artisan queue cron.sh
cd /www/wwwroot/demo.cngiantech.com/addons/zh_monitor/

ps -ef|grep "/usr/bin/php think queue:list --queue ZHuiJobQueue --delay 0 --memory 256 --sleep 3 --tries 0 --timeout 180"|grep -v grep
if [ $? -ne 0 ] ; then
echo "start process ... "
/usr/bin/php think queue:list --queue ZHuiJobQueue --delay  0 --memory 256 --sleep  3 --tries  0 --timeout 180 >> /dev/null 2>&1 &
fi
