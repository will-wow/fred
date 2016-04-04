@echo off

npm install && ^
gulp coffee && ^
node node_modules\typescript\lib\tsc.js && ^
node_modules\.bin\hubot.cmd --name "fred" %*