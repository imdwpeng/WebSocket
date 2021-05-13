/*
 * @Author: DWP
 * @Date: 2021-05-11 21:49:31
 * @LastEditors: DWP
 * @LastEditTime: 2021-05-13 20:28:12
 */
const app = require('express')();
const WebSocket = require('ws');

const wss = new WebSocket.Server({port:8080});

wss.on('connection',function(ws){
  console.log('server: receive connection.');
  ws.on('message', function incoming(message) {
    console.log('server: received: %s', message);
  });

  ws.send('world');
  setTimeout(function(){
    ws.send('world2');
  },2000)
})

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

app.get('/webSocket.js', function (req, res) {
  res.sendfile(__dirname + '/webSocket.js');
});

app.get('/child', function (req, res) {
  res.sendfile(__dirname + '/child.html');
});

app.listen(3000);