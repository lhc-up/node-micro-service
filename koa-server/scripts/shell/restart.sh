#!/bin/bash

# 此脚本用于手动在服务器上部署
# 执行打包命令后，把koa-server.tgz上传至服务器
# 把此脚本和koa-server.tgz放在同一目录运行

# node执行文件
NODE_EXEC="/usr/local/node/bin/node"

tar -zxf koa-server.tgz -C koa-server

pid=`ps -ef | grep node | grep koa-server/main.js | awk {'print $2'}`
if [ -n "$pid" ];
then
    kill -9 $pid
fi

nohup ${NODE_EXEC} koa-server/main.js > /dev/null 2>&1 &