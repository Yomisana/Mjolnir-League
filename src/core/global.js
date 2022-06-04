/*
 *  全區域變數
 *
 * 
 *
 */

// electron
global.taskbar_tray = null;
global.isQuiting;
global.is_app_close = false;
global.locate = null; // Window locate
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