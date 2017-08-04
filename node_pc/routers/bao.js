var express = require('express');
var router = express.Router();
var _ = require('lodash');

var Promise = require('promise');

var filter = require('../models/fieldFilter');

var resource = require('../models/resource');

var configLite = require('config-lite');

var moment = require('moment');

var config = configLite.config;

var saveBaseUrl = require('../middlewares/saveBaseUrl').saveBaseUrl;
var checkLogin = require('../middlewares/check').checkLogin;
var checkBindCard = require('../middlewares/check').checkBindCard;
var checkSetPayPwd = require('../middlewares/check').checkSetPayPwd;


router.get("/propaganda", function (req, res, next) {
    resource.post({
        head_tran_code: "F30013",
        baby_code: global.runtime_config.baby_code
    }, req.session.keys).then(function (data) {
        console.log("data", data);
        res.render('bao/propaganda', {
            maxyield: data.respBody.max_yield_income,
            maxyieldi: data.respBody.max_yield_income_times,
            currentdate: data.respBody.current_date
        });
    }, function (error) {
        res.render("error", {
            error: error
        });
    });

    //res.render("bao/propaganda");
});
// xx宝产品
router.get("/", saveBaseUrl, checkLogin, function (req, res, next) {
    //XX宝类查询
    var babyPromise = resource.post({
        head_tran_code: "F30008",
        baby_code: global.runtime_config.baby_code,
        regist_custno: req.session.user.regist_custno,
    }, req.session.keys);
    //收益记录
    var yieldPromise = resource.post({
        head_tran_code: "F30004",
        regist_custno: req.session.user.regist_custno,
        query_begin_line: "1",
        query_num: "5",
        query_type: "00",
        baby_code: global.runtime_config.baby_code,
        query_flag: "00",
    }, req.session.keys);
    //XX宝类七日年化
    var babySeven = resource.post({
        head_tran_code: "F30013",
        baby_code: global.runtime_config.baby_code
    }, req.session.keys);
    //客户卡查询
    var custCard = resource.post({
        head_tran_code: "A20003",
        regist_custno: req.session.user.regist_custno
    }, req.session.keys);
    Promise.all([babyPromise, yieldPromise, babySeven, custCard]).then(function (datas) {
            if (datas[0].respHead.head_rtn_code == "000000" && datas[1].respHead.head_rtn_code == "000000" && datas[2].respHead.head_rtn_code == "000000" && datas[3].respHead.head_rtn_code == "000000") {
                req.session.baby = datas[0].respBody;
                custCardList = datas[3].respBody.list;
                console.log("isseven================================", datas[2].respBody)
                res.render('bao/index', {
                    baby: datas[0].respBody,
                    yields: datas[1].respBody.list,
                    filter: filter,
                    tranlog_status: global.dict.tranlog_status,
                    busi_code: global.dict.busi_code,
                    fund_type: global.dict.fund_type,
                    babySeven: datas[2].respBody,
                    custCardList: custCardList || [],
                    dateOptions: {
                        now: moment().format("YYYYMMDD"),
                        oneWeek: moment().subtract(1, 'weeks').format("YYYYMMDD"),
                        oneMonths: moment().subtract(1, 'months').format("YYYYMMDD"),
                        twoMonths: moment().subtract(2, 'months').format("YYYYMMDD"),
                        threeMonths: moment().subtract(3, 'months').format("YYYYMMDD")
                    },
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

                });
            } else if (datas[0].respHead.head_rtn_code != "000000") {
                res.render("error", {
                    error: datas[0].respHead.head_rtn_desc
                });
            } else if (datas[1].respHead.head_rtn_code != "000000") {
                res.render("error", {
                    error: datas[1].respHead.head_rtn_desc
                });
            } else if(data[3].respHead.head_rtn_code != "000000"){
                res.render("error", {
                    error: datas[3].respHead.head_rtn_desc
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
        })
});
router.post("/assetsInfo", checkLogin, function (req, res, next) {
    //宝宝持仓信息查询
    resource.post({
        head_tran_code: "F30008",
        baby_code: global.runtime_config.baby_code,
        regist_custno: req.session.user.regist_custno,
    }, req.session.keys).then(function (data) {
        res.json(data);
    }, function (error) {
        res.status(error).end();
    })



});
//累计收益
router.get("/totalEarn", checkLogin, function (req, res, next) {
    res.render('bao/totalEarn', {

    })
})
//昨日收益
router.get("/yestEarn", checkLogin, function (req, res, next) {
    resource.post({
        head_tran_code: "F30009",
        baby_code: global.runtime_config.baby_code,
        query_type: "00",
    }, req.session.keys).then(function (data) {
        if (data.respHead.head_rtn_code == "000000") {
            console.log("9999999999999999992222222222", data.respBody)
            res.render('bao/yestEarn', {
                yestList: data.respBody.list
            })
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

})
//收益查询
router.post("/yestEarn", checkLogin, function (req, res, next) {
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
        query_type: "00",
        query_flag: "00",
        bkact_fncacct: params.bkact_fncacct
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
//宝交易查询
router.post("/yestTrans", checkLogin, function (req, res, next) {
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
        baby_code: global.runtime_config.baby_code, //页面上的问题需要修改
        query_flag: "00",
        query_type: "00",
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
//支付赎回结果显示页
router.get("/info", checkLogin, function (req, res, next) {
    var info = req.session.info;
    if (req.session.info) {
     res.render('funds/info', info);
    } else {
        res.redirect(global.base_url + '/funds');
    }
});

//万小宝首页
router.get("/home", function (req, res, next) {
    res.render('bao/home');
});

module.exports = router;
