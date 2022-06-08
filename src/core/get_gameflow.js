'use strict';
require('./global');

const request = require('request');
var reInterval = require('reinterval');
const $ = {
    get_status: function(){
        request.get({
            url: url_prefix + '/lol-gameflow/v1/gameflow-phase',
            strictSSL: false,
            headers:{
                'Accept': 'application/json',
                'Authorization': client_lockfile.lockfile_token
            }
        },
            function(err, httpResponse, body){
                try{
                    gameflow = body.replace(/[^A-Z0-9]/ig,"");
                    if(gameflow == "None"){
                        gameflow_ChampSelect = false;
                        ml_main.webContents.send("game_status", gameflow + " | 你目前可能在首頁或是選擇模式大廳");
                    }else if(gameflow == "Lobby"){
                        gameflow_ChampSelect = false;
                        if(me.lol.gameQueueType == "NORMAL"){
                            ml_main.webContents.send("game_status", gameflow + " | 一般盲選對戰房間");
                        }else if(me.lol.gameQueueType == "RANKED_SOLO_5x5"){
                            ml_main.webContents.send("game_status", gameflow + " | 單雙積分對戰房間");
                        }else if(me.lol.gameQueueType == "RANKED_FLEX_SR"){
                            ml_main.webContents.send("game_status", gameflow + " | 彈性積分對戰房間");
                        }else if(me.lol.gameQueueType == "NONE"){
                            ml_main.webContents.send("game_status", gameflow + " | 自訂對戰對戰房間");
                        }else if(me.lol.gameQueueType == "ARAM_UNRANKED_5x5"){
                            ml_main.webContents.send("game_status", gameflow + " | 一般隨機單中對戰房間");
                        }else if(me.lol.gameQueueType == "NORMAL_TFT"){
                            ml_main.webContents.send("game_status", gameflow + " | 一般戰旗對戰房間");
                        }else if(me.lol.gameQueueType == "RANKED_TFT"){
                            ml_main.webContents.send("game_status", gameflow + " | 戰旗積分對戰房間");
                        }else if(me.lol.gameQueueType == "RANKED_TFT_TURBO"){
                            ml_main.webContents.send("game_status", gameflow + " | 超級抽抽樂戰旗對戰房間");
                        }else if(me.lol.gameQueueType == "RANKED_TFT_PAIRS"){
                            ml_main.webContents.send("game_status", gameflow + " | 雙人搭檔工作房對戰房間");
                        }else if(me.lol.gameQueueType == "URF"){
                            ml_main.webContents.send("game_status", gameflow + " | 阿福快打對戰房間");
                        }else if(me.lol.gameQueueType == "BOT"){
                            ml_main.webContents.send("game_status", gameflow + " | 玩家打電腦對戰房間");
                        }else if(me.lol.gameQueueType == "PRACTICETOOL"){
                            ml_main.webContents.send("game_status", gameflow + " | 練習工具對戰房間");
                        }else{
                            ml_main.webContents.send("game_status", gameflow + " | Waiting Play...");
                        }
                    }else if(gameflow == "Matchmaking"){
                        gameflow_ReadyCheck = false;
                        if(me.lol.gameQueueType == "NORMAL"){
                            ml_main.webContents.send("game_status", gameflow + " | 匹配一般盲選");
                        }else if(me.lol.gameQueueType == "RANKED_SOLO_5x5"){
                            ml_main.webContents.send("game_status", gameflow + " | 匹配單雙積分");
                        }else if(me.lol.gameQueueType == "RANKED_FLEX_SR"){
                            ml_main.webContents.send("game_status", gameflow + " | 匹配彈性積分");
                        }else if(me.lol.gameQueueType == "NONE"){
                            ml_main.webContents.send("game_status", gameflow + " | 匹配自訂對戰");
                        }else if(me.lol.gameQueueType == "ARAM_UNRANKED_5x5"){
                            ml_main.webContents.send("game_status", gameflow + " | 匹配一般隨機單中");
                        }else if(me.lol.gameQueueType == "NORMAL_TFT"){
                            ml_main.webContents.send("game_status", gameflow + " | 匹配一般戰旗");
                        }else if(me.lol.gameQueueType == "RANKED_TFT"){
                            ml_main.webContents.send("game_status", gameflow + " | 匹配戰旗積分");
                        }else if(me.lol.gameQueueType == "RANKED_TFT_TURBO"){
                            ml_main.webContents.send("game_status", gameflow + " | 匹配超級抽抽樂戰旗");
                        }else if(me.lol.gameQueueType == "RANKED_TFT_PAIRS"){
                            ml_main.webContents.send("game_status", gameflow + " | 匹配雙人搭檔工作房");
                        }else if(me.lol.gameQueueType == "URF"){
                            ml_main.webContents.send("game_status", gameflow + " | 匹配阿福快打");
                        }else if(me.lol.gameQueueType == "BOT"){
                            ml_main.webContents.send("game_status", gameflow + " | 匹配玩家打電腦");
                        }else if(me.lol.gameQueueType == "PRACTICETOOL"){
                            ml_main.webContents.send("game_status", gameflow + " | 匹配練習工具");
                        }else{
                            ml_main.webContents.send("game_status", gameflow + " | 你目前在匹配列隊中?? 這...你辦不到的!!如果可以教我拜託了!!不可能是BUG真的!!");
                        }
                    }else if(gameflow == "ReadyCheck"){ // 自動接受
                        ml_main.webContents.send("game_status", gameflow + " | 對戰正在自動接受中...");
                        console.log("[INFO] 傳送自動接受資訊中...");
                        gameflow_ReadyCheck = true;
                        gameflow_ChampSelect = false;
                    }else if(gameflow == "ChampSelect"){
                        gameflow_ReadyCheck = false;
                        if(me.lol.gameQueueType == "NORMAL"){
                            gameflow_ChampSelect = true;
                            ml_main.webContents.send("game_status", gameflow + " | 一般盲選 選擇英雄腳色中");
                        }else if(me.lol.gameQueueType == "RANKED_SOLO_5x5"){
                            ml_main.webContents.send("game_status", gameflow + " | 單雙積分 選擇英雄腳色中");
                        }else if(me.lol.gameQueueType == "RANKED_FLEX_SR"){
                            ml_main.webContents.send("game_status", gameflow + " | 彈性積分 選擇英雄腳色中");
                        }else if(me.lol.gameQueueType == "NONE"){
                            ml_main.webContents.send("game_status", gameflow + " | 自訂對戰 選擇英雄腳色中");
                        }else if(me.lol.gameQueueType == "ARAM_UNRANKED_5x5"){
                            ml_main.webContents.send("game_status", gameflow + " | 一般隨機單中 選擇英雄腳色中");
                        }else if(me.lol.gameQueueType == "NORMAL_TFT"){
                            ml_main.webContents.send("game_status", gameflow + " | 一般戰旗 選擇英雄腳色中(??)");
                        }else if(me.lol.gameQueueType == "RANKED_TFT"){
                            ml_main.webContents.send("game_status", gameflow + " | 戰旗積分 選擇英雄腳色中(??)");
                        }else if(me.lol.gameQueueType == "RANKED_TFT_TURBO"){
                            ml_main.webContents.send("game_status", gameflow + " | 超級抽抽樂戰旗 選擇英雄腳色中(??)");
                        }else if(me.lol.gameQueueType == "RANKED_TFT_PAIRS"){
                            ml_main.webContents.send("game_status", gameflow + " | 雙人搭檔工作房 選擇英雄腳色中(??)");
                        }else if(me.lol.gameQueueType == "URF"){
                            ml_main.webContents.send("game_status", gameflow + " | 阿福快打 選擇英雄腳色中");
                        }else if(me.lol.gameQueueType == "BOT"){
                            ml_main.webContents.send("game_status", gameflow + " | 玩家打電腦 選擇英雄腳色中");
                        }else if(me.lol.gameQueueType == "PRACTICETOOL"){
                            gameflow_ChampSelect = true;
                            ml_main.webContents.send("game_status", gameflow + " | 練習工具 選擇英雄腳色中");
                        }else{
                            ml_main.webContents.send("game_status", gameflow + " | 你目前正在選擇英雄腳色中?? 這...你辦不到的!!如果可以教我拜託了!!不可能是BUG真的!!");
                        }
                    }else if(gameflow == "InProgress"){
                        gameflow_ChampSelect = false;
                        ml_main.webContents.send("game_status", gameflow + " | 遊玩中...");
                    }else if(gameflow == "Reconnect"){
                        ml_main.webContents.send("game_status", gameflow + " | 遊戲還在進行中...請盡快連接回去!");
                    }else if(gameflow == "PreEndOfGame"){
                        ml_main.webContents.send("game_status", gameflow + " | 誰 Carry 這場 或是 態度佳的隊友給他一個選項吧!");
                    }else if(gameflow == "EndOfGame"){
                        ml_main.webContents.send("game_status", gameflow + " | 遊戲結束...下一場吧");
                    }
                }catch(error){
                    console.error("[ERROR - get_status] "+err);
                    console.error("[ERROR - get_status] "+error);
                    game_is_found = false;game_is_notfound = true;gameflow_ReadyCheck = false;gameflow_ChampSelect = false;
                }
            }
        );
    },
    post_accept: function(){
        console.log("[INFO - Auto Accept] 發送允許對戰");
        request.post({
            url: url_prefix + '/lol-matchmaking/v1/ready-check/accept',
            strictSSL: false,
            headers:{
                'Accept': 'application/json',
                'Authorization': client_lockfile.lockfile_token
            }
        })
    }
}


var get_summoner_data = reInterval(function(){
    $.get_status();
    if(gameflow_ReadyCheck){
        $.post_accept();
    }
    if(gameflow_ChampSelect){
        require('./post_message');
    }
}, 1000)