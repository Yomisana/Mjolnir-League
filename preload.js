"use strict";
const { contextBridge,ipcRenderer } = require("electron");


// 要發送渲染端的 js => preload => src\resource\plugin\render => ml_main
// 要接收渲染端的 ml_main => preload => src\core\index => 要處理的 js
contextBridge.exposeInMainWorld(
    "api", {
        // 後端傳送值所屬的頻道 (由前端瀏覽器傳送) - (渲染端 => 主程序)
        send: (channel, data) => {
            let validChannels = ["toMain"];
            if (validChannels.includes(channel)) {
                ipcRenderer.send(channel, data);
            }
        },
        // 前端接收值所屬的頻道(主程序 => 渲染端)
        receive: (channel, func) => {
            let validChannels = [
                "update_percent",
                "update_status",
                "software_version",
                // program
                "now_time",
                "update_time",
                "client_is_found",
                // summoner
                "summoner_name",
                "summoner_level",
                "summoner_masteryScore",
                "summoner_region",
                "summoner_status",
                "summoner_status_message",
                // game
                "game_status",
                "summoner_wallet_ip",
                "summoner_wallet_rp",
                "champselect_chat",
                "refresh_time",
                "api_refresh",
                "find_refresh",
            ];
            if (validChannels.includes(channel)) {
                // Deliberately strip event as it includes `sender` 
                ipcRenderer.on(channel, (event, ...args) => func(...args));
            }
        }
    }
);