var configLite = require('config-lite');
// var constant = configLite.constant;
// var base_url = constant.base_url;
module.exports = function(app) {
    app.get('/', function(req, res) {
        res.redirect(global.base_url + '/index');
    });
    app.get(global.base_url, function(req, res) {
        res.redirect(global.base_url + '/index');
    });
    // 首页
    app.use(global.base_url, require('./index'));
    //注册
    app.use(global.base_url + "/register", require("./register"));
    //app.use("/trustlogin", require("./trustlogin"));

    //协议
    app.use(global.base_url + "/agreement", require("./agreement"));

    // 基金超市
    app.use(global.base_url + "/funds", require("./funds"));
    app.use(global.base_url + "/funds", require("./trans"));
    // 我的账户
    app.use(global.base_url + "/myAccount", require("./myAccount"));
    //我的账户 / 交易类
    app.use(global.base_url + "/myAccount", require("./trans"));

    // 个人中心
    app.use(global.base_url + "/account", require("./account"));
    //密码管理
    app.use(global.base_url + "/account/password", require("./password"));


    // 银行卡管理
    app.use(global.base_url + "/account/bankCard", require("./bankCard"));
    // 我的账户 暂无

    //宝宝类
    app.use(global.base_url + "/bao", require("./bao"));
    app.use(global.base_url + "/bao", require("./trans"));

    // 分类-公告/常见问题
    app.use(global.base_url + "/category", require("./category"));
    app.use(global.base_url + "/common", require("./common"));
    //定投管理 暂无

    //信任登录页面
    //if (constant.trust_login) {
        app.use("/", require("./trustlogin"));
        app.use(global.base_url + "/allinpay", require("./wechat"));
    // }


    // 关于通华
    app.use(global.base_url + "/aboutUs", require("./aboutUs"));

    //通用提示页面
    app.use(global.base_url + "/info", function(req, res) {
        if (req.session.info) {
            res.render("info", req.session.info);
        } else {
            res.redirect(global.base_url + "/index");
        }
    });
    // 404 page
    app.use(function(req, res) {
        if (!res.headersSent) {
            res.render('error');
        }
    });

};
