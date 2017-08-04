var express = require('express');
var _ = require('lodash');
var router = express.Router();

var resource = require('../models/resource');
var filter = require('../models/fieldFilter');
var checkLogin = require('../middlewares/check').checkLogin;

//更换银行卡
router.get("/changeCard", checkLogin, function(req, res, next) {
    var paramsArr = {
        userInfo: {
            head_tran_code: "A20004",
            regist_custno: req.session.user.regist_custno,
            bkact_acctno: req.session.bankcard_list[req.query.id].bkact_acctno,
        },
        bankCard: {
            head_tran_code: "S40003"
        }
    };
    // 声明延迟对象
    var userInfoDeffer = resource.post(paramsArr.userInfo, req.session.keys),
        bankCardDeffer = resource.post(paramsArr.bankCard, req.session.keys);
    // 延迟对象集合
    var defferArr = [userInfoDeffer, bankCardDeffer];

    Promise.all(defferArr)
        .then(function(data) {
            // 合并用户数据
            if (data[0].respHead.head_rtn_code == "000000" && data[1].respHead.head_rtn_code == "000000") {
                if (data[1].respBody.list.length > 0 && _.isObject(data[1].respBody.list[0])) {
                    res.render("bankCard/changeCard", {
                        is_change: data[0].respBody.bkact_cagstatusc == "00",
                        card_id: req.query.id,
                        regist_custname: req.session.user.regist_custname,
                        cust_idno: req.session.user.cust_idno,
                        bkinfo: data[1].respBody.list,
                        regist_custphone: req.session.user.regist_custphone
                    });
                } else {
                    res.render("error", {
                        error: "S40003银行列表为空"
                    });
                }
            } else if (data[0].respHead.head_rtn_code != "000000") {
                res.render("error", {
                    error: data[0].respHead.head_rtn_desc
                });
            } else if (data[1].respHead.head_rtn_code != "000000") {
                res.render("error", {
                    error: data[1].respHead.head_rtn_desc
                });
            }
        }, function(error) {
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
router.post("/changeCard", checkLogin, function(req, res, next) {
    var params = req.body;
    var reqParams = {
        head_tran_code: "A20002",
        regist_custno: req.session.user.regist_custno,
        cactlog_oriacctno: req.session.bankcard_list[params.card_id].bkact_acctno,
        bkinfo_code: params.bkinfo_code,
        cactlog_newacctno: params.card_no,
        cust_idtype: "00",
        cust_idno: params.id_card,
        regist_custname: params.cust_name,
        cactlog_newphone: params.mobile,
        cactlog_newmode: params.cactlog_newmode,
        smslog_vercode: params.verification_code,
        smslog_serno: params.smslog_serno
    };
    if (params.cactlog_newmode == "00") { //网银换卡
        reqParams.reqs_url = global.runtime_config.bank_card.changeCardCallBackUrl;
    }
    resource.post(reqParams, req.session.keys).then(function(data) {
        if (data.respHead.head_rtn_code == "000000") {
            if (params.cactlog_newmode == "00") {
                res.render("bankCard/EbankCallback", {
                    request_data: data.respBody.request_data,
                    wts_url: data.respBody.wts_url
                })
            } else {
                res.redirect(global.base_url + "/account/bankCard/changeCardSuccess");
            }

        } else {
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
        res.render("error", {
            error: error
        });
    })

});
//更换银行卡成功
router.get("/changeCardSuccess", checkLogin, function(req, res, next) {
    res.render("bankCard/changeCardSuccess");
});

/**
 * 2017-05-22 新增
 * 添加、解绑银行卡
 */
router.get("/addCard", checkLogin, function(req, res, next) {
    var bankCodeList = resource.post({
        head_tran_code: "S40003"
    }, req.session.keys);
    var userInfo = resource.post({
        regist_custno: req.session.user.regist_custno,
        head_tran_code: "C10013"
    }, req.session.keys);
    var defferArr = [bankCodeList, userInfo];
    Promise.all(defferArr).then(function(datas) {
        if (datas[0].respHead.head_rtn_code == "000000" && datas[1].respHead.head_rtn_code == "000000") {
            if (datas[0].respBody.list.length > 0 && _.isObject(datas[0].respBody.list[0])) {
                req.session.user = _.assign(req.session.user, datas[1].respBody);
                res.render('bankCard/addCard', {
                    is_bindcard: req.query.is_bindcard == '01',
                    bkinfo: datas[0].respBody.list,
                    regist_custphone: req.session.user.regist_custphone
                });
            } else {
                res.render("error", {
                    error: "S40003银行列表为空"
                });
            }

        } else if (datas[0].respHead.head_rtn_code != "000000") {
            res.render("error", {
                error: datas[0].respHead.head_rtn_desc
            });
        } else if (datas[1].respHead.head_rtn_code != "000000") {
            res.render("error", {
                error: datas[1].respHead.head_rtn_desc
            });
        }
    }, function(error) {
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

router.post("/addCard", checkLogin, function(req, res, next) {
    // 页面请求的参数
    var params = req.body;
    console.log("===============",params);
    // 发送接口请求的参数
    var requsetParams = {
        head_tran_code: "A20001",
        regist_custno: req.session.user.regist_custno,
        regist_custname: req.session.user.regist_custname, //客户姓名
        bkinfo_code: params.bkinfo_code, //银行卡行号
        bkact_actphone: params.mobile, //银行预留手机号
        bkact_acctno: params.card_no, //银行卡号
        cust_idno: req.session.user.cust_idno, //身份证号
        cust_idtype: req.session.user.cust_idtype, //证件类型
        cactlog_newmode: params.cactlog_newmode, //默认快捷
        smslog_vercode: params.verification_code, //短信验证码
        smslog_serno: params.smslog_serno //短信验证序列号
    };

    if (params.cactlog_newmode == "00") { //网银签约
        requsetParams.reqs_url = global.runtime_config.bank_card.addCardCallBackUrl;
    }
    resource.post(requsetParams, req.session.keys).then(function(data) {
        if (data.respHead.head_rtn_code == "000000") {
            if (params.cactlog_newmode == "00") {
                res.render("bankCard/EbankCallback", {
                    request_data: data.respBody.request_data,
                    wts_url: data.respBody.wts_url
                })
            } else {
                req.session.user.regist_custname = params.cust_name;
                req.session.user.is_bindcard = "01"; //绑定成功 更新本地数据
                res.render("bankCard/addCardSuccess");
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
        res.render("error", {
            error: error
        });
    })
});

/**
 * 2017-05-23
 * 解绑卡
 */
router.get("/removeCard", checkLogin, function(req, res, next) {
    // console.log('===========TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT', req.query.id)
    // console.log('===========TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',req.session.bankcard_list)

    var paramsArr = {
        userInfo: {
            head_tran_code: "A20004",
            regist_custno: req.session.user.regist_custno,
            bkact_acctno: req.session.bankcard_list[req.query.id].bkact_acctno,
        },
        bankCard: {
            head_tran_code: "S40003"
        }
    };
    // 声明延迟对象
    var userInfoDeffer = resource.post(paramsArr.userInfo, req.session.keys),
        bankCardDeffer = resource.post(paramsArr.bankCard, req.session.keys);
    // 延迟对象集合
    var defferArr = [userInfoDeffer, bankCardDeffer];

    Promise.all(defferArr).then(function(datas) {
        if (datas[0].respHead.head_rtn_code == "000000" && datas[1].respHead.head_rtn_code == "000000") {
            if (datas[1].respBody.list.length > 0 && _.isObject(datas[1].respBody.list[0])) {
                res.render('bankCard/removeCard', {
                    is_bindcard: req.query.is_bindcard == '01',
                    is_change: datas[0].respBody.bkact_cagstatusc == "00",
                    bkinfo: datas[1].respBody.list,
                    select_card_info: req.query.id ? req.session.bankcard_list[req.query.id] : null,
                });
            } else {
                res.render("error", {
                    error: "S40003银行列表为空"
                });
            }

        } else if (datas[0].respHead.head_rtn_code != "000000") {
            res.render("error", {
                error: datas[0].respHead.head_rtn_desc
            });
        } else if (datas[1].respHead.head_rtn_code != "000000") {
            res.render("error", {
                error: datas[1].respHead.head_rtn_desc
            });
        }
    }, function(error) {
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
router.post("/removeCard", checkLogin, function(req, res, next) {
    var params = req.body;
    var reqParams = {
        head_tran_code: "A20005",
        regist_custno: req.session.user.regist_custno,
        bkact_actphone: params.bkinfo_phone, //银行预留手机号
        bkact_acctno: params.card_no, //银行卡号
        smslog_vercode: params.verification_code,
        smslog_serno: params.smslog_serno
    };
    console.log('===========TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT', params)
    resource.post(reqParams, req.session.keys).then(function(data) {
        if (data.respHead.head_rtn_code == "000000") {
            // res.redirect(global.base_url + "/account/changeCardSuccess");
            res.render("bankCard/removeCardSuccess");
        } else {
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
        res.render("error", {
            error: error
        });
    })

});


//更换银行预留手机号
router.get("/changeCardPhone/:id", checkLogin, function (req, res, next) {
    res.render("bankCard/changeCardPhone", {
        bankcard: req.session.bankcard_list[req.params.id],
        filter: filter
    });
});
router.post("/changeCardPhone", checkLogin, function (req, res, next) {
    resource.post({
        head_tran_code: "C10017",
        regist_custno: req.session.user.regist_custno,
        bkact_acctno: req.body.bkact_acctno,
        new_phone: req.body.mobile,
        smslog_vercode: req.body.verification_code,
        smslog_serno: req.body.smslog_serno
    }, req.session.keys).then(function (data) {
        if (data.respHead.head_rtn_code == "000000") {
            res.redirect(global.base_url + "/account/bankCard/changeCardPhoneSuccess");
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

function routeInterface(uri) {
    return router.post("/EbankCallback" + uri, function (req, res, next) {
        resource.post({
            head_tran_code: "S40004",
            rep_msg: req.body.repMsg,
            trans_type: "00"
        }, req.session.keys).then(function (data) {
            if (data.respHead.head_rtn_code == "000000") {
                console.log(data.respHead.head_rtn_code);
                //req.session.user.regist_custname = params.cust_name;
                if (uri == "/bind") {
                    console.log("bind");
                    req.session.user.is_bindcard = "01"; //绑定成功 更新本地数据
                    return res.redirect(global.base_url + '/register/setPaypwd');
                } else if (uri == "/change") {
                    return res.redirect(global.base_url + '/account/bankCard/changeCardSuccess');
                } else if (uri == "/add") {
                    return res.redirect(global.base_url + '/account/bankCard/addCardSuccess');
                }
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
            } else {
                res.render("error", {
                    error: error
                });
            }
        })
    });
}
routeInterface("/bind");
routeInterface("/change");
routeInterface("/add");

//更换银行卡成功
router.get("/changeCardPhoneSuccess", checkLogin, function (req, res, next) {
    res.render("bankCard/changeCardPhoneSuccess");
});
router.get("/addCardSuccess", checkLogin, function (req, res, next) {
    res.render("bankCard/addCardSuccess");
});
module.exports = router;
