var express = require('express');
var router = express.Router();
var _ = require('lodash');

var filter = require('../models/fieldFilter');

var resource = require('../models/resource');

var moment = require('moment');

var checkLogin = require('../middlewares/check').checkLogin;
var checkBindCard = require('../middlewares/check').checkBindCard;

//基金超市
router.get("/", function(req, res, next) {
     resource.post({
         head_tran_code: "F30018"
     }, req.session.keys).then(function(data) {
        if (data.respHead.head_rtn_code == "000000") {
            res.render('funds/index', {bankCardBound: data.respBody.list || []});
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

//ajax基金超市表格数据查询
router.post("/getFunds", function(req, res, next) {
    var params = {
        head_tran_code: "F30006",
        fund_type: req.body.fund_type || '',
        code_or_name: req.body.code_or_name || '',
        fund_status: req.body.fund_status || '',
        fund_size_min: req.body.fund_size_min || '',
        fund_size_max: req.body.fund_size_max || '',
        fund_level: req.body.fund_level || '',
        query_begin_line: req.body.query_begin_line || '',
        prov_code: req.body.prov_code || '',
        query_num: req.body.query_num || '',
        sort_field: req.body.sort_field,
        sort_rule: req.body.sort_rule
    };
    resource.post(params, req.session.keys).then(function(data) {
        console.log("isssssssssss===================="+data.list)
        res.json(data);
    }, function(error) {
        if (error == 401) {
            req.session.user = null;
            // 登出成功后跳转到主页
            return res.redirect(global.base_url + '/index');
        }
        res.render("error", { error: error });
    })
});


// 我的基金
router.get("/myFunds", checkLogin, checkBindCard, function(req, res, next) {
    res.render('funds/myFunds');
});

//分红方式修改



// 我的基金
router.post("/myFunds", checkLogin, checkBindCard, function(req, res, next) {
    resource.post({
        regist_custno: req.session.user.regist_custno,
        head_tran_code: "A20003"
    }, req.session.keys).then(function(data) {
        if (data.respHead.head_rtn_code == "000000") {
            var params = req.body;
            var bankCard = data.respBody.list[0];
            params.head_tran_code = "F30003";
            params.regist_custno = req.session.user.regist_custno;
            resource.post(params, req.session.keys).then(function(data) {
                res.json(data);
            }, function(error) {
                if (error == 401) {
                    req.session.user = null;
                    // 登出成功后跳转到主页
                    return res.redirect(global.base_url + '/index');
                }
                res.json({
                    head_rtn_code: "ERR000",
                    head_rtn_desc: error
                })
            })
        } else {
            res.json(data);
        }
    }, function(error) {
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


module.exports = router;
