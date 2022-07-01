'use strict';
require('./global');

const request = require('request');

const $ = {
    summoner_data:function(){
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
                    let me_str = JSON.parse(body);
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
                    // ml_main.webContents.send("summoner_level", me.lol.level);
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
                    if(me.statusMessage == ""){
                        ml_main.webContents.send("summoner_status_message", "None");
                    }else{
                        ml_main.webContents.send("summoner_status_message", me.statusMessage);
                    }
                    
                    me.summonerId = me_str.summonerId;
    
                }catch (error){
                    console.error("[ERROR - summoner_Info] " + error);
                    client_is_found = false;
                }
            }
        );
    },
    gameflow: function(){
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
                        $.clear_select_champion();// chat page reset
                        ml_main.webContents.send("game_status", gameflow + " | 你目前可能在首頁或是選擇模式大廳");
                    }else if(gameflow == "Lobby"){
                        gameflow_ReadyCheck = false;
                        gameflow_ChampSelect = false;

                        $.clear_select_champion();// chat page reset
                        
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
                        }else if(me.lol.gameQueueType == "RANKED_TFT_DOUBLE_UP"){
                            ml_main.webContents.send("game_status", gameflow + " | 雙人搭檔工作坊對戰房間");
                        }else if(me.lol.gameQueueType == "URF"){
                            ml_main.webContents.send("game_status", gameflow + " | 阿福快打對戰房間");
                        }else if(me.lol.gameQueueType == "BOT"){
                            ml_main.webContents.send("game_status", gameflow + " | 玩家打電腦對戰房間");
                        }else if(me.lol.gameQueueType == "PRACTICETOOL"){
                            ml_main.webContents.send("game_status", gameflow + " | 練習工具對戰房間");
                        }else{
                            ml_main.webContents.send("game_status", gameflow + " | 約德爾人把伺服器用炸了，導致本來就有的對戰房間變不見了(伺服器BUG了 QQ)");
                        }
                    }else if(gameflow == "Matchmaking"){
                        gameflow_ReadyCheck = false;
                        
                        $.clear_select_champion();// chat page reset

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
                        }else if(me.lol.gameQueueType == "RANKED_TFT_DOUBLE_UP"){
                            ml_main.webContents.send("game_status", gameflow + " | 匹配雙人搭檔工作坊");
                        }else if(me.lol.gameQueueType == "URF"){
                            ml_main.webContents.send("game_status", gameflow + " | 匹配阿福快打");
                        }else if(me.lol.gameQueueType == "BOT"){
                            ml_main.webContents.send("game_status", gameflow + " | 匹配玩家打電腦");
                        }else if(me.lol.gameQueueType == "PRACTICETOOL"){
                            ml_main.webContents.send("game_status", gameflow + " | 匹配練習工具");
                        }else{
                            ml_main.webContents.send("game_status", gameflow + " | 你目前在匹配未知列隊中?? 這...你辦不到的!! 伺服器是不是炸了");
                        }
                    }else if(gameflow == "ReadyCheck"){ // 自動接受
                        // ml_main.webContents.send("game_status", gameflow + " | 對戰正在自動接受中...");
                        // console.log("[INFO] 傳送自動接受資訊中...");
                        gameflow_ReadyCheck = true;
                        gameflow_ChampSelect = false;
                    }else if(gameflow == "ChampSelect"){ // 選擇角色
                        gameflow_ReadyCheck = false;
                        if(me.lol.gameQueueType == "NORMAL"){
                            gameflow_ChampSelect = true;
                            ml_main.webContents.send("game_status", gameflow + " | 一般盲選 選擇英雄腳色中");

                        }else if(me.lol.gameQueueType == "RANKED_SOLO_5x5"){
                            gameflow_ChampSelect = true;
                            ml_main.webContents.send("game_status", gameflow + " | 單雙積分 選擇英雄腳色中");

                        }else if(me.lol.gameQueueType == "RANKED_FLEX_SR"){
                            gameflow_ChampSelect = true;
                            ml_main.webContents.send("game_status", gameflow + " | 彈性積分 選擇英雄腳色中");

                        }else if(me.lol.gameQueueType == "NONE"){
                            gameflow_ChampSelect = true;
                            ml_main.webContents.send("game_status", gameflow + " | 自訂對戰 選擇英雄腳色中");
                            
                        }else if(me.lol.gameQueueType == "ARAM_UNRANKED_5x5"){
                            gameflow_ChampSelect = true;
                            ml_main.webContents.send("game_status", gameflow + " | 一般隨機單中 選擇英雄腳色中");
                        }else if(me.lol.gameQueueType == "NORMAL_TFT"){
                            ml_main.webContents.send("game_status", gameflow + " | 一般戰旗 選擇英雄腳色中(??)");
                        }else if(me.lol.gameQueueType == "RANKED_TFT"){
                            ml_main.webContents.send("game_status", gameflow + " | 戰旗積分 選擇英雄腳色中(??)");
                        }else if(me.lol.gameQueueType == "RANKED_TFT_TURBO"){
                            ml_main.webContents.send("game_status", gameflow + " | 超級抽抽樂戰旗 選擇英雄腳色中(??)");
                        }else if(me.lol.gameQueueType == "RANKED_TFT_DOUBLE_UP"){
                            ml_main.webContents.send("game_status", gameflow + " | 雙人搭檔工作坊 選擇英雄腳色中(??)");
                        }else if(me.lol.gameQueueType == "URF"){
                            ml_main.webContents.send("game_status", gameflow + " | 阿福快打 選擇英雄腳色中");
                        }else if(me.lol.gameQueueType == "BOT"){
                            ml_main.webContents.send("game_status", gameflow + " | 玩家打電腦 選擇英雄腳色中");
                        }else if(me.lol.gameQueueType == "PRACTICETOOL"){
                            gameflow_ChampSelect = true;
                            ml_main.webContents.send("game_status", gameflow + " | 練習工具 選擇英雄腳色中");

                        }else{
                            ml_main.webContents.send("game_status", gameflow + " | 你目前正在普羅找不到的地方選擇英雄腳色中?? 這...你辦不到的!! 伺服器是不是炸了?");
                        }
                    }else if(gameflow == "InProgress"){
                        gameflow_ChampSelect = false;
                        
                        $.clear_select_champion();// chat page reset
                        
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
                    client_is_found = false;
                    game_is_found = false;game_is_notfound = true;gameflow_ReadyCheck = false;
                    gameflow_ChampSelect = false;
                }
            }
        );
    },
    wallet: function(){
        // /lol-store/v1/wallet
        request.get({
            url: url_prefix + '/lol-store/v1/wallet',
            strictSSL: false,
            headers:{
                'Accept': 'application/json',
                'Authorization': client_lockfile.lockfile_token
            }
        },
            function(err, httpResponse, body){
                try{
                    let wallet_str = JSON.parse(body);
                    wallet.ip = wallet_str.ip;
                    wallet.rp = wallet_str.rp;
                    //console.log("[INFO - wallet] 藍粉: " + wallet.ip + " 聯盟幣: " + wallet.rp);
                    ml_main.webContents.send("summoner_wallet_ip", wallet.ip);
                    ml_main.webContents.send("summoner_wallet_rp", wallet.rp);
                }catch (error){
                    console.error("[ERROR - summoner_wallet] " + error);
                    client_is_found = false;
                }
            }
        );
    },
    summoner_info: function(){
        // /lol-summoner/v1/current-summoner
        request.get({
            url: url_prefix + '/lol-summoner/v1/current-summoner',
            strictSSL: false,
            headers:{
                'Accept': 'application/json',
                'Authorization': client_lockfile.lockfile_token
            }
        },
            function(err, httpResponse, body){
                try{
                    let summoner_info_str = JSON.parse(body);
                    //console.log("[DEBUG - summoner_info] " + body);
                    summoner_info.xpSinceLastLevel = summoner_info_str.xpSinceLastLevel;
                    summoner_info.xpUntilNextLevel = summoner_info_str.xpUntilNextLevel;
                    ml_main.webContents.send("summoner_level", me.lol.level + `(${summoner_info.xpSinceLastLevel} / ${summoner_info.xpUntilNextLevel})`);
                }catch (error){
                    console.error("[ERROR - summoner_wallet] " + error);
                    client_is_found = false;
                }
            }
        );
    },
    select_champion_msg: function(){
        request.get({
            url: url_prefix + '/lol-chat/v1/conversations/',
            strictSSL: false,
            headers:{
                'Accept': 'application/json',
                'Authorization': client_lockfile.lockfile_token
            }
        },
            function(err, httpResponse, body){
                try{
                    let obj = JSON.parse(body);
                    for(let data of obj){
                        if(data.type == "championSelect"){
                            if(data.lastMessage == null){
                            }else{
                                champselect.msg_id = data.lastMessage.id; // 先把最新的ID 丟到 Global 紀錄
                                if(champselect.msg_id != champselect.histroy_msgid){
                                    //console.log(`聊天室第 ${champselect.chat_id+1} 個訊息`);

                                    //console.log("API所取得的聊天室訊息: " + data.lastMessage.body); // msg
                                    champselect.chat_msg.push(data.lastMessage.body);

                                    let date = new Date(data.lastMessage.timestamp); // timestamp
                                    champselect.chat_msg_timestamp.push(date.toLocaleString());

                                    champselect.histroy_msgid = champselect.msg_id;
                                    ///console.log("陣列訊息內容量: " + champselect.chat_msg.length);
                                    //console.log("陣列訊息時間量: " + champselect.chat_msg_timestamp.length);
                                    // 召喚師名稱
                                    //console.log("召喚師名字提取" + url_prefix + `/lol-summoner/v1/summoners/${data}`);
                                    request.get({
                                        url: url_prefix + `/lol-summoner/v1/summoners/${data.lastMessage.fromSummonerId}`,
                                        strictSSL: false,
                                        headers:{
                                            'Accept': 'application/json',
                                            'Authorization': client_lockfile.lockfile_token
                                        }
                                    },
                                        function(err, httpResponse, body){
                                            let obj = JSON.parse(body);
                                            //console.log(obj.displayName);
                                            champselect.chat_msg_summoner.push(obj.displayName);

                                            champselect.chat_body.push(`[${champselect.chat_msg_timestamp[champselect.chat_id]}]${champselect.chat_msg_summoner[champselect.chat_id]}:${champselect.chat_msg[champselect.chat_id]}`);
                                            console.log("[INFO - select champ chat room msg]" + champselect.chat_body[champselect.chat_id]);
                                            champselect.chat_id = champselect.chat_id + 1 ;
                                    });
                                    //ml_main.webContents.send("champselect_chat", champselect.chat_body); // 改到 index 
                                }
                            }
                        }
                    }

                }catch (error){
                    console.error("[ERROR - champion_data] " + error);
                }
            }
        );
    },
    clear_select_champion: function(){
        // chat page reset
        champselect.histroy_msgid = null;champselect.msg_id = null;
        champselect.chat_id = 0;champselect.chat_msg = [];
        champselect.chat_msg_timestamp = [];champselect.chat_body = [];
        ml_main.webContents.send("champselect_chat", '');

        // 玩家資料
        battle.session = false;battle.displayname = false;battle.rank = false;
        battle.championName = false;battle.championData = false;
        battle.myteam_arr = [];
        battle.myteam_num = 0;
        ml_main.webContents.send("battle_info", '');
    },
    select_champion_data_session: function(){
        request.get({
            // 僅在 盲選 、 積分(單雙/彈性) 、 自訂 與 訓練顯示 (還有單中 測試用的)
            url: url_prefix + '/lol-champ-select/v1/session',
            strictSSL: false,
            headers:{
                'Accept': 'application/json',
                'Authorization': client_lockfile.lockfile_token
            }
        },
            function(err, httpResponse, body){
                try{
                    let data = JSON.parse(body);
                    battle.myteam_num = data.myTeam.length;
                    for(let i = 0; i < battle.myteam_num; i++){                  
                        battle.myteam_arr[i] = [data.myTeam[i].cellId , data.myTeam[i].summonerId , data.myTeam[i].championId];
                        // console.log(`i:${i} | myteam_length:${battle.myteam_num}`);
                        if(i+1 == battle.myteam_num){
                            // console.log(`i(loop):${i+1} | myteam_length:${battle.myteam_num}`);
                            // console.log("最後一個跑完囉!");
                            battle.session = true;
                            // console.table(battle.myteam_arr);
                        }
                    }
                    //$.summoner_displayname();
                    // ┌─────────┬───┬───────────┬───────┐
                    // │ (index) │ 0 │     1     │   2   │
                    // ├─────────┼───┼───────────┼───────┤
                    // │    0    │ 0 │ 554237685 │ 16    │
                    // │    1    │ 1 │ 28183234  │ 145   │
                    // └─────────┴───┴───────────┴───────┘
                }catch (error){
                    console.error("[ERROR - champion_data] " + error);
                }
            }
        );
    },
    select_champion_data_displayname: function(){
        function request_data(i){
            request.get({
                url: url_prefix + `/lol-summoner/v1/summoners/${battle.myteam_arr[i][1]}`,
                strictSSL: false,
                headers:{
                    'Accept': 'application/json',
                    'Authorization': client_lockfile.lockfile_token
                }
            },
            function(err, httpResponse, body){
                try{
                    let obj = JSON.parse(body);
                    if(obj.message != "No summoner name for id 0"){
                        battle.myteam_arr[i].push(obj.displayName);
                        battle.myteam_arr[i].push(obj.puuid);
                        // console.table(battle.myteam_arr);
                    }else{    
                        battle.myteam_arr[i].push("電腦(機器人)");
                        battle.myteam_arr[i].push("puuid");
                        // console.table(battle.myteam_arr);
                    }
                }catch (error){
                    console.error("[ERROR - champion_data] " + error);
                }
            });
        }
        for(let x = 0; x < battle.myteam_num; x++){
            request_data(x);
            if(x+1 == battle.myteam_num){
                battle.displayname = true;
                // console.table(battle.myteam_arr);
            }
        }
    },
    select_champion_data_rank: function(){
        function request_data(i){
            request.get({
                url: url_prefix + `/lol-ranked/v1/ranked-stats/${battle.myteam_arr[i][4]}`,
                strictSSL: false,
                headers:{
                    'Accept': 'application/json',
                    'Authorization': client_lockfile.lockfile_token
                }
            },
            function(err, httpResponse, body){
                try{
                    let obj = JSON.parse(body);
                    if(battle.myteam_arr[i][4] != "puuid"){
                        let rk = `單雙:${obj.queueMap.RANKED_SOLO_5x5.tier}(${obj.queueMap.RANKED_SOLO_5x5.division}:${obj.queueMap.RANKED_SOLO_5x5.leaguePoints})勝率:${Math.round((obj.queueMap.RANKED_SOLO_5x5.wins / (obj.queueMap.RANKED_SOLO_5x5.wins + obj.queueMap.RANKED_SOLO_5x5.losses))* 100)}% | 彈性:${obj.queueMap.RANKED_FLEX_SR.tier}(${obj.queueMap.RANKED_FLEX_SR.division}:${obj.queueMap.RANKED_FLEX_SR.leaguePoints})勝率:${Math.round((obj.queueMap.RANKED_FLEX_SR.wins / (obj.queueMap.RANKED_FLEX_SR.wins + obj.queueMap.RANKED_FLEX_SR.losses)) * 100)}%`;
                        battle.myteam_arr[i].push(rk);
                        // console.table(battle.myteam_arr);
                    }else{    
                        battle.myteam_arr[i].push("單雙牌位:無段位 / 彈性牌位:無段位");
                        // console.table(battle.myteam_arr);
                    }
                }catch (error){
                    console.error("[ERROR - champion_data] " + error);
                }
            });
        }
        for(let y = 0; y < battle.myteam_num; y++){
            request_data(y);
            if(y+1 == battle.myteam_num){
                battle.rank = true;
                // console.table(battle.myteam_arr);
            }
        }
    },
    select_champion_data_championName: function(){
        function request_data(i){
            request.get({
                url: url_prefix + `/lol-champions/v1/inventories/${battle.myteam_arr[i][1]}/champions/${battle.myteam_arr[i][2]}`,
                strictSSL: false,
                headers:{
                    'Accept': 'application/json',
                    'Authorization': client_lockfile.lockfile_token
                }
            },
            function(err, httpResponse, body){
                try {
                    let obj = JSON.parse(body);
                    if(obj.message != "Champion data does not yet exist."){
                        if(battle.myteam_arr[i][2] != 0){
                            battle.myteam_arr[i].push(obj.name);
                        }else{
                            battle.myteam_arr[i].push("尚未選角過...");
                        }
                    }else{    
                        battle.myteam_arr[i].push("Champion_data_not_exist");
                    }     
                }catch (error) {
                    console.error("[ERROR - champion_data] " + error);
                }
            });
        }
        for(let z = 0; z < battle.myteam_num; z++){
            request_data(z);
            if(z+1 == battle.myteam_num){
                battle.championName = true;
            }
        }
    },
    select_champion_data_championData: function(){
        function request_data(i){
            request.get({
                url: url_prefix + `/lol-collections/v1/inventories/${battle.myteam_arr[i][1]}/champion-mastery`,
                strictSSL: false,
                headers:{
                    'Accept': 'application/json',
                    'Authorization': client_lockfile.lockfile_token
                }
            },
            function(err, httpResponse, body){
                try {
                    let obj = JSON.parse(body);
                    if(obj.message != "0 is an invalid summonerId."){
                        if(battle.myteam_arr[i][6] != "Champion_data_not_exist"){
                            for(let xz = 0; xz < obj.length; xz++){
                                if(obj[xz].championId == battle.myteam_arr[i][2]){
                                    let xdate = new Date(obj[xz].lastPlayTime); // timestamp
                                    battle.myteam_arr[i].push(`專:${obj[xz].championLevel}`);
                                    battle.myteam_arr[i].push(`專精分數:${obj[xz].formattedChampionPoints}(${obj[xz].championPointsSinceLastLevel}/${obj[xz].championPointsUntilNextLevel})`);
                                    battle.myteam_arr[i].push(`專精碎片: ${obj[xz].tokensEarned}`);
                                    battle.myteam_arr[i].push(`拿過專精寶箱:${obj[xz].chestGranted}`);
                                    battle.myteam_arr[i].push(`歷史評分: ${obj[xz].highestGrade}`);
                                    battle.myteam_arr[i].push(`最後遊玩: ${xdate.toLocaleString()}`);
                                }
                            }
                        }else{
                            battle.myteam_arr[i].push("champion-mastery");
                        }
                    }else{    
                        battle.myteam_arr[i].push("champion-mastery");
                        // console.table(battle.myteam_arr);
                    }
                }catch (error) {
                    console.error("[ERROR - champion_data] " + error);
                }
            });
        }
        for(let xy = 0; xy < battle.myteam_num; xy++){
            request_data(xy);
            if(xy+1 == battle.myteam_num){
                battle.championData = true;
                // console.table(battle.myteam_arr);
            }
        }
    }
}

module.exports = $;