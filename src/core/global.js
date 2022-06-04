"use strict";
const electronLogger = require('electron-log');
const path = require('path');

/*
 *  全區域變數
 *
 * 
 *
 */

// electron
global.taskbar_tray = null;
global.is_app_close = false; 
global.locate = null; // Window locate
global.pid = 0; // Mjolnir League本身的 PID
global.software_version = "";
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
            width: 816,
            height: 489,
            min_width: 816,
            min_height: 489,
            max_width: 816,
            max_height: 489,
            // general
            title: software_name
        }

// core index.js
global.refresh_first_timer = 1;
global.refresh_second_timer = 1;
global.second_timer_close = false;
global.date_time = "";
global.tmp_date_time ={
    time_HH: "",
    time_MM: "",
    time_SS: "",
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

electronLogger.transports.file.resolvePath = () => path.join(main_dir, `../logger/process-${startTime}.log`);
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