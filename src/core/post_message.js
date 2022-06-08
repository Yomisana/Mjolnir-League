'use strict';
require('./global');

const request = require('request');
var reInterval = require('reinterval');

const $ = {
    get_chatid:function(){
        // 提取所有聊天室ID
        request.get({
            url: url_prefix + '/lol-chat/v1/conversations/',
            strictSSL: false,
            headers:{
                'Accept': 'application/json',
                'Authorization': client_lockfile.lockfile_token
            }
        },
            function(err, httpResponse, body){
                var obj = JSON.parse(body);
                for(let data of obj){
                    if(data.type == "championSelect"){
                        conversations_id_get = true;
                        if(data.lastMessage == null){
                            console.log("[INFO] 成功連線到選角聊天室!");
                        }
                        conversations.id = data.id;
                    }
                }
            }
        );
    },
    post_message:function(){
        // 處理 訊息資料
        console.log("[INFO - post_message] URL: " + url_prefix + '/lol-chat/v1/conversations/' + conversations.id + '/messages');
        const chat_data = {
            "body": postMessage.message[3],
            "type": postMessage.type[0],
        };
        const post_chat_data = JSON.stringify(chat_data);
        //console.log(post_chat_data);
        // 傳送訊息出去
        request.post({
            url: url_prefix + '/lol-chat/v1/conversations/' + conversations.id + '/messages',
            strictSSL: false,
            body: post_chat_data,
            headers:{
                'Accept': 'application/json',
                'Authorization': client_lockfile.lockfile_token
            }
        }),
            function(err, httpResponse, body){
                try{
                    console.log("[INFO - post_message] 發送訊息完畢");
                }catch(error){
                    console.error("[ERROR - post_message] "+err);
                    console.error("[ERROR - post_message] "+error);
                }
            }
    }
}
var get_chatid = reInterval(function(){
    $.get_chatid();
    /*for(var i = 1; i == postMessage.times; i++){
        console.log("[觸發訊息]" + i);
        $.post_message();
    }*/
    $.post_message();
}, 1000)


