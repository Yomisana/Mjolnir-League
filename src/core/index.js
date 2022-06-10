'use strict';
require('./global');
require('./permission'); // check permission has use admin run?
const check = require('./client');
const get = require('./get_client_data');
const post = require('./post_client_data');

var reInterval = require('reinterval');

var check_timer = reInterval(function(){
    if(client_is_found){
        if(is_lockfile_get){
            get.summoner_data();
            get.wallet();
            get.summoner_info();
            if(me.id != ""){
                get.gameflow();
                if(gameflow_ReadyCheck){
                    post.matchmaking_accept();
                }
            }
        }
    }else{
        //console.log("檢查客戶端是否啟動中...")
        check.is_lol_client_open(); // client
    }
}, 1000) // default timer is not change de
