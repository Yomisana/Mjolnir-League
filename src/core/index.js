'use strict';
require('./global');
require('./permission'); // check permission has use admin run?
const check = require('./client');
const get = require('./get_client_data');
const post = require('./post_client_data');

const reInterval = require('reinterval');

const $ = {
    refresh_time: function(){
        console.log("當前度調頻率(Open):" + refresh_check_path_timer.open);
        console.log("當前度調頻率(Close):" + refresh_check_path_timer.close);
        check_timer.reschedule(refresh_check_path_timer.open);
        check_timer.reschedule(refresh_check_path_timer.close);
        console.log("度調頻率設定完成");
        ml_main.webContents.send("api_refresh", refresh_check_path_timer.open / 1000);
        ml_main.webContents.send("find_refresh", refresh_check_path_timer.close / 1000);
    },
    closetimer: function(){
        console.log("關閉動態時間");
        check_timer.destroy();
        console.log("關閉動態時間完畢");
    }
}

let check_timer = reInterval(function(){
    // console.log("Tik Tok Tik Tok This is reinterval timer loop");
    if(client_is_found){
        //ml_main.webContents.send("client_is_found", client_status[1]);
        check_timer.reschedule(refresh_check_path_timer.open);
        //console.log("客戶端運行中...")
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
                        console.log("[INFO] 對戰已匹配等待玩家手動接受中...");
                    }
                }
                if(gameflow_ChampSelect){
                    get.select_champion_msg();
                    ml_main.webContents.send("champselect_chat", champselect.chat_body); // 從這邊發送的話有助於在其他頁面也可以發送資料
                    // get.select_champion_data();
                    // console.log("check point(session):" + battle.session);
                    // console.table(battle.myteam_arr);
                    if(battle.session){
                        //get.select_champion_data_();
                        // console.log("前往下一個工作點(DisplayName)");
                        // console.table(battle.myteam_arr);
                        if(battle.displayname){
                            // console.log("前往下一個工作點(Rank)");
                            // console.table(battle.myteam_arr);
                            if(battle.rank){
                                if(battle.championName){
                                    // console.log("前往下一個工作點(championData)");
                                    // console.table(battle.myteam_arr);
                                    if(battle.championData){
                                        console.log("Done!");
                                        ml_main.webContents.send("battle_info", battle.myteam_arr); // 從這邊發送的話有助於在其他頁面也可以發送資料
                                        // console.table(battle.myteam_arr);
                                        // ml_main.webContents.send("battle_info", battle.myteam_arr); // 從這邊發送的話有助於在其他頁面也可以發送資料
                                        battle.session = false;battle.displayname = false;battle.rank = false;
                                        battle.championName = false;battle.championData = false;
                                        battle.myteam_arr = [];battle.myteam_num = 0;
                                    }else{
                                        get.select_champion_data_championData();
                                    }
                                }else{
                                    get.select_champion_data_championName();
                                }
                            }else{
                                get.select_champion_data_rank();
                            }
                        }else{
                            get.select_champion_data_displayname();
                        }
                    }else{
                        get.select_champion_data_session();
                    }
                }
            }
        }
    }else{
        //console.log("檢查客戶端是否啟動中...")
        check.is_lol_client_open(); // client
        check_timer.reschedule(refresh_check_path_timer.close);
    }
}, 1000) // default timer is not change de

module.exports = $;