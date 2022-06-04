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
                $.showMessage(lh_main,"沒有以管理員權限執行!","error","League Helper - 請以管理員權限執行!");
                is_app_close = true;
                permission = false;
            }
        });
    },
    utc_timer: function(){
        var todayUTC = new Date(Date.now()-(new Date()).getTimezoneOffset() * 60000).toISOString().slice(0, 19).replace(/[^0-9]/g, "");
        //console.log(todayUTC);
        tmp_date_time.time_HH = todayUTC.substring(8,10);
        tmp_date_time.time_MM = todayUTC.substring(10,12);
        tmp_date_time.time_SS = todayUTC.substring(12,14);
        date_time = tmp_date_time.time_HH+":"+tmp_date_time.time_MM+":"+tmp_date_time.time_SS;
        ml_main.webContents.send("now_date_time", date_time);
        
    },
}

var first = reInterval(function(){ // 主要時間
    var second = setInterval(function(){ // 顯示現在時間
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
    }, refresh_second_timer * 1000);
}, refresh_first_timer * 1000)