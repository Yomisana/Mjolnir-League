'use strict';
require('./global');

const request = require('request');
var reInterval = require('reinterval');

const $ = {
    get_chatid: function(){
		return new Promise((resolve,reject)=>{
			request.get({
				url: url_prefix + '/lol-chat/v1/conversations/',
				strictSSL: false,
				headers:{
					'Accept': 'application/json',
					'Authorization': client_lockfile.lockfile_token
				}
			},
				function(err, httpResponse, body){
					if(err) reject(err);
					
					var obj = JSON.parse(body);
					for(let data of obj){
						if(data.type == "championSelect"){
							conversations_id_get = true;
							if(data.lastMessage == null){
								console.log("[INFO] 成功連線到選角聊天室!");
							}
							conversations_id = data.id;
							resolve(true);
						}
					}
				}
			);
		});
        // 提取所有聊天室ID
    },
    post_message: function(msg,type){
		return new Promise((resolve,reject)=>{
			// 處理 訊息資料
			const chat_data = {
				"body": msg,
				"type": type,
			};
			const post_chat_data = JSON.stringify(chat_data);
			//console.log(post_chat_data);
			// 傳送訊息出去
			request.post({
				url: url_prefix + '/lol-chat/v1/conversations/' + conversations_id + '/messages',
				strictSSL: false,
				body: post_chat_data,
				headers:{
					'Accept': 'application/json',
					'Authorization': client_lockfile.lockfile_token
				}
			},function(err, httpResponse, body){
					if(err){
						console.error("[ERROR - post_message] "+err);
						reject(err);
					}
					console.log("[INFO - post_message] 發送訊息完畢");
					resolve(true);
				}
			);
		});
    },
	waitUntil: async function(cond){
	  return await new Promise(resolve => {
		const interval = setInterval(() => {
		  if (cond == true) {
			resolve(true);
			clearInterval(interval);
		  };
		}, 1000);
	  });
	}
}

var timerCond = $.waitUntil($.get_chatid());

var get_chatid = setInterval(async function(){
	if(timerCond){
		var msg = postMessage.message[0];
		var type = postMessage.type[1];
		var times = postMessage.times;

		for(var i = 1; i < times; i++){
			console.log("[觸發訊息]" + i);
			console.log("[觸發訊息]" + times);
			//await $.post_message(msg,type,times);
            await $.post_message(msg,type);
		}
	}
}, 1000);