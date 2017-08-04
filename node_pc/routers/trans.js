var express = require('express');
var router = express.Router();
var _ = require('lodash');

var Promise = require('promise');

var filter = require('../models/fieldFilter');

var resource = require('../models/resource');

var moment = require('moment');

var saveBaseUrl = require('../middlewares/saveBaseUrl').saveBaseUrl;
var checkLogin = require('../middlewares/check').checkLogin;
var checkBindCard = require('../middlewares/check').checkBindCard;
var checkSetPayPwd = require('../middlewares/check').checkSetPayPwd;


//产品详情
router.get("/detail/:fund_code", function (req, res, next) {
    var fund_code = req.params.fund_code; //产品代码
    var isAlert = req.query.alert == "1";
    var fundPromise = resource.post({
        fund_code: fund_code,
        head_tran_code: "F30007"
    }, req.session.keys);
    //收益记录
    // var ratePromise = resource.post({
    //     fund_code: fund_code,
    //     head_tran_code: "F30010"
    // }, req.session.keys);
    Promise.all([fundPromise]).then(function (datas) {
        if (datas[0].respHead.head_rtn_code == "000000") {
            var detail = datas[0].respBody;
            var userInfo = req.session.user;
            //最低风险等级确认风险后是否能购买高于其风险承受能力的产品控制 （保守型） 并且已经风评后的用户 跳转基金详情页面 提示弹框
            // isAlert = (global.serveConfig.param_whether == "01" && detail.fund_level != "0" && (userInfo.grade_custrisk || '01') == '01' && userInfo.is_risk == '00');
            res.render('bao/detail/index', {
                filter: filter,
                detail: datas[0].respBody,
                funds_risk: global.dict.funds_risk,
                isAlert: isAlert,
                date_limit: [{
                    name: "一月",
                    value: moment().subtract(1, 'months').format("YYYYMMDD")
                },
                {
                    name: "三月",
                    value: moment().subtract(3, 'months').format("YYYYMMDD")
                },
                {
                    name: "半年",
                    value: moment().subtract(6, 'months').format("YYYYMMDD")
                },
                {
                    name: "一年",
                    value: moment().subtract(1, 'year').format("YYYYMMDD")
                },
                {
                    name: "两年",
                    value: moment().subtract(2, 'year').format("YYYYMMDD")
                },
                {
                    name: "三年",
                    value: moment().subtract(3, 'year').format("YYYYMMDD")
                },
                {
                    name: "今年来",
                    value: moment().startOf('year').format("YYYYMMDD")
                }
                    // ,{
                    //     name: "自成立以来",
                    //     value: "0"
                    // }
                ]
                // list1: datas[1].respBody.subscribeList,
                // list2: datas[1].respBody.redeem_list,
                // list3: datas[1].respBody.apply_list,
            });
        } else if (datas[0].respHead.head_rtn_code != "000000") {
            res.render("error", {
                error: datas[0].respHead.head_rtn_desc
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

// 充值
router.get("/recharge/:fund_code", checkLogin, checkBindCard, checkSetPayPwd, function (req, res, next) {
    var fund_code = req.params.fund_code; //产品代码
    var flag = req.query.flag == '0';
    var bkact_fncacct = req.query.id || ''; //产品索引
    // console.log(bkact_fncacct);
    if (/[`~!@#$%^&*()_+<>?:"{},.\/;'[\]]/im.test(bkact_fncacct)) { //预防XSS攻击
        return res.render("error", {
            error: "非法访问，您的系统存在安全隐患"
        });
    }
    //获取银行卡列表
    promiseList = [
        //获取产品详情
        resource.post({
            fund_code: fund_code,
            head_tran_code: "F30007"
        }, req.session.keys),
        //获取银行卡列表
        resource.post({
            regist_custno: req.session.user.regist_custno,
            head_tran_code: "A20003"
        }, req.session.keys),
        resource.post({
            regist_custno: req.session.user.regist_custno,
            head_tran_code: "C10013"
        }, req.session.keys)
    ];
    Promise.all(promiseList).then(function (result) {
        if (result[0].respHead.head_rtn_code == "000000" && result[1].respHead.head_rtn_code == "000000" && result[2].respHead.head_rtn_code == "000000") {
            var bankList = [];
            var detail = result[0].respBody; //产品详情
            var userInfo = result[2].respBody; //用户信息
            req.session.user = _.assign(req.session.user, userInfo);
            //最低风险等级确认风险后是否能购买高于其风险承受能力的产品控制 （保守型）跳转基金详情页面 提示弹框
            if (global.serveConfig.param_whether == "01" && detail.fund_level != "0" && (userInfo.grade_custrisk || '01') == '01') {
                return res.redirect(global.base_url + '/funds/detail/' + fund_code + "?alert=1");
            }

            if (_.isArray(result[1].respBody.list)) {
                bankList = result[1].respBody.list;
            }
            var data = result[0];
            if (result[0].respBody.is_baby === '00') {
                resource.post({
                    head_tran_code: "F30013",
                    baby_code: global.runtime_config.baby_code
                }, req.session.keys).then(function (data) {
                    res.render('bao/detail/recharge', {
                        filter: filter,
                        detail: result[0].respBody,
                        bankList: bankList,
                        risk: global.dict.risk,
                        fundCode: req.params.fund_code,
                        bobyList: data.respBody.list,
                        userInfo: result[2].respBody,
                        flag: flag, //是否选中表示
                        bkact_fncacct: bkact_fncacct
                    });
                }, function (error) {
                    res.render("error", {
                        error: error
                    });
                });
            } else {
                res.render('bao/detail/recharge', {
                    filter: filter,
                    detail: result[0].respBody,
                    bankList: bankList,
                    risk: global.dict.risk,
                    fundCode: req.params.fund_code,
                    userInfo: result[2].respBody,
                    flag: flag, //是否选中表示
                    bkact_fncacct: bkact_fncacct
                });
            }

        } else if (result[0].respHead.head_rtn_code != "000000") {
            res.render("error", {
                error: result[0].respHead.head_rtn_desc
            });
        } else {
            res.render("error", {
                error: result[1].respHead.head_rtn_desc || result[2].respHead.head_rtn_desc
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

router.post("/recharge", checkLogin, function (req, res, next) {
    var requestParams = {
        token: req.body.token,
        regist_custno: req.session.user.regist_custno,
        bkact_fncacct: req.body.bkact_fncacct,
        fund_code: req.body.fund_code,
        tranlog_applicationamount: req.body.amount,
        regist_custtrspwd: req.body.pay_password,
        tranlog_isagreerisk: req.body.tranlog_isagreerisk,
        head_tran_code: "F30001",
        trans_type: req.body.trans_type,
        random_uuid: req.body.random_uuid,
        matchCode: req.body.matchCode
    }
    resource.post(requestParams, req.session.keys).then(function (data) {
        if (data.respHead.head_rtn_code != "000000") {
            resource.post({
                head_tran_code: "P00001"
            }, req.session.keys).then(function (data1) {
                if (data1.respHead.head_rtn_code == "000000") {
                    req.session.user.token = data1.respBody.token;
                }
                res.json(data);
            }, function (error) {
                res.json({
                    respHead: {
                        head_rtn_code: 'ERR000',
                        head_rtn_desc: error
                    }
                });
            })
        } else {
            res.json(data);
        }
    }, function (errorCode) {
        if (errorCode == 401) {
            req.session.user = null;
            // 登出成功后跳转到主页
            return req.status(error).end();
        }
        res.json({
            respHead: {
                head_rtn_code: 'ERR000',
                head_rtn_desc: error
            }
        });
    })
});

// 查询费率折扣
router.post("/recharge/queryRate", checkLogin, function (req, res, next) {
    resource.post({
        fund_code: req.body.fundCode,
        tranlog_applicationamount: req.body.amount,
        head_tran_code: "F30015"

    }, req.session.keys).then(function (data) {
        res.json(data);
    }, function (error) {
        res.json({
            respHead: {
                head_rtn_code: 'ERR000',
                head_rtn_desc: error
            }
        });
    })
})

// 充值结果
router.get("/rechargeResult", checkLogin, function (req, res, next) {
    res.render('bao/detail/rechargeResult', req.query);
});

// ajax 查询宝宝基金详情
router.post("/fundDetails", checkLogin, function (req, res, next) {
    resource.post({
        fund_code: req.body.fundCode,
        head_tran_code: "F30007"
    }, req.session.keys).then(function (data) {
        res.json(data);
    }, function (error) {
        res.json({
            respHead: {
                head_rtn_code: 'ERR000',
                head_rtn_desc: error
            }
        });
    });
});

// ajax 查询宝宝份额详情
router.post("/limitDetails", checkLogin, function (req, res, next) {
    resource.post({
        fund_code: req.body.fundCode,
        head_tran_code: "F30003",
        regist_custno: req.session.user.regist_custno
    }, req.session.keys).then(function (data) {
        res.json(data);
    }, function (error) {
        if (error == 401) {
            req.session.user = null;
            return req.status(error).end();
            // 登出成功后跳转到主页
            // return res.redirect(global.base_url + '/index');
        }
        res.render("error", {
            error: error
        });
    });
});


// 充值下一步
// router.get("/rechargeNextStep", function(req, res, next) {
//     res.render('bao/detail/rechargeNextStep');
// });
// 取现
router.get("/takeNow/:fund_code", checkLogin, checkBindCard, checkSetPayPwd, function (req, res, next) {
    var fund_code = req.params.fund_code; //产品代码
    var flag = req.query.flag == 0;
    var bkact_fncacct = req.query.id || ''; //产品索引
    if (/[`~!@#$%^&*()_+<>?:"{},.\/;'[\]]/im.test(bkact_fncacct)) { //预防XSS攻击
        return res.render("error", {
            error: "非法访问，您的系统存在安全隐患"
        });
    }
    resource.post({
        regist_custno: req.session.user.regist_custno,
        head_tran_code: "A20003"
    }, req.session.keys).then(function (data) {
        if (data.respHead.head_rtn_code == "000000") {
            // console.log("-----------------TTTTTTTTTTTTTTT", data.respBody);
            req.session.user.bkact_fncacct = data.respBody.list[0].bkact_fncacct;
            var bankData = data;
            Promise.all([resource.post({
                regist_custno: req.session.user.regist_custno,
                fund_code: fund_code,
                head_tran_code: "F30003",
            }, req.session.keys), resource.post({
                head_tran_code: "P00001" //获取token
            }, req.session.keys), resource.post({
                fund_code: fund_code,
                head_tran_code: "F30007" //获取基金详情
            }, req.session.keys), resource.post({
                regist_custno: req.session.user.regist_custno,
                fund_code: fund_code,
                head_tran_code: "F30003"
            }, req.session.keys)]).then(function (datas) {

                req.session.user.token = datas[1].respBody.token;
                if (datas[0].respHead.head_rtn_code == "000000" && datas[2].respHead.head_rtn_code == "000000" && datas[1].respHead.head_rtn_code == "000000") {
                    var bankList = bankData.respBody.list || [];
                    var custList = datas[0].respBody.list || [];
                    console.log("-----------------TTTTTTTTTTTTTTT", datas[0].respBody);
                    // 判断是否为宝宝基金
                    if (datas[2].respBody.is_baby === '00') {
                        resource.post({
                            head_tran_code: "F30013",
                            baby_code: global.runtime_config.baby_code
                        }, req.session.keys).then(function (_data) {
                            res.render('bao/detail/takeNow', {
                                filter: filter,
                                detail: datas[2].respBody,
                                bankList: bankList,
                                custList: custList,
                                bkact_fncacct: bkact_fncacct,
                                bobyList: _data.respBody.list,
                                fundCode: fund_code,
                                flag: flag, //是否选中标识
                                cardFundList: datas[3].respBody
                            });
                        });
                    } else {
                        res.render('bao/detail/takeNow', {
                            filter: filter,
                            detail: datas[2].respBody,
                            bankList: bankList,
                            custList: custList,
                            bkact_fncacct: bkact_fncacct,
                            bobyList: [], // 非宝宝页面不需要宝宝基金列表
                            cardFundList: datas[3].respBody,
                            flag: flag
                        });
                    }
                    // 遍历获取的银行卡列表，匹配宝类产品银行名称,并扩展到宝类产品属性
                    //   _.forEach(bankList, function (item, idx) {
                    //     if (item.bkact_acctno = baby_list[fund_code_id].bkact_acctno) {
                    //       baby_list[fund_code_id].bkinfo_name = item.bkinfo_name
                    //     }
                    //   });
                    //   console.log("-----------------", custList);
                    //   if (!_.isArray(bankList) || !bankList[0].bkact_acctno) {
                    //     return res.render('bao/detail/takeNow', {
                    //       filter: filter,
                    //       detail: datas[2].respBody,
                    //       bankList: [],
                    //       custList: [],
                    //     });
                    //   }

                } else if (bankData.respHead.head_rtn_code != "000000") {
                    res.render("error", {
                        error: bankData.respHead.head_rtn_desc
                    });
                } else if (datas[0].respHead.head_rtn_code != "000000") {
                    res.render("error", {
                        error: datas[0].respHead.head_rtn_desc
                    });
                } else if (datas[1].respHead.head_rtn_code != "000000") {
                    res.render("error", {
                        error: datas[1].respHead.head_rtn_desc
                    });
                } else {
                    res.render("error", {
                        error: datas[2].respHead.head_rtn_desc
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
        }
    }, function (error) {
        if (error == 401) {
            req.session.user = null;
            // 登出成功后跳转到主页
            return res.redirect(global.base_url + '/index');
        }
        res.json({
            head_rtn_code: "ERR000",
            head_rtn_desc: error
        })
    });

});
router.post("/takeNow", checkLogin, checkBindCard, function (req, res, next) {
    var requestParams = {
        token: req.session.user.token,
        regist_custno: req.session.user.regist_custno,
        bkact_fncacct: req.body.bkact_fncacct,
        fund_code: req.body.fund_code,
        tranlog_applicationvol: req.body.account || req.body.account1,
        tranlog_redeemtype: req.body.tranlog_redeemtype,
        regist_custtrspwd: req.body.pay_password,
        head_tran_code: "F30002",
        trans_type: req.body.trans_type,
        random_uuid: req.body.random_uuid
    }
    resource.post(requestParams, req.session.keys).then(function (data) {
        if (data.respHead.head_rtn_code == "000000") {
            //    req.session.info = {
            //        status: "success",
            //        type: req.body.tranlog_redeemtype,
            //        confirm_date: req.body.confirm_date,
            //    }
            req.session.info = {
                status: "success",
                message: data.respHead.head_rtn_desc,
            }
            res.redirect("takeNowResult");
        } else {
            resource.post({
                head_tran_code: "P00001"
            }, req.session.keys).then(function (data1) {
                if (data1.respHead.head_rtn_code == "000000") {
                    req.session.user.token = data1.respBody.token;
                }
                req.session.info = {
                    status: "error",
                    message: data.respHead.head_rtn_desc,
                }
                res.redirect("takeNowResult");
            })
        }
    }, function (error) {
        if (error == 401) {
            req.session.user = null;
            return res.status(error).end();
            // 登出成功后跳转到主页
            return res.redirect(global.base_url + '/index');
        }
        res.render("error", {
            error: error
        });
    })
});


// 查询单个宝宝基金信息
router.post("/queryBabyFundInfo", checkLogin, function (req, res, next) {
    resource.post({
        regist_custno: req.session.user.regist_custno,
        fund_code: req.body.fundCode,
        head_tran_code: "F30003" //获取基金详情
    }, req.session.keys).then(function (data) {
        res.json(data);
    },
        function (error) {
            if (error == 401) {
                req.session.user = null;
                return res.status(error).end();
                // 登出成功后跳转到主页
                // return res.redirect(global.base_url + '/index');
            }
            res.render("error", {
                error: error
            });
        })
})


// 取现结果
router.get("/takeNowResult", checkLogin, function (req, res, next) {
    res.render('bao/detail/takeNowResult', req.session.info);
});

//分红修改
router.get("/changefh/:fundcode", checkLogin, function (req, res, next) {
    var fundPromise = resource.post({
        fund_code: req.params.fundcode,
        head_tran_code: "F30007"
    }, req.session.keys);
    Promise.all([fundPromise]).then(function (datas) {
        if (datas[0].respHead.head_rtn_code == "000000") {
            console.log("1234333", datas[0].respBody);
            res.render('account/changefh', {
                // fundcode: req.params.fundcode,
                filter: filter,
                bkact_fncacct: req.session.user.bkact_fncacct,
                detail: datas[0].respBody
            });
        } else if (datas[0].respHead.head_rtn_code != "000000") {
            res.render("error", {
                error: datas[0].respHead.head_rtn_desc
            });
        }
    }, function (error) {
        if (error == 401) {
            req.session.user = null;
            return res.redirect(global.base_url + '/index');
        }
        res.render("error", {
            error: error
        });
    })
});
router.post("/changefh", checkLogin, function (req, res, next) {
    var params = req.body;
    resource.post({
        head_tran_code: "F30011",
        regist_custno: req.session.user.regist_custno,
        bkact_fncacct: params.bkact_fncacct,
        fund_code: params.fund_code,
        dividend_method: params.dividend_method,
        regist_custtrspwd: params.regist_custtrspwd,
        random_uuid: params.random_uuid
    }, req.session.keys).then(function (data) {
        res.json(data);
    }, function (error) {
        res.status(error).send();
    })
});
router.get("/changefhInfo", function (req, res, next) {
    res.render("account/changefhInfo", req.query);
});
//收益查询`
router.get("/yieldRecord", checkLogin, function (req, res, next) {
    var query_type = "02";
    var baby_code = "";
    if (res.locals.menus[0] == "funds") { //当前模块 基金超市 只查询基金超市的交易记录
        query_type = "01";
    } else if (res.locals.menus[0] == "bao") { //当前宝类 基金超市 只查询基金超市的交易记录
        query_type = "00";
        baby_code = global.runtime_config.baby_code;
    }
    new Promise(function (resolve, reject) {
        resource.post({
            head_tran_code: "A20003",
            regist_custno: req.session.user.regist_custno
        }, req.session.keys).then(function (data) {
            if (data.respHead.head_rtn_code == "000000") {
                resolve(data.respBody.list);
            } else {
                resolve([]);
            }
        }, function (error) {
            if (error == 401) {
                req.session.user = null;
                // 登出成功后跳转到主页
                return res.redirect(global.base_url + '/index');
            }
            return res.json({
                respHead: {
                    head_rtn_code: 'ERR000',
                    head_rtn_desc: error
                }
            });
        })
    }).then(function (custCardList) {
        res.render('trans/yieldRecord', {
            custCardList: custCardList || [],
            dateOptions: {
                now: moment().format("YYYYMMDD"),
                oneWeek: moment().subtract(1, 'weeks').format("YYYYMMDD"),
                oneMonths: moment().subtract(1, 'months').format("YYYYMMDD"),
                twoMonths: moment().subtract(2, 'months').format("YYYYMMDD"),
                threeMonths: moment().subtract(3, 'months').format("YYYYMMDD")
            }
        });
    })
});
router.post("/yieldRecord", checkLogin, function (req, res, next) {
    var params = req.body;
    var requestParams = {
        head_tran_code: "F30005",
        regist_custno: req.session.user.regist_custno,
        start_date: params.start_date,
        end_date: params.end_date,
        prov_code: params.prov_code,
        fund_code: params.fund_code,
        fund_name: params.fund_name,
        query_begin_line: params.query_begin_line,
        query_num: params.query_num,
        query_flag: params.query_flag || "00",
        dividend_method: params.dividend_method,
        bkact_fncacct: params.bkact_fncacct,
        query_type: "01"
    }
    resource.post(requestParams, req.session.keys).then(function (data) {
        res.json(data);
    }, function (error) {
        if (error == 401) {
            req.session.user = null;
            return res.status(error).end();
            // 登出成功后跳转到主页
            // return res.redirect(global.base_url + '/index');
        }
        res.json({
            respHead: {
                head_rtn_code: 'ERR000',
                head_rtn_desc: error
            }
        });
    })
});


//交易记录
router.get("/tradeRecord", checkLogin, function (req, res, next) {
    // TODO: 后台查询下拉产品 没有区分 查询类型字段。需要后台加上此类区分 否则 基金超市下 基金简称下拉会出现我宝类产品简称
    var query_type = "02";
    var baby_code = "";
    if (res.locals.menus[0] == "funds") { //当前模块 基金超市 只查询基金超市的交易记录
        query_type = "01";
    } else if (res.locals.menus[0] == "bao") { //当前宝类 基金超市 只查询基金超市的交易记录
        query_type = "00";
        baby_code = global.runtime_config.baby_code;
    }
    new Promise(function (resolve, reject) {
        resource.post({
            head_tran_code: "A20003",
            regist_custno: req.session.user.regist_custno
        }, req.session.keys).then(function (data) {
            if (data.respHead.head_rtn_code == "000000") {
                resolve(data.respBody.list);
            } else {
                resolve([]);
            }
        }, function (error) {
            if (error == 401) {
                req.session.user = null;
                // 登出成功后跳转到主页
                return res.redirect(global.base_url + '/index');
            }
            return res.json({
                respHead: {
                    head_rtn_code: 'ERR000',
                    head_rtn_desc: error
                }
            });
        });
    }).then(function (custCardList) {
        res.render('trans/tradeRecord', {
            tranlog_status: global.dict.tranlog_status,
            busi_code: global.dict.busi_code,
            custCardList: custCardList || [],
            dateOptions: {
                now: moment().format("YYYYMMDD"),
                oneWeek: moment().subtract(1, 'weeks').format("YYYYMMDD"),
                oneMonths: moment().subtract(1, 'months').format("YYYYMMDD"),
                twoMonths: moment().subtract(2, 'months').format("YYYYMMDD"),
                threeMonths: moment().subtract(3, 'months').format("YYYYMMDD")
            }
        });
    })
});
router.post("/tradeRecord", checkLogin, function (req, res, next) {
    var params = req.body;
    resource.post({
        head_tran_code: "F30004",
        regist_custno: req.session.user.regist_custno,
        start_date: params.start_date,
        end_date: params.end_date,
        prov_code: params.prov_code,
        fund_code: params.fund_code,
        fund_name: params.fund_name,
        busi_type: params.busi_type,
        tranlog_status: params.tranlog_status,
        query_begin_line: params.query_begin_line,
        query_num: params.query_num,
        query_type: params.query_type,
        baby_code: params.baby_code, //页面上的问题需要修改
        query_flag: params.query_flag || "00",
        bkact_fncacct: params.bkact_fncacct
    }, req.session.keys).then(function (data) {
        res.json(data);
    }, function (error) {
        if (error == 401) {
            req.session.user = null;
            // 登出成功后跳转到主页
            return res.status(error).end();
            // return res.redirect(global.base_url + '/index');
        }
        res.json({
            respHead: {
                head_rtn_code: 'ERR000',
                head_rtn_desc: error
            }
        });
    })
});

//基金概况查询
router.post("/fundInfo", function (req, res, next) {
    resource.post({
        head_tran_code: "X10005",
        fund_code: req.body.fund_code,
        fund_id: req.body.fund_id
    }, req.session.keys).then(function (data) {
        res.json(data);
    }, function (error) { })
});
//基金费率查询
router.post("/fundRate", function (req, res, next) {
    resource.post({
        head_tran_code: "F30010",
        fund_code: req.body.fund_code,
        //fund_id: req.body.fund_id
    }, req.session.keys).then(function (data) {
        res.json(data);
    }, function (error) { })
});
//基金净值走势
router.post("/trendMap", function (req, res, next) {
    var start_date = "";
    resource.post({
        head_tran_code: "X10001",
        fund_code: req.body.fund_code,
        fund_id: req.body.fund_id,
        query_begin_line: req.body.query_begin_line,
        query_num: req.body.query_num,
        start_date: req.body.start_date,
        end_date: moment().format("YYYYMMDD")
    }, req.session.keys).then(function (data) {
        res.json(data);
    }, function (error) {
        res.json({
            respHead: {
                head_rtn_code: 'ERR000',
                head_rtn_desc: error
            }
        });
    })
});
//历史净值
router.post("/historyNav", function (req, res, next) {
    var start_date = "";
    resource.post({
        head_tran_code: "X10003",
        fund_code: req.body.fund_code,
        fund_id: req.body.fund_id,
        fund_type: req.body.fund_type,
        query_begin_line: req.body.query_begin_line,
        query_num: req.body.query_num,
        start_date: req.body.start_date,
        end_date: moment().format("YYYYMMDD")
    }, req.session.keys).then(function (data) {
        res.json(data);
    }, function (error) {
        res.json({
            respHead: {
                head_rtn_code: 'ERR000',
                head_rtn_desc: error
            }
        });
    })
})
//业绩表现
router.post("/perfMap", function (req, res, next) {
    resource.post({
        head_tran_code: "X10002",
        fund_code: req.body.fund_code,
        fund_id: req.body.fund_id,
        query_begin_line: req.body.query_begin_line,
        query_num: req.body.query_num,
        start_date: req.body.start_date,
        end_date: moment().format("YYYYMMDD")
    }, req.session.keys).then(function (data) {
        res.json(data);
    }, function (error) {
        res.json({
            respHead: {
                head_rtn_code: 'ERR000',
                head_rtn_desc: error
            }
        });
    })
})


module.exports = router;
