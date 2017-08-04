var express = require('express');
var router = express.Router();
var request = require('request');
var _ = require('lodash');
var resource = require('../models/resource');

//微信公众号  网页授权回调
router.get("/wechat", function(req, res, next) {
    var code = req.query.code;
    var state = req.query.state;
    var url = "https://api.weixin.qq.com/sns/oauth2/access_token?appid=" + global.runtime_config.appid + "&secret=" + global.runtime_config.appsecret + "&code=" + code + "&grant_type=authorization_code";

    request(url, function(error, response, result) {
        if (!error && response.statusCode == 200) {
            var openid = JSON.parse(result).openid;
            resource.post({
                head_tran_code: "C20001",
                openid: openid,
                head_channel_code: global.runtime_config.head_channel_code,
                head_channel_code_sub: global.runtime_config.wechat_head_channel_code_sub
            }, req.session.keys).then(function(data) {
                if (data.respHead.head_rtn_code == "000000") {
                    res.render("wap/wechatCallback", {
                        userInfo: _.assign(data.respBody, {
                            state: state,
                            openid: openid
                        }),
                        error: ""
                    });
                } else if (data.respHead.head_rtn_code == "ER0182") {
                    res.render("wap/wechatCallback", {
                        userInfo: _.assign(data.respHead, {
                            state: state,
                            openid: openid
                        }),
                        error: ""
                    });
                } else {
                    res.render("wap/wechatCallback", {
                        error: data.respHead.head_rtn_desc,
                        userInfo: ""
                    });
                }
            }, function(error) {
                res.render("wap/wechatCallback", {
                    error: data.respHead.head_rtn_desc,
                    userInfo: ""
                });
            });
        } else if (error) {
            res.render("wap/wechatCallback", {
                error: error,
                userInfo: ""
            });
        }
    });
});

module.exports = router;
