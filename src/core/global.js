"use strict";
const electronLogger = require('electron-log');
const path = require('path');

/*
 *  全區域變數
 */

// electron
global.permission = false;
global.taskbar_tray = null; // Windows tray
global.locate = null; // Window locate
global.pid = 0; // Mjolnir League本身的 PID
global.software_version = ""; // Auto
global.software_name = "Mjolnir League"
global.main_dir = process.env.APPDATA + '\\.Mjolnir-League\\bin';
global.log_dir = process.env.APPDATA + '\\.Mjolnir-League\\logger';
    // window
    global.mainWindowReady = false; // 主視窗是否渲染完畢?
    global.window_BackgroundColor = '#2e2c29';
    global.window_icon = './src/resource/img/ml-logo.ico';
    global.ml_splash = null;
        global.splash_set = {
            width: 340,
            height: 100,
            min_width: 340,
            min_height: 100,
            max_width: 340,
            max_height: 100,
            // general
            title: software_name + " Loading"
        }
    global.ml_main = null;
        global.main_set = {
            // 800 525 600
            width: 816, // 816
            height: 639, // 489
            min_width: 816,
            min_height: 639,
            // general
            title: software_name
        }
    // software setting
    global.settings = {
        accept_checkbox: false
    }
// game setting
global.refresh_check_path_timer = { // check lol client path timer
    open: 1000,
    close: 5000,
} 
    // client found?
    global.client_is_found = false; // main
    global.client_is_notfound = false;
    // game  found?
    global.game_is_found = false; // main
    global.game_is_notfound = false;
    // client path
    global.client_path = null; // ..LeagueClient\LeagueClient.exe
    global.client_dir = null; // ..LeagueClient\
    // client api
    global.is_lockfile_get = false;
    global.lockfile_str = null;
    global.lockfile = null;
    global.client_lockfile = {
        lockfile_name: null,
        lockfile_pid: null,
        lockfile_port: null,
        lockfile_token: "",
        lockfile_method: null,
    }
    global.url_prefix = null;
    // summoner data
    global.me = {
        summoner_status: null, // availability: online:chat | afk:away | Matchmaking: dnd"
        summoner_icon: 0,
        id: null,
        lol:{
            /*
             * outOfGame: None | 你目前可能在首頁或是選擇模式大廳
             * 對戰名稱:
             * 召喚峽谷:
             * NORMAL: 一般盲選
             * RANKED_SOLO_5x5: 單雙積分
             * RANKED_FLEX_SR: 彈性積分
             * NONE: 自訂
             * 咆嘯深淵:
             * ARAM_UNRANKED_5x5: 一般隨機單中
             *
             * 聯盟戰旗:
             * NORMAL_TFT: 一般戰旗
             * RANKED_TFT: 積分戰旗
             * RANKED_TFT_TURBO: 超級抽抽樂戰旗
             * RANKED_TFT_PAIRS: 雙人搭檔工作房 更新名稱:RANKED_TFT_DOUBLE_UP 
             *
             * 阿福:
             * URF: 阿福快打
             *
             * 玩家打電腦
             * BOT: 玩家打電腦
             * PRACTICETOOL: 練習工具
             */
            gameQueueType: "",
            level: "",
            masteryScore: "",
            timeStamp: "",
        },
        name: "",
        pid: null,
        platformId: null,
        puuid: null,
        statusMessage: null,
        summonerId: null,
    }
    /*
     * None
     * Lobby
     * Matchmaking
     * ReadyCheck
     * ChampSelect
     * InProgress
     * Reconnect
     * PreEndOfGame
     * EndOfGame
     * 
     */
    //ml_main.webContents.send("client_is_found", "尚未找到 LOL 客戶端")
    global.client_status = ["尋找LOL客戶端中...","找到 LOL 客戶端"];
    global.gameflow = null;
    global.gameflow_ReadyCheck = false;
    global.gameflow_ChampSelect = false;
    global.wallet = {
        ip: 0, // 藍粉(ip)
        rp: 0  // 聯盟幣(rp)
    }
    global.summoner_info = {
        xpSinceLastLevel: 0, // 當前經驗值
        xpUntilNextLevel: 0, // 升級的經驗值
    }
    global.champselect = {
        histroy_msgid: null,
        msg_id: null,
        // msg array
        chat_id: 0, // 給自己檢查用的
        chat_msg: [],
        chat_msg_timestamp: [],
        chat_msg_summoner: [],
        chat_body: []
    }
    global.battle = {
        session: false, // 是否抓到session資料了?
        displayname: false, // 是否抓到 召喚師顯示名稱
        rank: false, // 是否抓到召喚師積分資料了?
        championName: false,
        championData: false,
        myteam_num: 0, // 我方玩家數量
        myteam_arr: [], // 原始資料(未處理過的)
    }


// Logger
global.nowtimes = function(flags){
    let date = new Date();

    let year = date.getFullYear();
    let month = (date.getMonth() < 10)?'0'+date.getMonth():date.getMonth();
    let day = (date.getDay() < 10)?'0'+date.getDay():date.getDay();

    let hour = (date.getHours() < 10)?'0'+date.getHours():date.getHours();
    let minute = (date.getMinutes() < 10)?'0'+date.getMinutes():date.getMinutes();
    let second = (date.getSeconds() < 10)?'0'+date.getSeconds():date.getSeconds();

    let formatDate = `[${year}-${month}-${day} ${hour}:${minute}:${second}] `;

    return (flags)?new Date().getTime():formatDate;
}

const startTime = nowtimes(true);

electronLogger.transports.file.resolvePath = () => path.join(log_dir, `/process-${startTime}.log`);
global.console.log = function(...raw) {
    let ex = new Error().stack.split('\n')[2].trim().split(' ');
    let out = path.parse(ex[ex.length-1].replace('(','').replace(')',''));
    electronLogger.transports.console.format = '{h}:{i}:{s}.{ms} ('+out.base+') > {text}';

    electronLogger.info(raw.join(" "));
};
global.console.warn = function(...raw) {
    let ex = new Error().stack.split('\n')[2].trim().split(' ');
    let out = path.parse(ex[ex.length-1].replace('(','').replace(')',''));
    electronLogger.transports.console.format = '{h}:{i}:{s}.{ms} ('+out.base+') > {text}';

    electronLogger.warn(raw.join(" "));
};
global.console.error = function(...raw) {
    let ex = new Error().stack.split('\n')[2].trim().split(' ');
    let out = path.parse(ex[ex.length-1].replace('(','').replace(')',''));
    electronLogger.transports.console.format = '{h}:{i}:{s}.{ms} ('+out.base+') > {text}';

    electronLogger.error(raw.join(" "));
};