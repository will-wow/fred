@echo off

npm install && gulp coffee && node_modules/typescript/bin/tsc & node_modules\.bin\hubot.cmd --name "baat" %*