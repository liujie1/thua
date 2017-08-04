var express = require('express');
var router = express.Router();

var configLite = require('config-lite');

var _ = require('lodash');

// 高亮当前菜单
router.get("*", function(req, res, next) {
    console.log('当前URL为-------------------:', req.url);
    console.log('当前用户IP:', req.ip);
    console.log('当前session generate_id:', req.session.keys.generate_id);
    console.log('当前用户等级为:', req.session.user ? '用户' : '游客');

    //console.log('当前path为-------------------:',req.path);

    var reg = new RegExp("^(" + global.base_url + ")(\/account|\/index|\/funds|\/aboutUs|\/trans|\/info|\/login|\/bao|\/myAccount)\S*?", "i");
    if (reg.test(req.url)) {
        var menus = req.url.split("/");
        var back_url = req.baseUrl + req.url;
        if(req.session.backUrlList){
            req.session.backUrlList.push(back_url);
        } else {
            req.session.backUrlList = [];
            req.session.backUrlList.push(back_url);
        }
        // req.session.backUrlList.reverse();
        // console.log(req.session.backUrlList);
        // todo: remove方法对当前menus做操作，返回修改后的menus
        // 移除空数组元素
        _.remove(menus, function(item) {
            return !item || new RegExp(item, "g").test(global.base_url);
        });
        menus = _.map(menus, function(item) {
            return item.indexOf("?") > 1 ? item.substring(0, item.indexOf("?")) : item;
        });
        // menus.shift();
        // todo: filter返回新的array
        // menus = _.filter(menus, function(item) {
        //     return item;
        //     // return item!='';
        //     // return item ? true : false;
        // });

        // todo: 注意,flash可用是因为app.js引用了connect-flash中间件
        console.log(menus);
        req.flash("menus", menus);
        console.log('转换后的菜单数组为-------------------：', menus);
    }
    next();
});

module.exports = router;
