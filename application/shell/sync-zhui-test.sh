#!/bin/sh
cd /www/wwwroot/demo.cngiantech.com/addons/zh_monitor/
#sync-data io message
ps -ef|grep "/usr/bin/php think sync:zhui-test"|grep -v grep

if [ $? -ne 0 ] ; then
echo "start sync-access process ... "
/usr/bin/php think sync:zhui-test >> /dev/null 2>&1 &
fi

