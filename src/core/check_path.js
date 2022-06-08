'use strict';
require('./global');

const find = require('find-process');
const exec = require('child_process').exec;
var reInterval = require('reinterval');

const fs = require('fs');
const base64 = require('hi-base64');

const $ = {
    is_lol_client_open: function(){
        find('name', 'LeagueClient', true).then(function (process_list) {
            if(process_list.length != 0){ // 代表有開 LOL
                if(client_is_found == false){
                    exec('wmic process where name="LeagueClient.exe" get executablepath',function (error, stdout, stderr) {
                        client_path = stdout.replace('ExecutablePath',"").trim();
                        client_dir = client_path.replace("LeagueClient.exe","");
                        if(client_dir && client_path != ""){
                            console.log('[INFO] 找到 LOL 客戶端');
                            console.log('[INFO] 找到 LOL 客戶端(Path):' + client_path);
                            console.log('[INFO] 找到 LOL 客戶端(Dir):' + client_dir + "\n");
                            ml_main.webContents.send("game_is_found", "找到 LOL 客戶端");
                            client_is_found = true;
                            check_timer.reschedule(refresh_check_path_timer.open * 1000);
                            //require('./get_lockfile');

                            fs.readFile(client_dir + '/lockfile', 'utf8', (err, data) => {
                                try{
                                    lockfile_str = data;
                                    console.log("[INFO] "+ lockfile_str + "\n");
                                    lockfile = lockfile_str?.split(':');
                                    // lockfile 
                                    client_lockfile.lockfile_name =  lockfile[0];
                                    client_lockfile.lockfile_pid = lockfile[1];
                                    client_lockfile.lockfile_port = lockfile[2];
                                    //lockfile.lockfile_token = lockfile[3];
                                    client_lockfile.lockfile_method = lockfile[4];
                                    // Token 解密
                                    var tmp_token = "riot:" + lockfile[3];
                                    var encode_token = base64.encode(tmp_token);
                                    client_lockfile.lockfile_token = "Basic " + encode_token
                                    console.log("[INFO] Token:" + client_lockfile.lockfile_token);
                        
                                    console.log("\n",client_lockfile.lockfile_name,"\n",client_lockfile.lockfile_pid,"\n",client_lockfile.lockfile_port,"\n",client_lockfile.lockfile_token,"\n",client_lockfile.lockfile_method,);
                                    console.log("[INFO] LOL lockfile Done!");
                        
                                    url_prefix = client_lockfile.lockfile_method + "://127.0.0.1:" + client_lockfile.lockfile_port;
                                    console.log("[INFO] Url:" + url_prefix);
                                    console.log("[INFO] LOL url Done!\n");
                                    game_is_notfound = false; is_lockfile_get = true;
                                }catch(error){
                                    is_lockfile_get = false;
                                    console.error("[ERROR - lockfile] "+err);
                                    console.error("[ERROR - lockfile] "+error);
                                    console.warn("[WARN - lockfile] 請確認是否有使用管理員權限執行，或是確保你的遊戲是否啟動了!" + "\n");
                                    $.is_lol_client_open();
                                }
                            });
                        }else{
                            console.log("[INFO - exec] 尚未找到 LOL 客戶端");
                            client_is_found = false;client_is_notfound = false;is_lockfile_get = false;
                        }
                    });
                }
            }else{
                if(client_is_notfound == false){
                    console.log('[INFO] 尚未找到 LOL 客戶端' + "\n");
                    ml_main.webContents.send("game_is_found", "尚未找到 LOL 客戶端");
                    // summoner
                    ml_main.webContents.send("summoner_name", "Waiting...");
                    ml_main.webContents.send("summoner_level", "Waiting...");
                    ml_main.webContents.send("summoner_status", "Waiting...");
                    ml_main.webContents.send("summoner_status_message", "Waiting...");
                    ml_main.webContents.send("summoner_masteryScore", "Waiting...");
                    ml_main.webContents.send("summoner_region", "Waiting...");
                    // game status
                    ml_main.webContents.send("game_status", "Waiting...");
                    client_is_found = false;client_is_notfound = true;is_lockfile_get = false;
                    check_timer.reschedule(refresh_check_path_timer.close * 1000)
                    console.log("[INFO] Clean Data");
                    client_path = null;
                    client_dir = null
                    lockfile_str = null;
                    client_lockfile.lockfile_name = null;
                    client_lockfile.lockfile_pid = null;
                    client_lockfile.lockfile_port = null;
                    client_lockfile.lockfile_token = "";
                    client_lockfile.lockfile_method = null;
                    url_prefix = null;
                    console.log("[INFO] Clean Data Done!");
                }
            }
        });        
    },
    /*
    is_game_running: function(){
        find('name', 'League of Legends', true).then(function (process_list) {
            console.log("我有偷跑");
            if(process_list.length != 0){ // 代表有開 LOL
                if(!game_is_found){
                    console.log("[INFO] 遊戲端有開著!");
                    game_is_found = true;game_is_notfound = false;
                }
            }else{
                if(!game_is_notfound){
                    console.log("[INFO] 遊戲端沒開著!");
                    game_is_found = false;game_is_notfound = true;
                }
            }
        });
    }*/
}

var check_timer = reInterval(function(){
    if(client_is_found){
        if(is_lockfile_get){
            require('./get_summoner_Info');
        }
    }else{
        $.is_lol_client_open(); // client
    }
}, 1000) // default timer is not change default timer is dynamic

//console.log("我有偷跑");