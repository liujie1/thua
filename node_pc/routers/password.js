var express = require('express');
var _ = require('lodash');
var router = express.Router();

var configLite = require('config-lite');
var ERR_CODE = configLite.config.ret_err_code;

var resource = require('../models/resource');
var check = require('../middlewares/check');
var checkLogin = check.checkLogin;
var checkBindCard = check.checkBindCard;
var checkForgetPwdEntity = check.checkForgetPwdEntity;
var checkSetPayPwd = check.checkSetPayPwd;
//密码管理页
router.get("/", checkLogin, checkBindCard, function (req, res, next) {
    res.render('password/passwordManage');
});

router.get("/readMobile", function (req, res, next) {
    res.render("password/readMobile");
});
router.post("/readMobile", function (req, res, next) {
    var params = req.body || {};
    resource.post({
        custlogname: params.custlogname,
        head_tran_code: "C10005"
    }, req.session.keys).then(function (data) {
        if (data.respHead.head_rtn_code == "000000") {
            req.session.forgetPwdEntity = {
                mobile: data.respBody.regist_custphone,
                email: data.respBody.regist_custemail,
                procedure_serno: data.respBody.procedure_serno,
                custlogname: params.custlogname
            }
            if (data.respBody.regist_custemail) {
                res.redirect(global.base_url + "/account/password/selectFindWay");
            } else {
                res.redirect(global.base_url + "/account/password/verifyMobile");
            }
        } else {
            req.flash('errorMsg', {
                message: data.respHead.head_rtn_desc
            });
            req.flash("fields", params);
            return res.redirect('back');
        }
    }, function (error) {
        if (error == 401) {
            req.session.user = null;
            // 登出成功后跳转到主页
            return res.redirect(global.base_url + '/index');
        }
        res.render("error", {
            error: error
        });
    })
});

//选择找回登录密码方式
router.get("/selectFindWay", checkForgetPwdEntity, function (req, res) {
    res.render('password/selectFindWay');
});

//找回登录密码方式1-手机号
router.get("/verifyMobile", checkForgetPwdEntity, function (req, res, next) {
    var mobile = req.session.forgetPwdEntity.mobile;
    console.log(mobile);
    res.render('password/verifyMobile', {
        mobile: mobile,
        hideMobile: mobile.substr(0, 3) + "****" + mobile.substr(-4, mobile.length)
    });
});

router.post("/verifyMobile", checkForgetPwdEntity, function (req, res, next) {
    var params = req.body || {}; //verification_code
    var postParams = {
        head_tran_code: "C10006", //交易码
        custlogname: req.session.forgetPwdEntity.custlogname, //账号
        procedure_serno: req.session.forgetPwdEntity.procedure_serno, //系统上送序列号
        reset_mode: "0", //重置方式 手机号重置
        smslog_vercode: params.verification_code, //验证码
        smslog_serno: params.smslog_serno, //验证码序号
        regist_custphone: req.session.forgetPwdEntity.mobile
    };
    resource.post(postParams, req.session.keys).then(function (data) {
        if (data.respHead.head_rtn_code == "000000") {
            req.session.procedure_serno = data.respBody.procedure_serno;
            res.redirect(global.base_url + "/account/password/loginPwdReset");
        } else {
            req.flash('errorMsg', {
                message: data.respHead.head_rtn_desc
            });
            req.flash("fields", params);
            return res.redirect('back');
        }
    }, function (error) {
        if (error == 401) {
            req.session.user = null;
            // 登出成功后跳转到主页
            return res.redirect(global.base_url + '/index');
        }
        res.render("error", {
            error: error
        });
    })
});

//找回登录密码方式1-邮箱
router.get("/verifyEmail", checkForgetPwdEntity, function (req, res, next) {
    var email = req.session.forgetPwdEntity.email;
    res.render('password/verifyEmail', {
        email: email,
        hideEmail: email.substr(0, 3) + "****" + email.substr(email.indexOf("@"), email.length)
    });
});

router.post("/verifyEmail", checkForgetPwdEntity, function (req, res, next) {
    var params = req.body || {};
    var postParams = {
        head_tran_code: "C10006",
        custlogname: req.session.forgetPwdEntity.custlogname, //账号
        procedure_serno: req.session.forgetPwdEntity.procedure_serno, //系统上送序列号
        reset_mode: "1", //重置方式 手机号重置
        emailog_verifycode: params.verification_code,
        emailog_serno: params.emailog_serno,
        emailog_emailaddress: req.session.forgetPwdEntity.email
    };
    resource.post(postParams, req.session.keys).then(function (data) {
        if (data.respHead.head_rtn_code == "000000") {
            req.session.procedure_serno = data.respBody.procedure_serno;
            res.redirect(global.base_url + "/account/password/loginPwdReset");
        } else {
            req.flash("fields", params);
            req.flash("errorMsg", {
                message: data.respHead.head_rtn_desc
            });
            res.redirect("back");
        }
    }, function (error) {
        if (error == 401) {
            req.session.user = null;
            // 登出成功后跳转到主页
            return res.redirect(global.base_url + '/index');
        }
        res.render("error", {
            error: error
        });
    })
});


//重置账号密码
router.get("/loginPwdReset", checkForgetPwdEntity, function (req, res, next) {
    res.render("password/loginPwdReset");
});
//重置账号密码成功
router.get("/loginPwdResetSuccess", function (req, res, next) {
    res.render("password/loginPwdResetSuccess")
})
router.post("/loginPwdReset", checkForgetPwdEntity, function (req, res, next) {
    var params = req.body || {};
    var postParams = {
        head_tran_code: "C10007",
        custlogname: req.session.forgetPwdEntity.custlogname, //账号
        procedure_serno: req.session.procedure_serno,
        regist_custlogpwd: params.loginLastPwd,
        random_uuid: req.body.random_uuid
    };
    resource.post(postParams, req.session.keys).then(function (data) {
        if (data.respHead.head_rtn_code == "000000") {
            res.redirect(global.base_url + "/account/password/loginPwdResetSuccess");
        } else {
            req.flash("fields", params);
            req.flash("errorMsg", {
                message: data.respHead.head_rtn_desc
            });
            res.redirect("back");
        }
    }, function (error) {
        if (error == 401) {
            req.session.user = null;
            // 登出成功后跳转到主页
            return res.redirect(global.base_url + '/index');
        }
        res.render("error", {
            error: error
        });
    })
})

//登录密码修改
router.get("/modifyLoginPwd", function (req, res, next) {
    res.render('password/modifyLoginPwd');
});
router.post("/modifyLoginPwd", checkLogin, function (req, res, next) {
    var params = req.body || {};
    var postParams = {
        head_tran_code: "C10008",
        regist_custno: req.session.user.regist_custno, //客户号 用来标识用户id
        regist_custlogpwd: params.login_password, //原登录密码
        regist_custlogpwd_nw: params.loginLastPwd, //新登录密码
        random_uuid: req.body.random_uuid,
    };
    resource.post(postParams, req.session.keys).then(function (data) {
        if (data.respHead.head_rtn_code == "000000") {
            req.session.user = null;
            res.redirect(global.base_url + '/account/password/modifyLoginPwdSuccess');
        } else {
            console.log('QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ', data.respHead.head_rtn_desc)
            req.flash('errorMsg', {
                message: data.respHead.head_rtn_desc
            });
            req.flash("fields", params);
            return res.redirect('back');
        }
    }, function (error) {
        if (error == 401) {
            req.session.user = null;
            // 登出成功后跳转到主页
            return res.redirect(global.base_url + '/index');
        }
        res.render("error", {
            error: error
        });
    })
});
//登录密码修改成功
router.get("/modifyLoginPwdSuccess", function (req, res, next) {
    res.render("password/modifyLoginPwdSuccess");
});

//交易密码重置-验证身份
router.get("/payPwdResetStep1", checkLogin, checkSetPayPwd, function (req, res, next) {
    var mobile = req.session.user.regist_custphone;
    res.render('password/payPwdReset-step1', {
        hideMobile: mobile.substr(0, 3) + "****" + mobile.substr(-4, mobile.length),
        phone: mobile,
        regist_custname: req.session.user.regist_custname
    });
});
router.post("/payPwdResetStep1S", checkLogin, checkSetPayPwd, function (req, res, next) {
    var params = req.body || {};
    var postParams = {
        head_tran_code: "C10010",
        regist_custno: req.session.user.regist_custno,
        cust_idtype: "00",
        cust_idno: params.id_code,
        smslog_vercode: params.verification_code,
        smslog_serno: params.smslog_serno,
        regist_custphone: req.session.user.regist_custphone,
        regist_custname: req.session.user.regist_custname,
        bkact_acctno: params.bkact_acctno
    }
    console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$');
    console.log(params);
    console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$');
    resource.post(postParams, req.session.keys).then(function (data) {
        if (data.respHead.head_rtn_code == "000000") {
            req.session.procedure_serno = data.respBody.procedure_serno;
            res.redirect(global.base_url + "/account/password/payPwdResetStep2");
        } else {
            req.flash('errorMsg', {
                message: data.respHead.head_rtn_desc
            });
            req.flash("fields", params);
            return res.redirect('back');
        }
    }, function (error) {
        if (error == 401) {
            req.session.user = null;
            // 登出成功后跳转到主页
            return res.redirect(global.base_url + '/index');
        }
        res.render("error", {
            error: error
        });
    })
});
//交易密码重置-设置密码
router.get("/payPwdResetStep2", checkLogin, checkSetPayPwd, function (req, res, next) {
    res.render('password/payPwdReset-step2');
});
//交易密码重置成功
router.get("/payPwdResetSuccess", checkLogin, function (req, res, next) {
    res.render('password/payPwdResetSuccess');
});
router.post("/payPwdResetStep2", checkLogin, checkSetPayPwd, function (req, res, next) {
    var params = req.body || {};
    var postParams = {
        head_tran_code: "C10011",
        regist_custno: req.session.user.regist_custno,
        procedure_serno: req.session.procedure_serno,
        trans_pwd: params.payLastPwd,
        random_uuid: req.body.random_uuid
    }
    resource.post(postParams, req.session.keys).then(function (data) {
        if (data.respHead.head_rtn_code == "000000") {
            delete req.session.procedure_serno;
            res.redirect(global.base_url + "/account/password/payPwdResetSuccess");
        } else {
            req.flash('errorMsg', {
                message: data.respHead.head_rtn_desc
            });
            return res.redirect('back');
        }
    }, function (error) {
        if (error == 401) {
            req.session.user = null;
            // 登出成功后跳转到主页
            return res.redirect(global.base_url + '/index');
        }
        res.render("error", {
            error: error
        });
    })
});

//修改交易密码
router.get("/modifyPayPwd", checkLogin, checkSetPayPwd, function (req, res, next) {
    res.render("password/modifyPayPwd");
});
//修改交易密码成功提示页面
router.get("/modifyPayPwdSuccess", checkLogin, function (req, res, next) {
    res.render("password/modifyPayPwdSuccess");
});
router.post("/modifyPayPwd", checkLogin, checkSetPayPwd, function (req, res, next) {
    var params = req.body || {};
    var postParams = {
        head_tran_code: "C10012",
        regist_custno: req.session.user.regist_custno, //客户号
        regist_custtrspwd_nw: params.payLastPwd, //新交易密码
        regist_custtrspwd: params.pay_password, // 原交易密码
        random_uuid: req.body.random_uuid
        // msg_serial_number: req.session.msg_serial_number
    };
    resource.post(postParams, req.session.keys).then(function (data) {
        if (data.respHead.head_rtn_code == "000000") {
            res.redirect(global.base_url + "/account/password/modifyPayPwdSuccess");
        } else {
            req.flash('errorMsg', {
                message: data.respHead.head_rtn_desc
            });
            req.flash("fields", params);
            return res.redirect('back');
        }
    }, function (error) {
        if (error == 401) {
            req.session.user = null;
            // 登出成功后跳转到主页
            return res.redirect(global.base_url + '/index');
        }
        res.render("error", {
            error: error
        });
    })
});

module.exports = router;
