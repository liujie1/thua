var express = require('express');
var _ = require('lodash');
var router = express.Router();

var resource = require('../models/resource');
var filter = require('../models/fieldFilter');

var Promise = require("bluebird");
var checkLogin = require('../middlewares/check').checkLogin;
var checkBindCard = require('../middlewares/check').checkBindCard;
var checkSetPayPwd = require('../middlewares/check').checkSetPayPwd;

// 个人中心
router.get("/", checkLogin, checkBindCard, function (req, res, next) {
    // 获取session内的user信息
    console.log('获取session内的user信息：', req.session.user);
    // console.log('获取session内的user信息：',res.session)
    // 页面请求参数
    var paramsArr = {
        // 银行卡信息请求参数
        bankCard: {
            regist_custno: req.session.user.regist_custno,
            head_tran_code: "A20003"
        },
        // 用户信息请求参数
        userInfo: {
            regist_custno: req.session.user.regist_custno,
            head_tran_code: "C10013"
        }
    };
    // 声明延迟对象
    var bankCardDeffer = resource.post(paramsArr.bankCard, req.session.keys),
        userInfoDeffer = resource.post(paramsArr.userInfo, req.session.keys);
    // 延迟对象集合
    var defferArr = [bankCardDeffer, userInfoDeffer];
    // 请求数据并渲染
    Promise.all(defferArr)
        .then(function (data) {
            // 合并用户数据
            if (data[0].respHead.head_rtn_code == "000000" && data[0].respHead.head_rtn_code == "000000") {
                var cardList = data[0].respBody.list;
                if (cardList && !_.isEqual(cardList, [])) {

                    console.log('-------------------console--------------', JSON.stringify(data[1]));

                    req.session.user = _.assign(req.session.user, data[1].respBody);
                    req.session.bankcard_list = data[0].respBody.list;
                    res.render("accountInfo/accountInfo", {
                        bankcard_list: cardList,
                        bkinfo_name: cardList[0].bkinfo_name,
                        risk: global.dict.risk,
                        filter: filter,
                        is_risk: data[1].respBody.is_risk
                    });
                } else {
                    res.render("accountInfo/accountInfo", {
                        bankcard_list: cardList,
                        bkinfo_name: "",
                        risk: global.dict.risk,
                        filter: filter,
                        is_risk: data[1].respBody.is_risk
                    });
                }
            } else if (data[0].respHead.head_rtn_code != "000000") {
                res.render("error", {
                    error: data[0].respHead.head_rtn_desc
                });
            } else {
                res.render("error", {
                    error: data[1].respHead.head_rtn_desc
                });
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
        });
});

// 风险评测
router.get("/risk", checkLogin, function (req, res, next) {
    resource.post({
        head_tran_code: "C10023",
        regist_custno: req.session.user.regist_custno
    }, req.session.keys).then(function (data) {
        if (data.respHead.head_rtn_code == "000000") {
            req.session.risk_code = data.respBody.risk_code
            res.render("account/risk", {
                list: data.respBody.list,
                is_defanswer: data.respBody.is_defanswer,
                risk_code: data.respBody.risk_code
            });
        } else {
            res.render("error", {
                error: data.respHead.head_rtn_desc
            });
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
//提交风评结果
router.post("/submitRisk", checkLogin, function (req, res, next) {

    var risklog_answer = "";
    var index = 0;
    for (var key in req.body) {
        risklog_answer += req.body['q' + index]
        risklog_answer += "|";
        // risklog_answer += req.body['c' + index]
        index++;
    }
    risklog_answer = risklog_answer.substring(0, risklog_answer.length - 1);

    resource.post({
        head_tran_code: "C10024",
        regist_custno: req.session.user.regist_custno,
        risklog_answer: risklog_answer,
        risk_code: req.query.risk_code
    }, req.session.keys).then(function (data) {

        if (data.respHead.head_rtn_code == "000000") {
            req.session.user.grade_custrisk = data.respBody.grade_custrisk;
            res.render("account/riskResult", {
                grade_custrisk: data.respBody.grade_custrisk,
                risk: global.dict.risk,
                regist_anscrtdate: data.respBody.regist_anscrtdate,
                regist_ansinvdate: data.respBody.regist_ansinvdate
            });
        } else {
            res.render("error", {
                error: data.respHead.head_rtn_desc
            });
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

//绑定电子邮箱-1
router.get("/bindEmail", checkLogin, function (req, res, next) {
    res.render("accountInfo/bindEmail");
});
router.post("/bindEmail", checkLogin, function (req, res, next) {
    var params = req.body;
    var reqParams = {
        head_tran_code: "C10018",
        regist_custno: req.session.user.regist_custno,
        emailog_emailaddress: params.email, //电子邮箱
        emailog_verifycode: params.verification_code, //验证码
        emailog_serno: params.emailog_serno
    };
    resource.post(reqParams, req.session.keys).then(function (data) {
        if (data.respHead.head_rtn_code == "000000") {
            res.redirect(global.base_url + "/account/bindEmailSuccess");
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
//绑定成功
router.get("/bindEmailSuccess", checkLogin, function (req, res, next) {
    res.render("accountInfo/bindEmailSuccess");
});

//修改邮箱 无法收到验证码
router.get("/cannotGetEmailCode", checkLogin, checkSetPayPwd, function (req, res, next) {
    var mobile = req.session.user.regist_custphone;
    res.render("accountInfo/cannotGetEmailCode", {
        mobile: mobile,
        hideMobile: mobile.substr(0, 3) + "****" + mobile.substr(-4, mobile.length)
    });
});
router.post("/cannotGetEmailCode", checkLogin, function (req, res, next) {
    var params = req.body;
    var reqParams = {
        head_tran_code: "C10021",
        regist_custphone: params.mobile,
        regist_custno: req.session.user.regist_custno,
        emailog_emailaddress: params.emailog_emailaddress,
        smslog_vercode: params.verification_code,
        smslog_serno: params.smslog_serno,
        regist_custphone: params.mobile,
        regist_custtrspwd: params.pay_password,
        random_uuid: params.random_uuid
    };
    resource.post(reqParams, req.session.keys).then(function (data) {
        if (data.respHead.head_rtn_code == "000000") {
            req.session.procedure_serno = data.respBody.procedure_serno;
            req.flash('cannotGetCode', "1");
            res.redirect(global.base_url + "/account/modifyEmail2");
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

//修改邮箱-1
router.get("/modifyEmail1", checkLogin, function (req, res, next) {
    res.render("accountInfo/modifyEmail1", {
        regist_custemail: req.session.user.regist_custemail,
        filter: filter
    });
});
router.post("/modifyEmail1", function (req, res, next) {
    var params = req.body;
    var reqParams = {
        head_tran_code: "C10019",
        regist_custno: req.session.user.regist_custno,
        regist_custemail: req.session.user.regist_custemail,
        emailog_verifycode: params.verification_code,
        emailog_serno: params.emailog_serno
    };
    resource.post(reqParams, req.session.keys).then(function (data) {
        if (data.respHead.head_rtn_code == "000000") {
            req.session.procedure_serno = data.respBody.procedure_serno;
            req.flash('cannotGetCode', "0");
            res.redirect(global.base_url + "/account/modifyEmail2");
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
//修改邮箱-2
router.get("/modifyEmail2", checkLogin, function (req, res, next) {
    res.render("accountInfo/modifyEmail2");
});
router.post("/modifyEmail2", checkLogin, function (req, res, next) {
    var params = req.body;
    var reqParams = {
        head_tran_code: "C10020",
        regist_custno: req.session.user.regist_custno,
        regist_custemail: params.email,
        emailog_verifycode: params.verification_code,
        emailog_serno: params.emailog_serno,
        procedure_serno: req.session.procedure_serno
    };
    resource.post(reqParams, req.session.keys).then(function (data) {
        if (data.respHead.head_rtn_code == "000000") {
            res.redirect(global.base_url + "/account/modifyEmailSuccess");
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
//修改成功
router.get("/modifyEmailSuccess", checkLogin, function (req, res, next) {
    res.render("accountInfo/modifyEmailSuccess");
});

//修改手机号-无法收到短信
router.get("/cannotGetPhoneCode", checkLogin, checkSetPayPwd, function (req, res, next) {
    res.render("accountInfo/cannotGetPhoneCode");
});
router.post("/cannotGetPhoneCode", checkLogin, function (req, res, next) {
    var params = req.body;
    var reqParams = {
        head_tran_code: "C10016",
        regist_custno: req.session.user.regist_custno,
        cust_idtype: "00",
        cust_idno: params.idCard,
        regist_custtrspwd: params.pay_password,
        random_uuid: req.body.random_uuid
    };
    resource.post(reqParams, req.session.keys).then(function (data) {
        if (data.respHead.head_rtn_code == "000000") {
            req.session.procedure_serno = data.respBody.procedure_serno;
            req.flash('cannotGetCode', "1");
            res.redirect(global.base_url + "/account/modifyPhone2");
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
//修改手机号-1
router.get("/modifyPhone1", checkLogin, function (req, res, next) {
    req.flash('cannotGetCode', "0");
    var mobile = req.session.user.regist_custphone;
    res.render("accountInfo/modifyPhone1", {
        mobile: mobile,
        hideMobile: mobile.substr(0, 3) + "****" + mobile.substr(-4, mobile.length)
    });
});
router.post("/modifyPhone1", checkLogin, function (req, res, next) {
    var params = req.body;
    var reqParams = {
        head_tran_code: "C10014",
        regist_custno: req.session.user.regist_custno,
        regist_custphone: params.regist_custphone,
        smslog_vercode: params.verification_code,
        smslog_serno: params.smslog_serno,
        regist_custphone: req.session.user.regist_custphone
    }
    resource.post(reqParams, req.session.keys).then(function (data) {
        if (data.respHead.head_rtn_code == "000000") {
            req.session.procedure_serno = data.respBody.procedure_serno;
            req.flash('cannotGetCode', "0");
            res.redirect(global.base_url + "/account/modifyPhone2");
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
})
//修改手机号-2
router.get("/modifyPhone2", checkLogin, function (req, res, next) {
    res.render("accountInfo/modifyPhone2");
});
//修改手机号2
router.post("/modifyPhone2", checkLogin, function (req, res, next) {
    var params = req.body;
    var reqParams = {
        head_tran_code: "C10015",
        procedure_serno: req.session.procedure_serno, //请求修改手机号返回字段
        regist_custno: req.session.user.regist_custno,
        smslog_vercode: params.verification_code,
        smslog_serno: params.smslog_serno,
        regist_custphone: params.mobile
    }
    resource.post(reqParams, req.session.keys).then(function (data) {
        if (data.respHead.head_rtn_code == "000000") {
            res.redirect(global.base_url + "/account/modifyPhoneSuccess");
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
//修改成功页面-3
router.get("/modifyPhoneSuccess", function (req, res, next) {
    res.render("accountInfo/modifyPhoneSuccess");
});


// 修改用户信息
router.get("/modifyUserInfo", checkLogin, function (req, res, next) {
    // 使用 session 的数据
    console.log('-------------------console--------------', JSON.stringify(req.session.user));
    res.render("accountInfo/modifyUserInfo", {

    });
});


// 修改用户信息接口
router.post("/custMsgModify", checkLogin, function (req, res, next) {
    var reqParams = {
        head_tran_code: "C10027",
        regist_custno: req.session.user.regist_custno,
        cust_profession: req.body.cust_profession,
        cust_income: req.body.cust_income,
        cust_property: req.body.cust_property,
        cust_debt: req.body.cust_debt,
        cust_investhistory: req.body.cust_investhistory,
        cust_creditrecord: req.body.cust_creditrecord,
        cust_riskpreference: req.body.cust_riskpreference,
        province: req.body.province,
        city: req.body.city,
        address: req.body.address,
        cust_postcode: req.body.cust_postcode
    }
    resource.post(reqParams, req.session.keys).then(function (data) {
        if (data.respHead.head_rtn_code == "000000") {
            res.redirect(global.base_url + "/account");
        } else {
            req.flash('errorMsg', {
                message: data.respHead.head_rtn_desc
            });
            req.flash("fields", req.body);
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
