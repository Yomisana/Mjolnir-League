'use strict';
require('./global');

const request = require('request');
var reInterval = require('reinterval');

const $ = {
    get_summoner_data:function(){
        request.get({
            url: url_prefix + '/lol-chat/v1/me',
            strictSSL: false,
            headers:{
                'Accept': 'application/json',
                'Authorization': client_lockfile.lockfile_token
            }
        },
            function(err, httpResponse, body){
                try{
                    //console.log("[INFO] 提取召喚師資訊中....");
                    var me_str = JSON.parse(body);
                    me.summoner_status = me_str.availability;
                    if(me.summoner_status == "away"){
                        // 離開...
                        ml_main.webContents.send("summoner_status", "離開...");
                    }else if(me.summoner_status == "chat"){
                        // 上線...
                        ml_main.webContents.send("summoner_status", "上線...");
                    }else if(me.summoner_status == "dnd"){
                        // 遊戲中...
                        ml_main.webContents.send("summoner_status", "遊戲中...");
                    }else{
                        ml_main.webContents.send("summoner_status", "");
                    }
                    me.summoner_icon = me_str.icon;
                    me.id = me_str.id;
                    me.lol.gameQueueType = me_str.lol.gameQueueType;
                    me.lol.level = me_str.lol.level;
                    ml_main.webContents.send("summoner_level", me.lol.level);
                    me.lol.masteryScore = me_str.lol.masteryScore;
                    ml_main.webContents.send("summoner_masteryScore", me.lol.masteryScore);
                    me.lol.timeStamp = me_str.lol.timeStamp;
                    me.name = me_str.name;
                    ml_main.webContents.send("summoner_name", me.name);
                    me.pid = me_str.pid;
                    me.platformId = me_str.platformId;
                    if(me.platformId == "TW"){
                        ml_main.webContents.send("summoner_region", "台服(Taiwan server - Garena)");
                    }else{
                        ml_main.webContents.send("summoner_region", me.platformId);
                    }
                    me.puuid = me_str.puuid;
                    me.statusMessage = me_str.statusMessage;
                    ml_main.webContents.send("summoner_status_message", me.statusMessage);
                    me.summonerId = me_str.summonerId;
    
                }catch (error){
                    console.error("[ERROR - summoner_Info] " + error);
                }
            }
        );
    }
}
//console.log("[INFO - get summoner data] 我有一直被呼叫嗎?");


var get_summoner_data = reInterval(function(){
    //console.log("[INFO - get summoner data] 擷取完畢");
    $.get_summoner_data();
    require('./get_gameflow');
}, 1000) // default timer 3600000 1 hr