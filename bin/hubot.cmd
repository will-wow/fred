@echo off

npm install && ^
gulp coffee && ^
node node_modules\typescript\lib\tsc.js && ^
node_modules\.bin\coffee --nodejs --harmony_destructuring "node_modules\hubot\bin\hubot" --name "fred" %*