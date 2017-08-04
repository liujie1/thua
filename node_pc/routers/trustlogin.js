var express = require('express');
var router = express.Router();

var configLite = require('config-lite');
var pc_request_xml = global.init_config.pc_trust_login_field_name.request_xml;
var pc_sign_msg = global.init_config.pc_trust_login_field_name.sign_msg;
var h5_request_xml = global.init_config.h5_trust_login_field_name.request_xml;
var h5_sign_msg = global.init_config.h5_trust_login_field_name.sign_msg;

var filter = require("../models/fieldFilter");

var _ = require('lodash');
var resource = require('../models/resource');

//PC信任登录
router.all(global.init_config.pc_trust_login_url, function(req, res, next) {
    req.session.user = "";
    resource.post(_.assign({
        head_tran_code: "C10003",
    }, {
        request_xml: (req.body[pc_request_xml] || req.query[pc_request_xml]) + "",
        sign_msg: (req.body[pc_sign_msg] || req.query[pc_sign_msg]) + "",
    }), req.session.keys).then(function(data) {
        if (data.respHead.head_rtn_code == "000000") {
            req.session.user = _.clone(data.respBody);
            //req.session.user.regist_custphone = req.session.user.bkact_actphone;//信任登录，银行预留手机即为客户手机号
            console.log(req.session.user);
            if (req.session.user.is_newcust == "00") {
                return res.redirect(global.base_url + '/register/trustBind');
            }
            if (req.session.user.is_settranspwd == '00') { // 判断用户是否设置交易密码 如果未设置 进入设置交易密码页面
                return res.redirect(global.base_url + '/register/setPayPwd?is_settranspwd=1');
            }
            if (req.session.user.trust_flag == "0") { //跳转基金超市
                return res.redirect(global.base_url + "/funds");
            }
            if (req.session.user.trust_flag == "1") { //跳转XX宝
                return res.redirect(global.base_url + "/bao");
            }
            return res.redirect(global.base_url + '/index');
        } else {
            res.render("error", {
                error: "信任登录失败，" + data.respHead.head_rtn_desc
            });
        }
    }, function(error) {
        res.render("error", {
            error: error
        });
    });
});

//h5信任登录
router.all(global.init_config.h5_trust_login_url, function(req, res, next) {

    // req.session.user = {
    //     sessionid: "123123",
    //     regist_custno: "123123",
    //     regist_custname: "张三",
    //     regist_custphone: "18871267051",
    //     is_bindcard: "00",
    //     is_settranspwd: "00",
    //     is_agreen: "00",
    //     grade_custrisk: "2",
    //     is_newcust: "00",
    //     bkact_actphone: "18871267051",
    //     cust_idtype: "123123",
    //     cust_idno: "420922199212280072",
    //     bkact_acctnos: [{
    //         bkact_acctno: "1231231312312213"
    //     }, {
    //         bkact_acctno: "1231231312312213"
    //     }],
    //     trust_flag: "0"
    // }
    //  res.render("wap/wapTrustLogin");

    resource.post(_.assign({
        head_tran_code: "C10003",
        head_channel_code: global.runtime_config.head_channel_code,
        head_channel_code_sub: global.runtime_config.h5_head_channel_code_sub
    }, {
        request_xml: (req.body[h5_request_xml] || req.query[h5_request_xml]) + "",
        sign_msg: (req.body[h5_sign_msg] || req.query[h5_sign_msg]) + "",
    }), req.session.keys).then(function(data) {
        if (data.respHead.head_rtn_code == "000000") {
            // req.session.user = _.clone(data.respBody);
            res.render("wap/wapTrustLogin", {
                userInfo: data.respBody,
                error: ""
            });
        } else {
            res.render("wap/wapTrustLogin", {
                error: data.respHead.head_rtn_desc,
                userInfo: ""
            });
        }
    }, function(error) {
        res.render("wap/wapTrustLogin", {
            error: data.respHead.head_rtn_desc,
            userInfo:""
        });
    });
});

module.exports = router;
