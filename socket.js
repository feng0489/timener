// 使用 express 框架

var app = require('express')();
var express = require("express");
var server = require('http').Server(app);
// 引入 socket.io
// var socket_url = '/www/server/nvm/versions/node/v10.15.2/lib/node_modules/';
// var io = require(socket_url+'socket.io')(server);
var io = require('socket.io')(server);


// 监听 9216 端口
server.listen(9216);
// 开启静态资源服务
app.use(express.static("./static"));
// io 各种事件
io.on('connection', function (socket) {

    // convenience function to log server messages to the client
    function log(){
        const array = ['>>> Message from server: '];
        for (var i = 0; i < arguments.length; i++) {
            array.push(arguments[i]);
        }
        socket.emit('log', array);
    }

    //console.log('websocket has connected')
    socket.emit('connection', { message: 'connection successfully' });

    socket.on('login', function (data) {
         io.sockets.emit('login', data);
    });

    socket.on('say', function (data) {
        io.sockets.emit('say', data);
    });
    socket.on('create or join', (room) => { //收到 “create or join” 消息

        var clientsInRoom = io.sockets.adapter.rooms[room];
        var numClients = clientsInRoom ? Object.keys(clientsInRoom.sockets).length : 0; //房间里的人数

        log('Room ' + room + ' has ' + numClients + ' client(s)');
        log('Request to create or join room ' + room);

        if (numClients === 0){ //如果房间里没人
            socket.join(room);
            socket.emit('created', room); //发送 "created" 消息
        } else if (numClients === 1) { //如果房间里有一个人
            io.sockets.in(room).emit('join', room);
            socket.join(room);
            socket.emit('joined', room); //发送 “joined”消息
        } else { // max two clients
            socket.emit('full', room); //发送 "full" 消息
        }
        socket.emit('emit(): client ' + socket.id +
            ' joined room ' + room);
        socket.broadcast.emit('broadcast(): client ' + socket.id +
            ' joined room ' + room);

    });

});

