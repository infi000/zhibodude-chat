/*
 * @Author: 张驰阳
 * @Date:   2016-12-12 11:09:48
 * @Last Modified by:   张驰阳
 * @Last Modified time: 2016-12-12 17:14:13
 */

'use strict';

window.onload = function() {
    //实例并初始化我们的hichat程序
    var hichat = new HiChat();
    hichat.init();

};

//定义我们的hichat类
var HiChat = function() {
    this.socket = null;
};

//向原型添加业务方法
HiChat.prototype = {
    init: function() { //此方法初始化程序
        var that = this;
        //建立到服务器的socket连接
        this.socket = io.connect();
        //监听socket的connect事件，此事件表示连接已经建立
        this.socket.on('connect', function() {
            //连接到服务器后，显示昵称输入框
            document.getElementById('info').textContent = 'get yourself a nickname :)';
            document.getElementById('nickWrapper').style.display = 'block';
            document.getElementById('nicknameInput').focus();
        });
        //昵称设置按钮
        document.getElementById("loginBtn").addEventListener("click", function() {
            var nickName = document.getElementById("nicknameInput").value;
            //检查昵称输入框为空
            if (nickName.trim().length != 0) {
                //不为空，则发起一个longin时间并将输入的昵称发送给服务器
                that.socket.emit("login", nickName);
            } else {
                //否则输入框获得焦点
                document.getElementById("nicknameInput").focus();
            }
        }, false);
        //监听服务器返回nickExisted事件，提示昵称被占用
        this.socket.on("nickExisted",function(){
            document.getElementById("info").textContent="!nickname is taken, choose another pls";
        });
        //监听服务器返回loginSuccess事件，去除遮罩层
        this.socket.on("loginSuccess",function(){
            document.title="hichat |" +document.getElementById("nicknameInput").value;
            document.getElementById("loginWrapper").style.display="none";
            document.getElementById("messageInput").focus();
        });
        //监听system系统事件
        this.socket.on("system",function(nickName,userCount,type){
            //判断用户是连接还是离开
            var msg=nickName+(type=="login"?"joined":"left");
            that._displayNewMsg("system",msg,"red");
            document.getElementById("status").textContent=userCount+(userCount>1?"users ":"user ")+" online";
            // //将在线人数显示到页面顶部
        });
        //发送信息
        document.getElementById("sendBtn").addEventListener("click",function(){
                   var messageInput=document.getElementById("messageInput");
                   var msg=messageInput.value;
                   messageInput.value="";
                   messageInput.focus();
                   if(msg.trim().length!=0){
                    that.socket.emit("postMsg",msg);
                    //把消息发送到服务器
                    that._displayNewMsg("me",msg);
                    //把自己的消息显示到窗口中
                   };
        },false);
        //发送图片
        document.getElementById("sendImage").addEventListener("click",function(){
            //检查是否有文件被选中
            if(this.files.length!=0){
                //获取文件并用filereader进行读取
                var file=this.files[0];
                var reader=new FileReader();
                if(!reader){
                    that._displayNewMsg("system","!your brower do not support fileReader","red");
                    this.value="";
                    return ;
                };
                reader.onload=function(e){
                    //读取成功，显示到页面并发送送到服务器
                    this.value="";
                    console.log(e);
                    that.socket.emit("img",e.target.result);

                    that._displayImage("me",e.target.result);
                };
                reader.readAsDataURL(file);
            };
        },false);
        //接受消息
        this.socket.on("newMsg",function(user,msg){
            that._displayNewMsg(user,msg);
        });
        this.socket.on("newImg",function(user,img){
            that._displayImage(user,img);
        });
        //加载表情
        this._initialEmoji();
        document.getElementById("emoji").addEventListener("click",function(e){
            
        })
    },
    _displayNewMsg:function(user,msg,color){
        var container=document.getElementById("historyMsg");
        var msgToDisplay=document.createElement("p");
        var date=new Date().toTimeString().substr(0,8);
        msgToDisplay.style.color=color||"#000";
         msgToDisplay.innerHTML = user + '<span class="timespan">' + date +'</span> : ' + msg;
         container.appendChild(msgToDisplay);
         container.scrollTop=container.scrollHeight;
    },
    _displayImage:function(user,imgData,color){
        var container=document.getElementById("historyMsg");
        var msgToDisplay=document.createElement("p");
        var date=new Date().toTimeString().substr(0,8);
        msgToDisplay.style.color=color||"#000";
        msgToDisplay.innerHTML=user+ "<span class='timespan'>("+date+"):</span><br/>"+"<a href='"+imgData+"'target='_blank'><img src='"+imgData+"'/></a>";
        container.appendChild(msgToDisplay);
        container.scrollTop=container.scrollHeight;
    },
    _initialEmoji:function(){
        var emojiContainer=document.getElementById("emojiWrapper");
        var docFragment=document.createDocumentFragment();
        for(var i=69;i>0;i--){
            var emojiItem=document.createElement("img");
            emojiItem.src="../content/emoji/"+i+".gif";
            emojiItem.title=i;
            docFragment.appendChild(emojiItem);
        };
        emojiContainer.appendChild(docFragment);
    }
};
