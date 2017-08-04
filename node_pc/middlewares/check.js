var resource = require('../models/resource');

// 检查用户是否登录中间件
module.exports = {
    checkLogin: function checkLogin(req, res, next) {
        if (!req.session.user) {
            // req.flash('error','未登录');
            if (global.runtime_config.trust_login) {
                req.flash('trust_timeout_dialog_show', "true")
                return res.redirect('back'); //返回之前的页面
            }
            console.log('[session generate_id:' + req.session.keys.generate_id + ']' + "用户未登陆,请登录后再操作");
            return res.render("components/login");
        }
        next();
    },
    checkNotLogin: function checkNotLogin(req, res, next) {
        if (req.session.user) {
            //   req.flash('error','已登录');
            return res.redirect('back'); //返回之前的页面
        }
        next();
    },
    checkForgetPwdEntity: function(req, res, next) {
        if (!req.session.forgetPwdEntity) {
            //   req.flash('error','已登录');
            return res.redirect(global.base_url + '/account/password/readMobile'); //返回之前的页面
        }
        next();
    },
    checkBindCard: function(req, res, next) {

        if (req.session.user.is_bindcard == '00' || !req.session.user.is_bindcard) { //用户未绑卡

            var hrefLink = global.base_url + "/register/bindCard?is_bindCard=1";
            if (global.runtime_config.trust_login) {
                hrefLink = global.base_url + "/register/trustBind";
            }

            return res.render('info', {
                message: "系统检测到你未绑定银行卡,请先绑定后再继续操作",
                hrefLink: hrefLink,
                btnText: "去绑卡"
            });
        }
        next();
    },
    checkSetPayPwd: function(req, res, next) {
        if (req.session.user.is_settranspwd == '00' || !req.session.user.is_settranspwd) { //用户未设置交易
            return res.render('info', {
                message: "系统检测到你未设置交易密码,请先设置后再继续操作",
                hrefLink: global.base_url + "/register/setPayPwd?is_settranspwd=1",
                btnText: "去设置"
            });
        }
        next();
    }
};
