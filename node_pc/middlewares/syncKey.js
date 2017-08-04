var express = require('express');
var router = express.Router();

var resource = require('../models/resource');

//拦截请求 
router.all("/*", function(req, res, next) {
    // if (!global.uuid || !global.baseKey) {
    //     global.uuid = new Date().getTime() + Math.round(Math.random() + 10000);
    //     resource.syncKey().then(function() {
    //         next();
    //     });
    // } else if (global.aesKey && global.hmd5Key) {
    //     resource.getWorkKey(global.aesKey).then(function() {
    //         next();
    //     });
    // } else {
    //     next(); 
    // }

    req.session.keys = req.session.keys ? req.session.keys : {};

    //生成标识 获取工主密钥
    if (!req.session.keys.generate_id) {
        var generate_id = global.runtime_config.head_channel_code + new Date().getTime() * Math.round(Math.random() + 10000);
        console.log("生成generate_id", generate_id);
        req.session.keys.generate_id = generate_id;
    }
    //获取sessionid
    if (req.session.user) {
        req.session.keys.sessionid = req.session.user.sessionid;
    }
    //todo:生成工主密钥
    next();
});

module.exports = router;
