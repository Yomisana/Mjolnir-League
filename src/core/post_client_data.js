'use strict';
require('./global');

const request = require('request');

const $ = {
    matchmaking_accept: function(){
        console.log("[INFO - Auto Accept] 發送允許對戰");
        request.post({
            url: url_prefix + '/lol-matchmaking/v1/ready-check/accept',
            strictSSL: false,
            headers:{
                'Accept': 'application/json',
                'Authorization': client_lockfile.lockfile_token
            }
        })
    }
};