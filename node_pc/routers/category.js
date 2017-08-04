var express = require('express');
var _ = require('lodash');
var router = express.Router();
var fs = require("fs");
var moment = require('moment');
var resource = require('../models/resource');
var saveCategoryListUrl = require('../middlewares/saveBaseUrl').saveCategoryListUrl;

// 列表-帮助中心
router.get("/help-center", function(req, res, next) {
    // 获取json数据
    fs.readFile((__dirname + '/../views/category/faq/faqData.json'), function(err, data) {
        var jsonData = JSON.parse(data),
            queryParams = {
                category: req.query.category || '01',
                page: req.query.page || '1'
            },
            showNum = 10,
            totalData = filterData = _.filter(jsonData.list, function(o) {
                return o.article_category == queryParams.category;
            });
        filterData = filterData.slice((queryParams.page - 1) * showNum, queryParams.page * showNum);
        // console.log('A', jsonData)
        // console.log('B', req.query)
        console.log('总数据长度：', totalData.length);
        console.log('过滤后分类数据长度：', filterData.length);
        res.render('category/helpCenter/index', {
            totalData: totalData,
            category_data: filterData,
            category: queryParams.category,
            page: queryParams.page,
            show_num: showNum
        });
    });
});

// 列表-新手上路
router.get("/help-process", function(req, res, next) {
    // 获取json数据
    fs.readFile((__dirname + '/../views/category/helpProcess/helpProcessData.json'), function(err, data) {
        var jsonData = JSON.parse(data),
            queryParams = {
                category: req.query.category || '01',
                article_id: req.query.article_id || '01'
            };
        var filterData = _.filter(jsonData.list, function(item) {
            return item.article_category == queryParams.category && item.article_id == queryParams.article_id;
        });
        // console.log('A', queryParams)
        // console.log('B', filterData)
        // console.log('B', req.query)
        res.render('category/helpProcess/index', {
            category_data: filterData,
            category: queryParams.category
        });
    });
});

// 列表-常见问题
router.get("/faq", function(req, res, next) {
    // 获取json数据
    fs.readFile((__dirname + '/../views/category/faq/faqData.json'), function(err, data) {
        var jsonData = JSON.parse(data),
            queryParams = {
                category: req.query.category || '01',
                page: req.query.page || '1'
            },
            showNum = 10,
            totalData = filterData = _.filter(jsonData.list, function(o) {
                return o.article_category == queryParams.category;
            });
        // filterData = filterData.slice((queryParams.page - 1) * showNum, queryParams.page * showNum);
        // console.log('A', jsonData)
        // console.log('B', req.query)
        console.log('总数据长度：', totalData.length);
        console.log('过滤后分类数据长度：', filterData.length);
        res.render('category/faq/index', {
            totalData: totalData,
            category_data: totalData,
            category: queryParams.category,
            page: queryParams.page,
            show_num: showNum
        });
    });
});

// 列表-投资提示
router.get("/help-tips", function(req, res, next) {
    // 获取json数据
    fs.readFile((__dirname + '/../views/category/helpTips/helpTipsData.json'), function(err, data) {
        var jsonData = JSON.parse(data),
            queryParams = {
                category: req.query.category,
                article_id: req.query.article_id
            },
            filterData;
        // 默认显示数据
        if (!queryParams.category || !queryParams.article_id) {
            filterData = _.filter(jsonData.list, function(item) {
                return item.article_category == "default" && item.article_id == "default";
            });
        } else {
            filterData = _.filter(jsonData.list, function(item) {
                return item.article_category == queryParams.category && item.article_id == queryParams.article_id;
            });
        }
        // console.log('A', queryParams)
        // console.log('B', filterData)
        // console.log('B', req.query)
        res.render('category/helpTips/index', {
            category_data: filterData,
            category: queryParams.category
        });
    });
});

// 列表-重要公告
router.get("/notice", function(req, res) {
    // 请求参数
    var queryParams = {
        head_tran_code: "S40001",
        query_begin_line: "1",
        query_num: "3"
    };
    res.render('category/notice/index');
    // resource.post(queryParams).then(function (data) {
    //     console.log('CCCCCCCCCCCCCCCC', data);
    //     if (data.respHead.head_rtn_code == "000000") {
    //         res.render('category/notice/index', {
    //             notice_list: data.respBody.list
    //         });
    //     }
    // }, function (error) {
    //     res.render("error", {
    //         error: error
    //     });
    // });
});
router.post("/notice", function(req, res, next) {
    // 请求参数
    var queryParams = {
        head_tran_code: "S40001",
        query_begin_line: req.body.query_begin_line,
        query_num: req.body.query_num
    };
    resource.post(queryParams, req.session.keys).then(function(data) {
        // todo:模拟数据库查询结果，测试环境可删除
        // data.respBody.list = data.respBody.list.slice(queryParams.query_begin_line * 1, queryParams.query_begin_line * 1 + queryParams.query_num * 1)
        res.json(data)
    }, function(error) {
        if (error == 401) {
            req.session.user = null;
            // 登出成功后跳转到主页
            return res.redirect(global.base_url + '/index');
        }
        res.json({
            respHead: {
                head_rtn_code: 'ERR000',
                head_rtn_desc: error
            }
        });
    });
});


// 常见问题-文章
router.get("/faq/article", saveCategoryListUrl, function(req, res, next) {
    fs.readFile((__dirname + '/../views/category/faq/faqData.json'), function(err, data) {
        // 暂时未对拿不到分类或id的情况做处理
        var jsonData = JSON.parse(data),
            queryParams = {
                category: req.query.category,
                article_id: req.query.article_id
            };
        var articleObj = _.filter(jsonData.list, function(o) {
            return o.article_category == queryParams.category && o.article_id == queryParams.article_id;
        });
        res.locals.public_date = articleObj[0].public_date;
        res.render('category/article', {
            article_title: articleObj[0].article_title,
            article_content: articleObj[0].article_content,
            public_date: articleObj[0].public_date,
        });
    });
});

// 重要公告-文章
router.get("/notice/article", saveCategoryListUrl, function(req, res, next) {
    // 请求参数
    var queryParams = {
        head_tran_code: "S40002",
        notice_serno: req.query.article_id
    };
    resource.post(queryParams, req.session.keys).then(function(data) {
        if (data.respHead.head_rtn_code == "000000") {
            res.render('category/article', {
                article_title: data.respBody.notice_title,
                article_content: data.respBody.notice_content,
                public_date: moment(data.respBody.notice_crtdate, 'YYYYMMDD').format('YYYY-MM-DD')
            });
        } else {
            res.render("error", {
                error: data.respHead.head_rtn_desc
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

module.exports = router;
