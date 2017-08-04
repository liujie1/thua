var Promise = require('promise');
var configLite = require('config-lite');
var moment = require("moment");
var config = configLite.config;
var _ = require('lodash');
var request = require('request');
var RSASign = require("../models/RSASign");

var _httpObj = {
    //请求参数初始化
    initParams: function (params, keys) {
        if(!params) return;
        var defaultParams = {
            reqHead: {
                head_channel_code: params.head_channel_code || runtime_config.head_channel_code, //渠道代码
                head_channel_code_sub: params.head_channel_code_sub || runtime_config.head_channel_code_sub, //子渠道代码
                head_channel_date: moment().format("YYYYMMDD"), //渠道日期
                head_channel_time: moment().format("HHmmss"), //渠道时间
                head_channel_serno: "", //渠道流水号
                head_sub_branch_code: "", //交易机构
                head_tran_code: params.head_tran_code || "", //交易代码
                sub_sysmbcode: "00", //00基金01黄金02保险
                head_signature: "", //签名
                timestamp: "", //加签时间戳
                head_token: params.token || "", //令牌
                sessionid: keys.sessionid || ""
            },
            reqBody: ""
        };
        var reqBody = _.assign({}, _.omit(params, ['token', 'head_tran_code', 'head_sign_time', 'head_channel_code', 'head_channel_code_sub']));
        //老-hmac 签名
        // var hmac = encryptFactory.hmacMd5(reqBody);
        // defaultParams.reqHead.head_signature = hmac.macStr;
        // defaultParams.reqHead.timestamp = hmac.timestamp;
        var filterParams = {}
        _.forEach(reqBody, function (n, key) {
            if (n && n !== 'undefined') {
                filterParams[key] = n;
            };
        })
        reqBody = filterParams;

        //新-RSA 签名
        var data = RSASign.disposeSignStr(reqBody);
        var signStr = data.signStr;
        var timestamp = data.timestamp;
        console.log("签名明文:", signStr);
        var signature = RSASign.sign(signStr);
        console.log("签名密文:", signature);
        defaultParams.reqHead.head_signature = signature;
        defaultParams.reqHead.timestamp = timestamp;

        defaultParams.reqBody = reqBody;
        return _.clone(defaultParams);
    },
    //异步请求
    syncReq: function (reqUrl, reqMethod, reqParams, keys) {
        return new Promise(function (resolve, reject) {
            console.log("==================****请求****==================");
            console.log("请求时间:", moment().format("YYYY-MM-DD HH:mm:ss:SSS"));
            console.log("请求地址", reqUrl);
            console.log("请求参数", reqParams);
            console.log("==================END*请求*END==================");
            var options = _.assign(config.fetchOptions, {
                method: reqMethod,
                body: reqParams,
                url: reqUrl,
                json: true
            });
            if (keys && keys.sessionid) {
                options.headers.SESSIONID = keys.sessionid;
            }
            function callback(error, response, result) {
                if (!error && response.statusCode == 200) {
                    var head_signature = result.respHead.head_signature;
                    //老hmac 验签
                    // var hmac = encryptFactory.hmacMd5(result.respBody, reqParams.reqHead.timestamp);
                    // var macStr = hmac.macStr;
                    // if (macStr == head_signature) {
                    //     console.log("====验签成功");
                    // } else {
                    //     console.log("====验签失败");
                    // }
                    //新 RSA 验签
                    var data = RSASign.disposeSignStr(result.respBody, reqParams.reqHead.timestamp);
                    var signStr = data.signStr;
                    console.log("==================****响应****==================");
                    console.log("响应时间:", moment().format("YYYY-MM-DD HH:mm:ss:SSS"));
                    console.log("请求地址:", reqUrl);
                    console.log("响应结果:", result);
                    console.log("==================END*响应*END==================");
                    if (RSASign.verify(signStr, head_signature)) {
                        console.log("====本地验签成功");
                    } else {
                        console.log("====本地验签失败,本地验签明文:", signStr);
                    }
                    resolve(result);
                } else if (error) {
                    console.log("====", error);
                    reject("服务器崩溃了");
                } else {
                    if (response.statusCode == 401) {
                        try {
                            console.log('[session generate_id:' + keys.generate_id + ']', '后台用户session过期', response.statusCode);
                        } catch (error) {
                            
                        }    
                    }
                    reject(response.statusCode);
                }
            }
            request(options, callback);
        })
    }
}
var publicMethod = {
    post: function (params, keys) {
        var reqParams = _httpObj.initParams(params, keys);
        var uri = config.uris[params.head_tran_code];
        var url = init_config.httpUrl + uri;
        return _httpObj.syncReq(url, "POST", reqParams, keys);
    },
    syncReq: _httpObj.syncReq
};

module.exports = publicMethod;
