var configLite = require('config-lite');
var config = configLite.config;
var init_config = require(config.config_file_path + "/init_config");
var dict = require(config.config_file_path + "/dict.js");
var runtime_config = require(config.config_file_path + "/runtime_config");
var listener = require("./models/listener").listener;

global.base_url = init_config.base_url;
global.init_config = init_config;
global.runtime_config = runtime_config;
global.dict = dict;
listener(config.config_file_path, init_config.file_path);

var path = require('path');
var express = require('express');
var session = require('express-session');
var flash = require('connect-flash');
var routes = require('./routers/root');
var winston = require('winston');
var expressWinston = require('express-winston');
var bodyParser = require('body-parser');
var navigation = require("./middlewares/navigation");
var syncKey = require("./middlewares/syncKey");
var loadServeConfig = require("./middlewares/loadServeConfig")
var filter = require('./models/fieldFilter');
var _ = require('lodash');

var app = express();

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
// app.use()

// 设置模板目录
app.set('views', path.join(__dirname, 'views'));
// 设置模板引擎为 ejs
app.set('view engine', 'ejs');

//解决跨域问题
app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "access-control-allow-origin, Origin, No-Cache, X-Requested-With, If-Modified-Since, Pragma, Last-Modified, Cache-Control, Expires, Content-Type, X-E4M-With, authorization, SESSIONID");
    res.header("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS");
    res.header("X-Powered-By", ' 3.2.1');
    if (req.method == "OPTIONS") {
        res.send(200);/*让options请求快速返回*/
    } else {
        next();
    }
});

// 设置静态文件目录
app.use(init_config.base_url, express.static(path.join(__dirname, 'public')));
//H5页面
app.use(express.static(path.join(__dirname, 'wap')));
// session 中间件
app.use(session({
    resave: true,
    saveUninitialized: false,
    name: config.session.key, // 设置 cookie 中保存 session id 的字段名称
    secret: config.session.secret, // 通过设置 secret 来计算 hash 值并放在 cookie 中，使产生的 signedCookie 防篡改
    cookie: {
        maxAge: config.session.maxAge // 过期时间，过期后 cookie 中的 session id 自动删除
    }
}));
// flash 中间价，用来显示通知
app.use(flash());
app.use(syncKey);
app.use(navigation);
app.use(loadServeConfig);

// // 设置模板全局常量
// app.locals.static = {
//     title: global.runtime_config.header.title
// };

// 添加模板必需的变量
app.use(function(req, res, next) {
    // req.session.user = req.session.user || {};
    res.locals.static = {
        title: global.runtime_config.header.title
    };
    res.locals.backUrlList = (_.clone(req.session.backUrlList) || []).reverse(),
    res.locals.user = req.session.user;
    res.locals.serveConfig = global.serveConfig || {};
    res.locals.success = req.flash('success').toString();
    res.locals.error = req.flash('error').toString();
    var errorMsg = req.flash('errorMsg')[0];
    var fields = req.flash('fields')[0];
    res.locals.menus = req.flash('menus');
    res.locals.errorMsg = errorMsg ? errorMsg : {};
    res.locals.fields = fields ? fields : {};
    res.locals.cannotGetCode = req.flash('cannotGetCode');
    res.locals.constant = _.assign(global.runtime_config, global.init_config);
    res.locals.filter = filter;
    res.locals.dict = dict;
    res.locals.moment = require('moment');
    res.locals.trust_timeout_dialog_show = req.flash('trust_timeout_dialog_show').toString(); //true 显示弹框 false 不显示
    res.locals.logout_dialog_show = req.flash('logout_dialog_show').toString(); //true 显示弹框 false 不显示
    next();
});
// 正常请求的日志
// app.use(expressWinston.logger({
//     msg: "user IP: {{req.ip}}",
//     transports: [
//         // new (winston.transports.Console)({
//         //   json: true,
//         //   colorize: true
//         // }),
//         new winston.transports.File({
//             filename: 'logs/success.log'
//         })
//     ]
// }));

// 路由
routes(app);
// app.use(constant.base_url, routes);

// 错误请求的日志
// app.use(expressWinston.errorLogger({
//     transports: [
//         new winston.transports.Console({
//             json: true,
//             colorize: true
//         }),
//         new winston.transports.File({
//             filename: 'logs/error.log'
//         })
//     ]
// }));

app.use(function(err, req, res, next) {
    res.render('error', {
        error: err
    });
});


// if (module.parent) {
//   module.exports = app;
// } else {
//   // 监听端口，启动程序
//   app.listen(config.port, function () {
//     console.log(`${pkg.name} listening on port ${config.port}`);
//   });
// }
app.listen(init_config.port, function() {
    console.log(`${global.runtime_config.header.title} listening on port ${global.init_config.port}`);
});
