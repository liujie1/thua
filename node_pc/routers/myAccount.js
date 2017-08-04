var express = require('express');
var _ = require('lodash');
var router = express.Router();

var resource = require('../models/resource');
var filter = require('../models/fieldFilter');

var Promise = require("bluebird");
var checkLogin = require('../middlewares/check').checkLogin;
var checkBindCard = require('../middlewares/check').checkBindCard;
var saveBaseUrl = require('../middlewares/saveBaseUrl').saveBaseUrl;
var checkBindCard = require('../middlewares/check').checkBindCard;

var moment = require('moment');

router.get("/", checkLogin,checkBindCard, function(req, res, next) {

    resource.post({
        regist_custno: req.session.user.regist_custno,
        head_tran_code: "A20003"
    }, req.session.keys).then(function(data) {
        if (data.respHead.head_rtn_code == "000000") {
            req.session.user.bkact_fncacct=data.respBody.list[0].bkact_fncacct;
            var cardList = data.respBody.list;
            var baoPrams = resource.post({
                head_tran_code: "F30008",
                baby_code: global.runtime_config.baby_code,
                regist_custno: req.session.user.regist_custno,
            }, req.session.keys);
            var fundsPrams = resource.post({
                head_tran_code: "F30003",
                regist_custno: req.session.user.regist_custno,
            }, req.session.keys);
            var confirmPrams = resource.post({
                head_tran_code: "F30004",
                regist_custno: req.session.user.regist_custno,
                start_date: "",
                end_date: "",
                prov_code: "",
                fund_code: "",
                fund_name: "",
                busi_code: "",
                tranlog_status: "01",
                query_begin_line: "1",
                query_num: "99",
                query_type:"02",
                baby_code:"",
                query_flag:"00"
            }, req.session.keys);
             var assetsPrams = resource.post({
                head_tran_code: "F30014",
                regist_custno: req.session.user.regist_custno,
            }, req.session.keys);
        //     var assetsDemo = [{fundtype_code:"000078",fundtype_name:"万小宝1",fundtype_total_amt:88888,funtype_total_percent:400},
        // {fundtype_code:"000079",fundtype_name:"万小宝2",fundtype_total_amt:88888,funtype_total_percent:500},
        // {fundtype_code:"000178",fundtype_name:"万小宝3",fundtype_total_amt:88888,funtype_total_percent:600},
        // {fundtype_code:"000228",fundtype_name:"万小宝4",fundtype_total_amt:88888,funtype_total_percent:700}]
            Promise.all([baoPrams, fundsPrams,confirmPrams,assetsPrams]).then(function(datas) {
                if (datas[0].respHead.head_rtn_code == "000000" && datas[1].respHead.head_rtn_code == "000000" && datas[2].respHead.head_rtn_code == "000000"&& datas[3].respHead.head_rtn_code == "000000") {
                    //req.session.baby = datas[0].respBody;
                    console.log("什么鬼什么鬼什么鬼什么鬼什么鬼",datas[0].respBody)
                    res.render('account/account', {
                        bkact_fncacct:req.session.user.bkact_fncacct,
                        regist_custno: req.session.user.regist_custno,
                        funds:datas[1].respBody,
                        bao:datas[0].respBody,
                        //fundsList1:datas[0].respBody.list,
                        fundsList2:datas[1].respBody.list,
                        confirmList:datas[2].respBody.list,
                        tranlog_status: global.dict.tranlog_status,
                        fund_type:global.dict.fund_type,
                        dividendmethod:global.dict.dividendmethod,
                        total_amt:datas[3].respBody.total_amt,
                        total_income:datas[3].respBody.total_income,
                        assetsList:datas[3].respBody.list
                    });
                } else if (datas[0].respHead.head_rtn_code != "000000") {
                    res.render("error", {
                        error: datas[0].respHead.head_rtn_desc
                    });
                } else if(datas[1].respHead.head_rtn_code != "000000") {
                    res.render("error", {
                        error: datas[1].respHead.head_rtn_desc
                    });
                }else if(datas[2].respHead.head_rtn_code != "000000"){
                    res.render("error", {
                        error: datas[2].respHead.head_rtn_desc
                    });
                }else{
                    res.render("error", {
                        error: datas[3].respHead.head_rtn_desc
                    });
                }
            }, function(error) {
                if (error == 401) {
                    req.session.user = null;
                    return res.redirect(global.base_url + '/index');
                }
                res.render("error", {
                    error: error
                });
            })
        }
    }, function(error) {
        if (error == 401) {
            req.session.user = null;
            return res.redirect(global.base_url + '/index');
        }
        res.json({
            head_rtn_code: "ERR000",
            head_rtn_desc: error
        })
    });
});

router.post("/changeDividend", function(req, res, next) {
    var params = req.body;
    resource.post({
        head_tran_code: "F30011",
        regist_custno: req.session.user.regist_custno,
        bkact_fncacct:params.bkact_fncacct,
        fund_code:params.fund_code,
        dividend_method:params.dividend_method,
        regist_custtrspwd:params.regist_custtrspwd,
        random_uuid: params.random_uuid
    }, req.session.keys).then(function(data) {
        res.json(data);
    }, function(error) {

    })
});


module.exports = router;
