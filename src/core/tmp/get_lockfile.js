'use strict';
require('./global');
const fs = require('fs');
const base64 = require('hi-base64');

if(client_path != ""){
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
            game_is_notfound = false;
            require('./get_summoner_Info');
        }catch(error){
            console.error("[ERROR - lockfile] "+err);
            console.error("[ERROR - lockfile] "+error);
            console.warn("[WARN - lockfile] 請確認是否有使用管理員權限執行，或是確保你的遊戲是否啟動了!" + "\n");
            require('./check_path')
        }
    });
}