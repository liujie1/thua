var resource = require('../models/resource');

// 保存URL中间件
module.exports = {
    saveBaseUrl: function saveBaseUrl(req, res, next) {
        console.log('URL为：',req.baseUrl);
        // res.locals.backUrl = req.headers.referer;
        res.locals.baseUrl = req.baseUrl;
        next();
    },
    saveCategoryListUrl: function saveCategoryListUrl(req, res, next) {
        var baseUrl = req.baseUrl;
        var currentUrl = req.url;
        var splitIndex = currentUrl.lastIndexOf('/');
        res.locals.backListUrl = baseUrl + currentUrl.substring(0,splitIndex);
        console.log('分类列表URL为：',res.locals.backListUrl);
        next();
    }
};
