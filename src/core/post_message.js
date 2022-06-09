'use strict';
require('./global');

const request = require('request');
var reInterval = require('reinterval');
var i = 0;

const $ = {
    get_chatid: function(){
		return new Promise((resolve,reject)=>{
			setTimeout(()=>{
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
								else{
									console.log(`data.lastMessage.fromId: ${data.lastMessage.fromId}`);
									console.log(`me.id: ${me.id}`);
									console.log(`data.lastMessage.body: ${data.lastMessage.body}`);
									console.log(`postMessage.message[0]: ${postMessage.message[0]}`);
									
									if(data.lastMessage.fromId == me.id && data.lastMessage.body == postMessage.message[0]) i++;
								}
								
								conversations_id = data.id;
								resolve(true);
							}
						}
						
						resolve(false);
					}
				);
			},850);
		});
        // 提取所有聊天室ID
    },
    post_message: function(msg,type,times){
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
    }
};

(async function(gb){
	let k = 0;
	while(true){
		k++;
		let inChat = await $.get_chatid();
		//console.log('執行第'+k+'次');
		//console.log('inChat',inChat,',','i',i);
		if(gb.conversations_id_get && inChat && i <= 2){
			var msg = gb.postMessage.message[0];
			var type = gb.postMessage.type[1];
			var times = gb.postMessage.times;
			for(var j = 1; j < times; j++){
				console.log("[觸發訊息]" + j);
				console.log("[觸發訊息]" + times);
				await $.post_message(msg,type,times);
			}
		}
		else if(!inChat){
			i = 1;
		}
	}
}(global));