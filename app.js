/*
 * @Author: 张驰阳
 * @Date:   2016-12-12 10:45:14
 * @Last Modified by:   张驰阳
 * @Last Modified time: 2016-12-12 16:34:58
 */

'use strict';
//引入HTTP模块
var http = require("http");
var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io").listen(server); //引入socket.io模块并绑定到服务器
var users = []; //保存所有在线用户昵称
app.use('/', express.static(__dirname + '/www'));
server.listen(90);

//socket部分
io.on("connection", function(socket) {
    //设置昵称
    socket.on("login", function(nickname) {
        if (users.indexOf(nickname) > -1) {
            socket.emit("nickExisted");
        } else {
            socket.userIndex = users.length;
            socket.nickname = nickname;
            users.push(nickname);
            socket.emit("loginSuccess");
            io.sockets.emit("system", nickname, users.length, "login");
        }
    });
    //断开连接事件
    socket.on("disconnect", function() {
        console.log("logout");
        //将断开连接的用户从users中删除u
        users.splice(socket.userIndex, 1);
        //通知除自己以为的所有人
        socket.broadcast.emit("system", socket.nickname, users.length, "logout");
    });
    //接受消息
    socket.on("postMsg", function(msg) {
        //将消息发送到除自己以为的所有用户
        socket.broadcast.emit("newMsg", socket.nickname, msg);
    });
    //接受图片
    socket.on("img", function(imgData) {
        //通过一个newImg事件分发到除自己外的每个用户
        socket.broadcast.emit("newImg", socket.nickname, imgData);
    });

})
