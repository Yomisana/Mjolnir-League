'use strict';
require('./global');
require('./permission'); // check permission has use admin run?
const check = require('./client');
const get = require('./get_client_data');
const post = require('./post_client_data');

var reInterval = require('reinterval');

var check_timer = reInterval(function(){
    if(client_is_found){
        //ml_main.webContents.send("client_is_found", client_status[1]);
        check_timer.reschedule(refresh_check_path_timer.open);
        if(is_lockfile_get){
            ml_main.webContents.send("client_is_found", client_status[1]);
            get.summoner_data();
            get.wallet();
            get.summoner_info();
            if(me.id != ""){
                get.gameflow();
                if(gameflow_ReadyCheck){ // 狀態
                    //console.log("設定狀態: " + settings.accept_checkbox)
                    if(settings.accept_checkbox){ // 設定
                        post.matchmaking_accept();
                    }else{
                        ml_main.webContents.send("game_status", gameflow + " | 對戰已匹配等待接受中...");
                        console.log("[INFO] 對戰已匹配等待接受中...");
                    }
                }
                if(gameflow_ChampSelect){
                    get.select_champion_msg();
                    ml_main.webContents.send("champselect_chat", champselect.chat_body); // 從這邊發送的話有助於在其他頁面也可以發送資料
                    get.select_champion_data();
                }
            }
        }
    }else{
        //console.log("檢查客戶端是否啟動中...")
        check.is_lol_client_open(); // client
        check_timer.reschedule(refresh_check_path_timer.close);
    }
}, 1000) // default timer is not change de
