/**
 * 加载服务器配置项
 * 获取渠道参数配置
 */
var resource = require('../models/resource');

module.exports = function (req, res, next) {
    if (!req.session.serveConfig || !req.session.serveConfig.flag) {
        console.log("=============加载渠道参数配置==============");
        req.session.serveConfig = {
            flag: true
        };
        resource.post({
            head_tran_code: "P00006"
        }, req.session.keys).then(function (data) {
            if (data.respHead.head_rtn_code == "000000") {
                global.serveConfig = data.respBody;
                console.log("渠道参数配置:", global.serveConfig);
            }
        });
    }
    next();
}
