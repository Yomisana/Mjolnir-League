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
                        $.clear_select_champion_msg();// chat page reset
                        ml_main.webContents.send("game_status", gameflow + " | 你目前可能在首頁或是選擇模式大廳");
                    }else if(gameflow == "Lobby"){
                        gameflow_ReadyCheck = false;
                        gameflow_ChampSelect = false;

                        $.clear_select_champion_msg();// chat page reset
                        
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
                        
                        $.clear_select_champion_msg();// chat page reset

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
                    }else if(gameflow == "ChampSelect"){
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
                        
                        $.clear_select_champion_msg();// chat page reset
                        
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
                    var wallet_str = JSON.parse(body);
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
                    var summoner_info_str = JSON.parse(body);
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
    select_champion_data: function(){
        request.get({
            // 我看 legacy 好像都不能用所以就沒有 測 legacy
            // 所有英雄 id 1,2,3,4,5,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,40,41,43,44,45,48,50,51,53,54,55,56,58,59,60,63,67,74,75,76,77,78,80,81,82,83,84,85,86,89,91,92,99,101,102,103,104,106,110,117,120,121,122,126,131,134,143,145,157,166,201,202,203,222,223,235,238,240,245,246,254,267,268,350,360,412,420,427,432,498,523,526,555,711,876,887,888
            // /lol-champ-select/v1/all-grid-champions //  列出所有單一角色的資料
            // /lol-champ-select/v1/grid-champions/16 //  列出單一角色的資料
            // /lol-champ-select/v1/bannable-champion-ids // 可以被banned 的角色 也就是官方上架的所有角色都可以banned
            // /lol-champ-select/v1/pickable-champion-ids // 可以被pick   的角色 也就是官方上架的所有角色都可以pick
            // /lol-champ-select/v1/current-champion // 鎖定後才會知道你鎖哪一隻角色 你所鎖定的英雄 id
            // /lol-champ-select/v1/disabled-champion-ids // 已經被停用的角色(完全看不到此角色在選角畫面上) 也就是被官方下架的角色
            // /lol-champ-select/v1/pickable-skin-ids // 感覺沒啥用 :P [11009,11011,22023,86024,21003,117005,117004,21006,117006,21007,106003,106002,267024,106004,117015,106006,21015,11033,74015,10015,223011,84005,21031,84006,21034,21035,9004,21036,21037,21038,21039,245036,126003,350001,83001,19001,19003,19004,19005,19006,19007,19008,84032,19010,51010,104005,360001,51013,8005,40006,350019,254020,19016,157003,126024,19018,157001,222029,254029,19023,19025,18002,18003,51028,222037,103001,104025,157017,104035,412005,104036,28008,17002,145001,17004,81005,157036,92018,145014,134007,92020,38005,134005,91001,59002,91003,27002,145016,81018,145017,81020,59007,145026,80001,16001,27009,16002,80005,16005,16007,16009,134025,5004,5005,37005,92044,16015,16016,26001,26002,58003,26003,58006,15001,58009,15003,15004,143007,143005,15009,58017,4004,36008,25001,121002,5036,25004,89004,25010,143025,25011,89010,78005,89012,67001,238011,3002,99003,99002,99005,3004,3005,99008,110016,120004,99015,77003,13005,24013,25039,45007,13010,2002,2003,67032,55004,44001,268005,76003,76002,76004,76007,76006,12007,1005,55021,1008,86001,246002,86003,246001,1012,1013,22005,54005,22006,75001,75003,427002,12029,11005,523001,1022]
            // /lol-champ-select/v1/session

            // 僅在 盲選 、 積分(單雙/彈性) 、 自訂 與 訓練顯示
            url: url_prefix + '/lol-champ-select/v1/session',
            strictSSL: false,
            headers:{
                'Accept': 'application/json',
                'Authorization': client_lockfile.lockfile_token
            }
        },
            function(err, httpResponse, body){
                try{
                    var data = JSON.parse(body);
                    /*
                        先從 查看 data.actions 有多少個再來推估(以actions為基準)
                        取的召喚師人數後 再來把各個 actions 召喚師的id 對應到 myTeam or theirTeam 尋找各個召喚師的 data 資料
                        但這裡沿生出一個問題是 你還要做判斷是去處理 所以這個是行不通的 除非反向搜尋

                        從 myTeam or theirTeam 反向搜索 actions...
                        那為什麼 直接拿到 myTeam or theirTeam 的各個召喚師資料我還要 反向搜索 actions ? 因為我們需要 actions 上的 completed(已鎖角這個判斷值) 、 isInProgress(意旨的是 配符文那個階段 就要準備啟動遊戲端了 所以來判斷你是否還在客戶端上 這個沒啥關聯 :P) 
                     */
                    //console.log(data);


                    battle.players_num = data.actions[0].length; // 對戰上召喚師數量
                    battle.myteam_num = data.myTeam.length; // 我方召喚師數量
                    battle.enemyteam_num = data.theirTeam.length; // 敵方召喚師數量

                    console.log(`對戰玩家人數(對戰召喚師人數): ${battle.players_num}`);
                    console.log(`我方召喚師數量:${battle.myteam_num}`);
                    console.log(`敵方召喚師數量:${battle.enemyteam_num}`);
                    // 二維陣列(actions)
                    for(var i = 0; i<battle.players_num; i++){
                        battle.cell_id.push(data.actions[0][i].actorCellId);
                        console.log(`cellID(actions):${battle.cell_id[i]}`);
                    }
                    // battle.cell_id.push(data.actions[0][battle.players_num].actorCellId);
                    // console.log(`cellID(actions):${data.actions[0][battle.players_num].actorCellId}`);
                    
                    //console.log("[DEBUG - champion_data] " + data);
                    // battle.player_count = data.actions[0].length;
                    // console.log("加入對戰召喚師數量：" + battle.player_count);
                    // console.log("選擇角色資訊:");
                    // for(var i = 0; i < battle.player_count; i++){
                    //     // Unit

                    //     console.log(`第${i+1}位召喚師`);
                    //     console.log("actions:");
                    //     console.log("   資料對應ID:" + data.actions[0][i].actorCellId);
                    //     //console.log("   Global 資料對應ID:" + battle.actions.actions.actorCellId[i]);
                    //     console.log("   已選取選定的角色(id): " + data.actions[0][i].championId);
                    //     console.log("   已鎖定角色?: " + data.actions[0][i].completed);
                    //     console.log("   在Acrions第幾個資料: " + data.actions[0][i].id);
                    //     console.log("   是盟友行動(已知 Bot:false): " + data.actions[0][i].isAllyAction);
                    //     console.log("   是否還在客戶端上(目前知道鎖角後就會變成 false 但也有可能是所有人鎖角後才會變 false): " + data.actions[0][i].isInProgress);
                    //     console.log("   pickTurn(未知作用): " + data.actions[0][i].pickTurn);
                    //     console.log("   type(未知作用): " + data.actions[0][i].type);
                    // }
                    // console.log("actions:");
                    // console.log("   資料對應ID:" + data.actions[0][0].actorCellId);
                    // console.log("   已選取選定的角色(id): " + data.actions[0][0].championId);
                    // console.log("   已鎖定角色?: " + data.actions[0][0].completed);
                    // console.log("   在Acrions第幾個資料: " + data.actions[0][0].id);
                    // console.log("   是盟友行動(已知 Bot:false): " + data.actions[0][0].isAllyAction);
                    // console.log("   是否還在客戶端上(目前知道鎖角後就會變成 false 但也有可能是所有人鎖角後才會變 false): " + data.actions[0][0].isInProgress);
                    // console.log("   pickTurn(未知作用): " + data.actions[0][0].pickTurn);
                    // console.log("   type(未知作用): " + data.actions[0][0].type);




                    //const actions = select_champion_data.actions[0];
                    // console.log("選擇角色資訊:");
                    // console.log("actions:");
                    // console.log("   actorCellId:" + actions[0].actorCellId);
                    // console.log("   已選取選定的角色(id): " + actions[0].championId);
                    // console.log("   已鎖定角色?: " + actions[0].completed);
                    // console.log("   選擇召喚師當前順位(猜測中...): " + actions[0].id);
                    // console.log("   是盟友行動(猜測中...): " + actions[0].isAllyAction);
                    // console.log("   是否還在客戶端上(目前知道鎖角後就會變成 false 但也有可能是所有人鎖角後才會變 false): " + actions[0].isInProgress);
                    // console.log("   pickTurn: " + actions[0].pickTurn);
                    // console.log("   type: " + actions[0].type);
                    // summoner_info.xpSinceLastLevel = summoner_info_str.xpSinceLastLevel;
                    // summoner_info.xpUntilNextLevel = summoner_info_str.xpUntilNextLevel;
                    // ml_main.webContents.send("summoner_level", me.lol.level + `(${summoner_info.xpSinceLastLevel} / ${summoner_info.xpUntilNextLevel})`);
                }catch (error){
                    console.error("[ERROR - champion_data] " + error);
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
                    var obj = JSON.parse(body);
                    for(let data of obj){
                        if(data.type == "championSelect"){
                            if(data.lastMessage == null){
                            }else{
                                champselect.msg_id = data.lastMessage.id; // 先把最新的ID 丟到 Global 紀錄
                                if(champselect.msg_id != champselect.histroy_msgid){
                                    //console.log(`聊天室第 ${champselect.chat_id+1} 個訊息`);

                                    //console.log("API所取得的聊天室訊息: " + data.lastMessage.body); // msg
                                    champselect.chat_msg.push(data.lastMessage.body);

                                    var date = new Date(data.lastMessage.timestamp); // timestamp
                                    champselect.chat_msg_timestamp.push(date.toLocaleString());

                                    champselect.histroy_msgid = champselect.msg_id;
                                    ///console.log("陣列訊息內容量: " + champselect.chat_msg.length);
                                    //console.log("陣列訊息時間量: " + champselect.chat_msg_timestamp.length);

                                    champselect.chat_body.push(`[${champselect.chat_msg_timestamp[champselect.chat_id]}] ${champselect.chat_msg[champselect.chat_id]}`);
                                    console.log("[INFO - select champ chat room msg]" + champselect.chat_body[champselect.chat_id]);
                                    //ml_main.webContents.send("champselect_chat", champselect.chat_body); // 改到 index 
                                    champselect.chat_id = champselect.chat_id + 1 ;
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
    clear_select_champion_msg: function(){
        // chat page reset
        champselect.histroy_msgid = null;champselect.msg_id = null;
        champselect.chat_id = 0;champselect.chat_msg = [];
        champselect.chat_msg_timestamp = [];champselect.chat_body = [];
        ml_main.webContents.send("champselect_chat", '');
    },
    get_other_summoner_name: function(){

    }
}

module.exports = $;