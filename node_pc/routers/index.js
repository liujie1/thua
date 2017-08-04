var express = require('express');
var router = express.Router();

var fs = require("fs");

var _ = require('lodash');
var Promise = require("bluebird");
var moment = require('moment');
var resource = require('../models/resource');

//首页
router.get("/index", function (req, res, next) {
    // 页面请求参数
    var paramsArr = {
        // 滚动公告
        notices: {
            head_tran_code: "S40001",
            notice_type: "00",
            query_begin_line: "1",
            query_num: "1"
        },
        // 重要公告
        news: {
            head_tran_code: "S40001",
            query_begin_line: "1",
            query_num: "2"
        },
        //热销产品查询
        hots: {
            head_tran_code: "F30012"
        }
        // 常见问题
        // faq: {
        //     head_tran_code: "A40003",
        //     query_begin_line: "0",
        //     query_num: "5"
        // }
        
    };
    // 声明延迟对象
    var noticesDeffer = resource.post(paramsArr.notices, req.session.keys),
        newsDeffer = resource.post(paramsArr.news, req.session.keys),
        hostDeffer = resource.post(paramsArr.hots, req.session.keys),
        faqDeffer = new Promise(function (resolve) {
            fs.readFile((__dirname + '/../views/category/faq/faqData.json'), function (err, data) {
                var jsonData = JSON.parse(data);
                resolve(jsonData.list.slice(0, 5));
            })
        });
    // 延迟对象集合
    var defferArr = [newsDeffer, hostDeffer, faqDeffer];

    // 请求数据并渲染
    Promise.all(defferArr)
        .then(function (data) {
            if (data[0].respHead.head_rtn_code == "000000" && data[1].respHead.head_rtn_code == "000000") {

                // 定义渲染方法
                var _rander = function (newsContents) {
                    res.render('index', {
                        news: data[0].respBody.list || [],
                        newsContents: newsContents,
                        faq: data[2],
                        moment: moment,
                        hots: data[1].respBody.list
                    });
                }
                // 判断公告列表是否为空
                if (data[0].respBody.list && data[0].respBody.list.length > 0) {

                    // 请求对象参数 [1]
                    var queryParams1 = {
                        head_tran_code: "S40002",
                        notice_serno: data[0].respBody.list[0].notice_serno
                    };
                    // 定义请求对象 [1]
                    var article1Deffer = resource.post(queryParams1, req.session.keys);
                    // 延迟对象集合 [1]
                    var defferArr = [article1Deffer];

                    if (data[0].respBody.list.length >= 2) {
                        // 请求对象参数 [2]
                        var queryParams2 = {
                            head_tran_code: "S40002",
                            notice_serno: data[0].respBody.list[1].notice_serno
                        }
                        // 定义请求对象 [2]
                        var article2Deffer = resource.post(queryParams2, req.session.keys);
                        // 延迟对象集合 [2]
                        defferArr = [article1Deffer, article2Deffer];
                    }

                    // 调用接口
                    Promise.all(defferArr).then(function (data) {
                        var newsContents = [];
                        for(var i = 0; i < data.length; i++) {
                            newsContents.push(data[i].respBody.notice_content);
                        }
                        _rander(newsContents);
                    }, function (error) {

                    });
                    
                    
                } else {
                    _rander([]);
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

//登录失败
router.get("/logonfailure", function (req, res, next) {
    res.render("logonfailure", req.query);
})

// 登录
router.get("/login", function (req, res, next) {
    return res.render("components/login");
})


router.post("/login", function (req, res, next) {
    var goPage =req.body.goPage;
    // 登录请求参数
    var loginParams = {
        custlogname: req.body.custlogname,
        regist_custlogpwd: req.body.login_password,
        captcha: req.body.captcha,
        captcha_serno: req.body.captcha_serno,
        random_uuid: req.body.random_uuid,
        head_tran_code: "C10002"
    };
    resource.post(loginParams, req.session.keys).then(function (data) {
        if (data.respHead.head_rtn_code == "000000") {
            req.session.user = _.clone(data.respBody);
            if(goPage) return res.redirect(goPage);
            return res.redirect(global.base_url + '/index');
        } else if(data.respHead.head_rtn_code == "0000001"){
            return res.render('components/logonfailure', {message: data.respHead.head_rtn_desc});
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
    });
});


// 登出
router.get("/logout", function (req, res, next) {

    if (!req.session.user) { //本地服务器session过期
        // 清空session中用户信息
        req.session.destroy();
        // req.session.user = null;
        // 登出成功后跳转到主页
        if (global.runtime_config.trust_login) {
            res.redirect(global.runtime_config.bank_home_url);
        } else {
            return res.redirect(global.base_url + '/index');
        }
    }
    // 登出请求参数
    var logoutParams = {
        head_tran_code: "C10004",
        regist_custno: req.session.user.regist_custno
    };
    resource.post(logoutParams, req.session.keys).then(function (data) {
        if (data.respHead.head_rtn_code == "000000") {
            // 清空session中用户信息
            req.session.destroy();
            // req.session.user = null;
            // 登出成功后跳转到主页
            if (global.runtime_config.trust_login) {
                res.redirect(global.runtime_config.bank_home_url);
            } else {
                return res.redirect(global.base_url + '/index');
            }
        } else {
            res.render("error", {
                error: data.respHead.head_rtn_desc
            });
        }
    }, function (error) {
        if (error == 401) {
            req.session.destroy();
            // 登出成功后跳转到主页
            return res.redirect(global.base_url + '/index');
        }
        res.render("error", {
            error: "服务器出错,错误码：" + error
        });
    });
});

router.post("/isAgreeUpdateProtocol", function (req, res, next) {
    resource.post({
        head_tran_code: "C10025",
        regist_custno: req.session.user.regist_custno
    }, req.session.keys).then(function (data) {
        if (data.respHead.head_rtn_code == "000000") {
            req.session.user.is_agree = "1";
            return res.redirect(global.base_url + '/index');
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
            error: "服务器出错,错误码：" + error
        });
    })
})

router.get("/error", function (req, res, next) {
    res.render("error", req.query);
})

router.get("/test", function (req, res, next) {
    res.render("test");
})

// 登录
router.post("/test", function (req, res, next) {
    // 登录请求参数
    var loginParams = {
        custlogname: req.body.custlogname,
        regist_custlogpwd: req.body.login_password,
        captcha: req.body.captcha,
        captcha_serno: req.body.captcha_serno,
        head_tran_code: "C10002",
        random_uuid: req.body.random_uuid,
    };

    resource.post(loginParams, req.session.keys).then(function (data) {
        if (data.respHead.head_rtn_code == "000000") {
            req.session.user = _.clone(data.respBody);
            return res.redirect(global.base_url + '/index');
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
    });
});


module.exports = router;
