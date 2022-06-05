'use strict';
require('./global');

const {app, dialog} = require('electron');
const request = require('request');
const find = require('find-process');
const exec = require('child_process').exec;
const fs = require('fs');
const base64 = require('hi-base64');
var reInterval = require('reinterval');

const $ = {
    closeApp: function(){
        if(pid){
            process.kill(pid);
            pid = 0;
        }
        app.quit();
        process.exit(1);
    },
    showMessage: function(window, message, type, title){
        dialog.showMessageBoxSync(window, {
            message: message,
            type: type,
            title: title
        });
    },
    check_permission: function(){
        exec('NET SESSION', function(err,so,se) {
            if(se.length === 0){
                console.log("[INFO] 以管理員權限執行了!");
                ml_main.webContents.send("software_version", software_version);
                ml_main.webContents.send("admin_permission", "管理員權限");
                permission = true;
            }else{
                console.warn("[WARN] 沒有以管理員權限執行!");
                $.showMessage(ml_main,"沒有以管理員權限執行!","error", software_name + " - 請以管理員權限執行!");
                is_app_close = true;
                permission = false;
            }
        });
    },
    utc_timer: function(){
        var todayUTC = new Date(Date.now()-(new Date()).getTimezoneOffset() * 60000).toISOString().slice(0, 19).replace(/[^0-9]/g, "");
        tmp_date_time.time_HH = todayUTC.substring(8,10);
        tmp_date_time.time_MM = todayUTC.substring(10,12);
        tmp_date_time.time_SS = todayUTC.substring(12,14);
        now_time = tmp_date_time.time_HH+":"+tmp_date_time.time_MM+":"+tmp_date_time.time_SS;
        ml_main.webContents.send("now_time", now_time);
    },
    find_process: function(){
        find('name', 'LeagueClient', true).then(function (process_list) {
            if(process_list.length != 0){ // 代表有開 LOL
                if(game_is_found == false){
                    exec('wmic process where name="LeagueClient.exe" get executablepath',function (error, stdout, stderr) {
                        game_path = stdout.replace('ExecutablePath',"").trim();
                        game_dir = game_path.replace("LeagueClient.exe","");
                        if(game_dir && game_path != ""){
                            console.log('[INFO] 找到 LOL 客戶端');
                            console.log('[INFO] 找到 LOL 客戶端(Path):' + game_path);
                            console.log('[INFO] 找到 LOL 客戶端(Dir):' + game_dir + "\n");
                            ml_main.webContents.send("game_is_found", "找到 LOL 客戶端");
                            game_is_found = true;
                            $.get_lockfile();
                        }else{
                            console.log("[INFO - exec] 尚未找到 LOL 客戶端");
                            game_is_found = false;game_is_notfound = false;
                        }
                    });
                }
            }else{
                if(game_is_notfound == false){
                    console.log('[INFO] 尚未找到 LOL 客戶端' + "\n");
                    game_path = "";
                    game_dir = "";
                    ml_main.webContents.send("game_is_found", "尚未找到 LOL 客戶端");
                    game_is_found = false;game_is_notfound = true;
                    first.reschedule(5 * 1000);
                }
            }
        });
    },
    get_lockfile: function(){
        if(game_path != ""){
            fs.readFile(game_dir + '/lockfile', 'utf8', (err, data) => {
                try{
                    lockfile_tmp_str = data;
                    console.log("[INFO] "+ lockfile_tmp_str + "\n");
                    game_lockfile = lockfile_tmp_str?.split(':');
                    // lockfile 
                    lockfile.lockfile_name =  game_lockfile[0];
                    lockfile.lockfile_pid = game_lockfile[1];
                    lockfile.lockfile_port = game_lockfile[2];
                    //lockfile.lockfile_token = game_lockfile[3];
                    lockfile.lockfile_method = game_lockfile[4];
                    // Token 解密
                    var tmp_token = "riot:" + game_lockfile[3];
                    var encode_token = base64.encode(tmp_token);
                    lockfile.lockfile_token = "Basic " + encode_token
                    console.log("[INFO] Token:" + lockfile.lockfile_token);
        
                    console.log("\n",lockfile.lockfile_name,"\n",lockfile.lockfile_pid,"\n",lockfile.lockfile_port,"\n",lockfile.lockfile_token,"\n",lockfile.lockfile_method,);
                    console.log("[INFO] LOL lockfile Done!");
        
                    url_prefix = lockfile.lockfile_method + "://127.0.0.1:" + lockfile.lockfile_port;
                    console.log("[INFO] Url:" + url_prefix);
                    console.log("[INFO] LOL url Done!\n");
                    game_is_notfound = false;
                    first.reschedule(1 * 1000);
                }catch(error){
                    console.error("[ERROR - lockfile] "+err);
                    console.error("[ERROR - lockfile] "+error);
                    console.warn("[WARN - lockfile] 請確認是否有使用管理員權限執行，或是確保你的遊戲是否啟動了!" + "\n");
                    $.find_process();
                }
            });
        }
    },
    get_summoner_Info: function(){
        // 召喚師的個人資訊
        request.get({
            url: url_prefix + '/lol-chat/v1/me',
            strictSSL: false,
            headers:{
                'Accept': 'application/json',
                'Authorization': lockfile.lockfile_token
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
    },
    get_status: function(){
        request.get({
            url: url_prefix + '/lol-gameflow/v1/gameflow-phase',
            strictSSL: false,
            headers:{
                'Accept': 'application/json',
                'Authorization': lockfile.lockfile_token
            }
        },
            function(err, httpResponse, body){
                gameflow = body.replace(/[^A-Z0-9]/ig,"");
                if(gameflow == "None"){
                    ml_main.webContents.send("game_status", gameflow + " | 你目前可能在首頁或是選擇模式大廳");
                }else if(gameflow == "Lobby"){
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
                    $.post_accept();
                }else if(gameflow == "ChampSelect"){
                    if(me.lol.gameQueueType == "NORMAL"){
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
                        ml_main.webContents.send("game_status", gameflow + " | 練習工具 選擇英雄腳色中");
                    }else{
                        ml_main.webContents.send("game_status", gameflow + " | 你目前正在選擇英雄腳色中?? 這...你辦不到的!!如果可以教我拜託了!!不可能是BUG真的!!");
                    }
                }else if(gameflow == "InProgress"){
                    ml_main.webContents.send("game_status", gameflow + " | 遊玩中...");
                }else if(gameflow == "Reconnect"){
                    ml_main.webContents.send("game_status", gameflow + " | 遊戲還在進行中...請盡快連接回去!");
                    $.post_reconnect(); // 立即重連
                }else if(gameflow == "PreEndOfGame"){
                    ml_main.webContents.send("game_status", gameflow + " | 誰 Carry 這場 或是 態度佳的隊友給他一個選項吧!");
                    $.kill_game(); // 預防再次重連
                }else if(gameflow == "EndOfGame"){
                    $.kill_game(); // 預防再次重連
                    ml_main.webContents.send("game_status", gameflow + " | 遊戲結束...下一場吧");
                }
            }
        );
    },
    post_accept: function(){
        request.post({
            url: url_prefix + '/lol-matchmaking/v1/ready-check/accept',
            strictSSL: false,
            headers:{
                'Accept': 'application/json',
                'Authorization': lockfile.lockfile_token
            }
        })
    },
    post_reconnect: function(){
        request.post({
            url: url_prefix + '/lol-gameflow/v1/reconnect',
            strictSSL: false,
            headers:{
                'Accept': 'application/json',
                'Authorization': lockfile.lockfile_token
            }
        })
    },
    kill_game: function(){
        exec('taskkill  /f /im "League of Legends.exe"',function (error, stdout, stderr) {
            console.log("[INFO] 發送結束遊戲端程序完畢!");
            if(error)
              console.error("[ERROR] " + error);
        });
    }
}

var first = reInterval(function(){ // 主要時間
    // 時間 timer
    var second = setInterval(function(){ // 顯示現在時間 ml_main.webContents.send("now_time", now_time);
        if(is_app_close){
            if(second_timer_close){
                $.closeApp();
            }else{
                console.log("[INFO] 關閉顯示現在時間套件調度");
                second_timer_close = true
                clearInterval(second);
            }
        }else{
            $.utc_timer();
        }
    }, 1000);
    ml_main.webContents.send("update_time", now_time);
    /*
     * 檢查週期
     *  固定顯示現在時間 [完成]
     *  起始檢查狀態 剩下的都交給狀態處理
     */
    // 先檢查權限避免有誤(第二道措施)
    if(!permission){
        console.log("[INFO] 檢查權限中...");
        $.check_permission();
    }else{
        if(game_is_found){
            if(me.name != ""){
                $.get_summoner_Info();
                $.get_status();
            }else{
                $.get_summoner_Info();
            }
        }else{
            $.find_process();
        }
    }
}, refresh_first_timer)