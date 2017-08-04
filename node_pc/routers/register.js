var express = require('express');
var _ = require('lodash');
var router = express.Router();

var resource = require('../models/resource');

var checkLogin = require('../middlewares/check').checkLogin;

var checkBindCard = require('../middlewares/check').checkBindCard;

//注册
router.get("/", function(req, res, next) {
    res.render('register/register');
});
//注册
router.post("/", function(req, res, next) {
    var params = req.body;
    var requsetParams = {
        head_tran_code: "C10001",
        regist_custphone: params.mobile, //注册手机号
        smslog_vercode: params.verification_code, //注册手机号验证码
        smslog_serno: params.smslog_serno, //短信验证序列号
        regist_custlogpwd: params.loginLastPwd, //账号密码
        captcha: params.captcha, //图形验证码
        captcha_serno: params.captcha_serno, //图形验证码序列号
        is_agreeprotocol: params.is_agreeprotocol, //服务协议
        random_uuid: req.body.random_uuid,
    };
    resource.post(requsetParams, req.session.keys).then(function(data) {
        if (data.respHead.head_rtn_code == "000000") {
            req.session.user = _.assign({regist_custphone: params.mobile}, _.clone(data.respBody));
            res.redirect(global.base_url + "/register/bindCard");
            // 注册成功后发起登录请求
            // loginAction(requsetParams);
        } else {
            req.flash('errorMsg', {
                message: data.respHead.head_rtn_desc
            });
            req.flash("fields", params);
            return res.redirect('back');
        }
    }, function(error) {
        res.render("error", { error: error });
    });

    // 登录action
    /*
    function loginAction(loginParams) {
        var requsetParams = {
            head_tran_code: "C10002",
            custlogname: loginParams.regist_custphone, // 登录帐号
            regist_custlogpwd: loginParams.regist_custlogpwd, // 登录密码
            captcha: loginParams.captcha, // 验证码
            captcha_serno: loginParams.captcha_serno // 验证码序列号
        };
        resource.post(requsetParams).then(function (data) {
            if (data.respHead.head_rtn_code == "000000") {
                req.session.user = _.clone(data.respBody);
                res.redirect("global.base_url + /register/bindCard");
            } else {
                res.render("error", {error: data.respHead.head_rtn_desc});
            }
        }, function (error) {
            res.render("error", {error: error});
        });
    }
    */
});

//2.绑定银行卡
router.get("/bindCard", checkLogin, function(req, res, nex) {
    resource.post({
        head_tran_code: "S40003"
    }, req.session.keys).then(function(data) {
        if (data.respHead.head_rtn_code == "000000") {
          if (data.respBody.list.length > 0 && _.isObject(data.respBody.list[0])) {
            res.render('register/bindCard', {
                is_bindcard: req.query.is_bindcard == '01',
                regist_custphone: req.session.user.regist_custphone,
                bkinfo: data.respBody.list
            });
          } else {
            res.render("error", {
                error: "S40003银行列表为空"
            });
          }

        } else {
            res.render("error", { error: data.respHead.head_rtn_desc });
        }
    }, function(error) {
        if (error == 401) {
            req.session.user = null;
            // 登出成功后跳转到主页
            return res.redirect(global.base_url + '/index');
        }
        res.render("error", { error: error });
    })


});
router.post("/bindCard", checkLogin, function(req, res, next) {
    // todo:这里参数少一些（行号）
    // 页面请求的参数
    var params = req.body;
    // 发送接口请求的参数
    var requsetParams = {
        head_tran_code: "A20001",
        regist_custno: req.session.user.regist_custno,
        regist_custname: params.cust_name, //客户姓名
        bkinfo_code: params.bkinfo_code, //银行卡行号
        bkact_actphone: params.mobile, //银行预留手机号
        bkact_acctno: params.card_no, //银行卡号
        cust_idno: params.id_code, //身份证号
        cust_idtype: '00', //证件类型
        cactlog_newmode: params.cactlog_newmode, //默认快捷
        smslog_vercode: params.verification_code, //短信验证码
        smslog_serno: params.smslog_serno, //短信验证序列号
        province: params.province, // 省
        city: params.city, // 市
        address: params.address, // 详细地址
        is_agreeprotocol: params.is_agreeprotocol // 详细地址
    };
    if (params.cactlog_newmode == "00") { //网银签约
        requsetParams.reqs_url = global.runtime_config.bank_card.bindCardCallBackUrl;
    }
    resource.post(requsetParams, req.session.keys).then(function(data) {
        if (data.respHead.head_rtn_code == "000000") {
            req.session.user.regist_custname = params.cust_name;
            if (params.cactlog_newmode == "00") {
                res.render("bankCard/EbankCallback", {
                    request_data: data.respBody.request_data,
                    wts_url: data.respBody.wts_url
                })
            } else {
                // req.session.user.regist_custname = params.cust_name;
                req.session.user.is_bindcard = "01"; //绑定成功 更新本地数据
                res.redirect(global.base_url + "/register/setPayPwd");
            }
        } else { //错误处理
            req.flash('errorMsg', {
                message: data.respHead.head_rtn_desc
            });
            req.flash("fields", params);
            return res.redirect('back');
        }
    }, function(error) {
        if (error == 401) {
            req.session.user = null;
            // 登出成功后跳转到主页
            return res.redirect(global.base_url + '/index');
        }
        res.render("error", { error: error });
    })
});


//信任登录绑定银行卡
router.get("/trustBind", checkLogin,  function(req, res, next) {
    resource.post({
        head_tran_code: "S40003"
    }, req.session.keys).then(function(data) {
        if (data.respHead.head_rtn_code == "000000") {
            if(data.respBody.list.length > 0 && _.isObject(data.respBody.list[0])){
              res.render('bankCard/bankCard', {
                  is_bindcard: req.query.is_bindcard == '01',
                  bkinfo: data.respBody.list
              });
            } else {
              res.render("error", { error: "S40003查询卡列表为空" });
            }
        } else {
            res.render("error", { error: data.respHead.head_rtn_desc });
        }
    }, function(error) {
        if (error == 401) {
            req.session.user = null;
            // 登出成功后跳转到主页
            return res.redirect('/index');
        }
        res.render("error", { error: error });
    })
});
//信任登录绑定银行卡
router.post("/trustBind", checkLogin,  function(req, res, next) {
    var params = req.body;
    // 发送接口请求的参数
    console.log(params);
    var requsetParams = {
        head_tran_code: "A20001",
        regist_custno: req.session.user.regist_custno,
        regist_custname: params.cust_name, //客户姓名
        bkinfo_code: params.bkinfo_code, //银行卡行号
        bkact_actphone: params.mobile, //银行预留手机号
        bkact_acctno: params.bkact_acctno, //银行卡号
        cust_idno: params.id_code, //身份证号
        cust_idtype: params.cust_idtype, //证件类型
        cactlog_newmode: params.cactlog_newmode, //默认快捷
        smslog_vercode: params.verification_code, //短信验证码
        smslog_serno: params.smslog_serno //短信验证序列号
    };
    if (requsetParams.cactlog_newmode == "00") { //网银签约
        requsetParams.reqs_url = global.runtime_config.bank_card.bindCardCallBackUrl;
    }
    resource.post(requsetParams, req.session.keys).then(function(data) {
        if (data.respHead.head_rtn_code == "000000") {
            req.session.user.regist_custname = params.cust_name;
            if (requsetParams.cactlog_newmode == "00") {
                res.render("bankCard/EbankCallback", {
                    request_data: data.respBody.request_data,
                    wts_url: data.respBody.wts_url
                })
            } else {
                req.session.user.is_bindcard = "01"; //绑定成功 更新本地数据
                res.redirect(global.base_url + "/register/setPayPwd");
            }
            //req.session.user.regist_custname = params.cust_name;
            //req.session.user.is_bindcard = "01"; //绑定成功 更新本地数据
            //res.redirect(global.base_url + "/register/setPayPwd");
        } else { //错误处理
            req.flash('errorMsg', {
                message: data.respHead.head_rtn_desc
            });
            req.flash("fields", params);
            return res.redirect('back');
        }
    }, function(error) {
        if (error == 401) {
            req.session.user = null;
            // 登出成功后跳转到主页
            return res.redirect('/index');
        }
        res.render("error", { error: error });
    })
});

//3.设置支付密码
//设置交易密码
router.get("/setPayPwd",checkLogin, checkBindCard, function(req, res, next) {
    res.render('register/setPayPwd', {
        is_bindcard: req.query.is_bindcard == '01',
        is_settranspwd: req.query.is_settranspwd == '01'
    });
});
router.post("/setPayPwd", checkLogin, checkBindCard, function(req, res, next) {
    var params = req.body || {};
    resource.post({
        head_tran_code: "C10009",
        regist_custno: req.session.user.regist_custno,
        regist_custtrspwd: params.payLastPwd,
        random_uuid: params.random_uuid
    }, req.session.keys).then(function(data) {
        if (data.respHead.head_rtn_code == "000000") {
            req.session.user.is_settranspwd = "01"; //绑定成功 更新本地数据
            if (serveConfig.param_questflag == '00') {
                res.redirect(global.base_url + "/account/risk");                
            } else {
                res.redirect(global.base_url + "/register/registerSuccess");
            }
            
        } else {
            req.flash('errorMsg', {
                message: data.respHead.head_rtn_desc
            });
            return res.redirect('back');
        }
    }, function(error) {
        if (error == 401) {
            req.session.user = null;
            // 登出成功后跳转到主页
            return res.redirect(global.base_url + '/index');
        }
        res.render("error", { error: error });
    })
});


//注册成功
router.get("/registerSuccess", function(req, res, next) {
    //req.session.user = _.clone(req.respBody);
    res.render("register/registerSuccess", {
        is_bindcard: req.query.is_bindcard == '01',
        is_settranspwd: req.query.is_settranspwd == '01'
    });
});
module.exports = router;
