"use strict";
require('./src/core/global');

const {version} = require("./package.json");
const set = require('./src/core/index');
const {app, BrowserWindow, ipcMain, Tray, Menu, shell , clipboard} = require('electron');
const instanceLock = app.requestSingleInstanceLock();
const electronLogger = require('electron-log');
const {autoUpdater} = require("electron-updater");
const exec = require('child_process').exec;
const fs = require('fs-extra');
const path = require('path');

// 區域宣告
let isQuiting;

const $ = { // 已完成不需要變更
    closeApp: function(){
      if(pid){
          process.kill(pid);
          pid = 0;
      }
      //app.quit(); //沒有真的退出 修復 bug
      process.exit();
    },
    taskbar: async function(win){
        let type = (process.platform == "darwin")?'png':'ico';

        taskbar_tray = new Tray(path.join(__dirname,'./src/resource/img/ml-logo.'+type));
        const contextMenu = Menu.buildFromTemplate([
          {
            icon: path.join(__dirname,'./src/resource/img/ml-logo-taskbar.png'),
            label: `Mjolnir League v.${version}`,
            enabled: false
          },
          {
            type: 'separator'
          },
          {
            label: 'Github', click: function () {
              shell.openExternal("https://github.com/yomisana");
              shell.openExternal("https://github.com/Yomisana/Mjolnir-League");
            }
          },
          {
            type: 'separator'
          },
          {
            label: 'Quit Mjolnir League', click: function () {
              $.closeApp();
            }
          }
        ]);
        //taskbar_tray.setToolTip(`Mjolnir League v.${version}`);
        taskbar_tray.setToolTip(`Mjolnir League`);
        taskbar_tray.setContextMenu(contextMenu);

        taskbar_tray.on('click', () => {
          win.show();
        });
    },
    showMessage: function(window, message, type, title){
      dialog.showMessageBoxSync(window, {
          message: message,
          type: type,
          title: title
      });
    }
}

app.whenReady().then(() => {
    locate = app.getLocale();
    software_version = `${version}`;
    // splash
    ml_splash = new BrowserWindow({
        title: splash_set.title,
        icon: window_icon,
        autoHideMenuBar: true,
        backgroundColor: window_BackgroundColor,
        width: splash_set.width, height: splash_set.height,
        minWidth: splash_set.min_width, minHeigh: splash_set.min_width,
        maxWidth: splash_set.max_width, maxHeight: splash_set.max_height,
        transparent: true,
        titleBarStyle: 'hiddenInset',
        frame: false,
        show: false,
        webPreferences:{
            devTools: false,
            fullscreenBoolean: false,
            fullscreenableBoolean: false,
            simpleFullscreenBoolean: false,
            preload: __dirname + "/preload.js"
        }
    });

    ml_splash.loadFile('src/resource/html/ml_splash.html');
    ml_splash.setMenu(null);
    ml_splash.center();

    ml_splash.once('ready-to-show', async () => {
        ml_splash.show();

        if(app.isPackaged){
            autoUpdater.checkForUpdatesAndNotify();
        }
        else{
            let starterTimer = setInterval(()=>{
              if(mainWindowReady){
                clearInterval(starterTimer);
                require('./src/core/index');
                ml_main.show();
                ml_splash.close();
              }
            },100);
        }
    });

    //主畫面
    ml_main = new BrowserWindow
    ({
        title: main_set.title,
        icon: window_icon,
        autoHideMenuBar: true,
        //resizable: false,
        width: main_set.width, height: main_set.height,
        minWidth: main_set.min_width,
        minHeight: main_set.min_height,
        //maxWidth: main_set.max_width, maxHeight: main_set.max_height,
        titleBarStyle: 'hiddenInset',
        frame: true,
        show: false,
        webPreferences: {
            devTools: false,
            fullscreenBoolean: false,
            fullscreenableBoolean: false,
            simpleFullscreenBoolean: false,
            nodeIntegration: true,
            contextIsolation: true,
            enableRemoteModule: false, // turn off remote
            preload: __dirname + "/preload.js" // use a preload script
        }
    });

    ml_main.setMenu(null);
    ml_main.loadFile('src/resource/html/ml_main.html');

    ml_main.once('ready-to-show', () => {
        console.log("[INFO] 版本: ", software_version);
        console.log(`[INFO] 主畫面渲染完畢`);
        mainWindowReady = true;
        $.taskbar(ml_main);
    });

    // 主畫面最小化時
    ml_main.on('minimize', (event) => {
        //if(pid)
        event.preventDefault();
        ml_main.hide();
    });

      // 主畫面將要關閉時
    ml_main.on('close', (event) => {
        if (!isQuiting) {
          event.preventDefault();
          ml_main.hide();
          event.returnValue = false;
        }
    });

  // ipcMain

  ipcMain.on("toMain", async (event, args) => {
    console.log('[ipcMain] ' + args + ' 事件已觸發');
    if(args == "closeapp"){
      $.closeApp();
    }else if(args == "sversion"){
      ml_main.webContents.send("software_version", software_version);
    }else if(args == "kill_lolrender"){
      exec('taskkill /f /im LeagueClientUxRender.exe',function (error, stdout, stderr) {
        //console.log(stdout);
        console.log("[INFO] 發送結束客戶端渲染畫面程序完畢!");
        if(error)
          console.error("[ERROR] " + error);
      });
    }else if(args == "Clean_log"){
      fs.readdir(path.join(log_dir), (err, files) => {
        if (err) {
          console.error("[ERROR - Clean log] "+err);
        }
        for (const file of files) {
          fs.unlink(path.join(log_dir, file), err => {
            if (err) {
              console.error("[ERROR - Ready Clean log] "+err);
            }
          });
        }
      });
    }else if(Array.isArray(args)){
      if(args[0] == "accept_checkbox"){
        if(args[1]){
          console.log("啟用自動接受");
          settings.accept_checkbox = true;
        }else{
          console.warn("禁用自動接受");
          settings.accept_checkbox = false;
        }
      }

      if(args[0] == "summoner_name_copy"){
        if(args[1]){
          console.log("複製召喚師名稱成功");
          // 複製文字
          clipboard.writeText(args[1]);
        }else{
          console.warn("複製召喚師名稱失敗...");
        }
      }

      if(args[0] == "champselect_chat_copy"){
        if(args[1]){
          console.log("複製聊天室內容成功");
          // 複製聊天室文字
          clipboard.writeText(args[1].replace(/^(\r\n|\n|\r|\t| )+/gm, ""));
        }else{
          clipboard.writeText(args[1]);
        }
      }

      if(args[0] == "setapi_refresh"){
        if(args[1]){
          console.log("變更客戶端調度頻率:" + (args[1] * 1000));
          refresh_check_path_timer.open = args[1] * 1000;
          set.refresh_time();
        }else{
          console.log("變更客戶端調度頻率: 預設...");
          refresh_check_path_timer.open = 1000;
          set.refresh_time();
        }
      }

      if(args[0] == "setfind_refresh"){
        if(args[1]){
          console.log("變更搜尋客戶端調度頻率:" + (args[1] * 1000));
          refresh_check_path_timer.close = args[1] * 1000;
          set.refresh_time();
        }else{
          console.log("變更搜尋客戶端調度頻率: 預設...");
          refresh_check_path_timer.close = 1000;
          set.refresh_time();
        }
      }
    }

    // (args[0] == "accept_checkbox"){
    //   console.log(args[]);
    //   console.log("收到前端 自動接受對戰按鈕的值囉:" + );

    // }else if(args == "Clean_log"){
    //   fs.readdir(path.join(log_dir), (err, files) => {
    //     if (err) {
    //       console.error("[ERROR - Clean log] "+err);
    //     }
    //     // DEBUG
    //     //console.log(files);
    //     //console.log(path.join(log_dir));

    //     for (const file of files) {
    //       fs.unlink(path.join(log_dir, file), err => {
    //         if (err) {
    //           console.error("[ERROR - Ready Clean log] "+err);
    //         }
    //       });
    //     }
    //   });
    // }else if(args == "kill_lolrender"){
    //   exec('taskkill /f /im LeagueClientUxRender.exe',function (error, stdout, stderr) {
    //     //console.log(stdout);
    //     console.log("[INFO] 發送結束客戶端渲染畫面程序完畢!");
    //     if(error)
    //       console.error("[ERROR] " + error);
    //   });
    // }
  });
});

// 額外設定
// 程式所有視窗確定關閉後關閉現程
// app.on('window-all-closed', () => {
//     if (process.platform !== 'darwin') {
//       $.closeApp();
//     }
// });

// 單一處理程序鎖定，有兩個以上的處理程序時，強制關閉最後開啟的那個
if(!instanceLock)
  $.closeApp();
else{
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // 如果啟動第二個處理程序，則將原先啟動的那個彈出來並聚焦
    if (ml_main) {
      if (ml_main.isMinimized()) ml_main.restore();
      ml_main.focus();
    }
  });
}

// log
if(!fs.existsSync(path.join(log_dir)))
    fs.mkdirSync(path.join(log_dir),{ recursive: true });

// autoUpdater
autoUpdater.logger = electronLogger;
autoUpdater.logger.transports.file.level = 'info';

autoUpdater.on('checking-for-update', () => {
    console.log('[INFO] Checking for update...');
    ml_splash.webContents.send('update_status','Checking for updates...');
  })

  autoUpdater.on('update-available', (info) => {
    console.log('[INFO] Update available.');
    ml_splash.webContents.send('update_status','Preparing download...');
  })

  autoUpdater.on('update-not-available', (info) => {
    console.log('[INFO] Update is latest.');
    let starterTimer = setInterval(()=>{
      if(mainWindowReady){
        clearInterval(starterTimer);
        require('./src/core/index');
        ml_main.show();
        ml_splash.close();
      }
    },100);
  })

  autoUpdater.on('error', (err) => {
    console.warn('[WARN] Error in auto-updater. ' + err);
    ml_splash.webContents.send('update_status','Update error');
    //Error in auto-updater. HttpError: 500
    var reg = RegExp(/HttpError: 500/);
    if(reg.exec(err)){
      $.showMessage(lh_splash,"Updater Error 500 - Github have some issue\n Tips: This time Update is skip.","error", software_name + " - Updater error");
    }
    //$.closeApp();
  })

  autoUpdater.on('download-progress', (progressObj) => {
    var percent = progressObj.percent.toFixed(0);
    console.log('[INFO] Download progress:' + percent + '%');
    ml_splash.webContents.send('update_status','Downloading... '+ percent + '%');
    ml_splash.webContents.send('update_percent',percent);
  })

  autoUpdater.on('update-downloaded', (info) => {
    console.log('[INFO] Restarting  Mjolnir League then Installing update.');
    ml_splash.webContents.send('update_status','Restarting Mjolnir League Installing update...');
  });

  // 更新檔下載完畢後 過 x 秒 關閉軟體更新後重啟軟體
  autoUpdater.on('update-downloaded', (ev, info) => {
    setTimeout(function() {
        $.closeApp();
        autoUpdater.quitAndInstall();
    }, 3000)
  })