/**
 *  公共请求工具类
 */

define(['jquery',
    'lodash',
    'moment',
    'constant',
    'encrypt',
    'json2',
], function($,
    _,
    moment, constant, encryptObj) {
    // var httpServeUrl = "http://10.2.9.220:8080/jbtgate/self";
    // var httpServeUrl = "http://1406b848.all123.net:8080/p2pgate/self";
    var httpServeUrl = constant.base_url; //"http://localhost:30002/data";

    //拦截器
    var interceptor = {
        //加密请求参数  参数签名
        encryRequest: function(reqParams, key) {},
        //解密返回参数  参数验签
        decryResponse: function(result) {}
    };

    var httpRequest = {
        get: function() {
            // syncReq(httpServeUrl,'GET', defaultParams)
        },
        post: function(url, params) {
            return syncReq(url, 'POST', params);
        },
        getToken: function() {
            //发送获取token的请求;
            var deferred = $.Deferred();
            var errCount = 0;
            (function getFn(deferred) {
                httpRequest.post("/common/getToke").then(function(data) {
                    if (data.respHead.head_rtn_code == "000000") {
                        deferred.resolve(data.respBody.token);
                    } else {
                        if (errCount++ < 2) {
                            getToken(deferred);
                        } else {
                            // console.info("获取token失败");
                            deferred.reject();
                        }
                    }
                }, function() {
                    if (errCount++ < 2) {
                        getToken(deferred);
                    } else {
                        // console.info("获取token失败");
                        deferred.reject();
                    }
                })
            })(deferred);
            return deferred.promise();
        }
    };

    // 默认参数
    function initParams(params) {
        var defaultParams = {
            reqHead: {
                head_channel_code: "0", //渠道代码
                head_channel_code_sub: "00", //子渠道代码
                head_channel_date: moment().format("YYYYMMDD"), //渠道日期
                head_channel_time: moment().format("HHmmss"), //渠道时间
                head_channel_serno: "", //渠道流水号
                head_sub_branch_code: "", //交易机构
                head_tran_code: params.head_tran_code || "", //交易代码
                head_sign_time: params.head_sign_time || "", //加签时间戳
                head_signature: "", //签名
                head_token: params.token || "", //令牌
                sessionid: ""
            },
            reqBody: _.assign({}, _.omit(params, ['token', 'head_tran_code', 'head_sign_time']))
        };
        // 移除多余属性
        // defaultParams = _.omit(defaultParams.reqBody, ['token', 'head_tran_code', 'head_sign_time']);
        return _.clone(defaultParams);
    }

    // 异步请求方法
    function syncReq(reqUrl, reqMethod, data) {
        var params = _.clone(data, true);
        var deferred = $.Deferred();
        // interceptor.encryRequest(params).done(function(reqParams) {
        //     console.log("test",JSON.stringify(reqParams));
        //     $.ajax({
        //         method: reqMethod, // 请求方法,'POST|GET'
        //         url: httpServeUrl, // 请求URL
        //         data: JSON.stringify(reqParams), //发送服务器数据
        //         dataType: 'json', // 返回格式
        //         // accept: "application/json, text/plain, */*",
        //         contentType: "application/json;charset=utf-8"
        //     }).done(function(result) {
        //         interceptor.decryResponse(result).done(function(data) {
        //             //成功回调
        //             console.log('suc');
        //             console.log(data);
        //             deferred.resolve(data);
        //         }).fail(function(){
        //             //验签失败
        //         });
        //     }).fail(function() {
        //         //失败回调
        //         console.log('err')
        //         deferred.reject();
        //     }).always(function() {
        //         //请求完成
        //         console.log('complete')
        //     })
        // });
        params = params || {};
        // var hmac = encryptObj.hmacMd5(params);
        // params.head_signature = hmac.macStr;
        // params.head_timestamp = hmac.timestamp;
        // console.log(base_url + reqUrl);
        $.ajax({
            method: reqMethod, // 请求方法,'POST|GET'
            url: base_url + reqUrl, // 请求URL
            data: JSON.stringify(params), //发送服务器数据
            dataType: 'json', // 返回格式
            // accept: "application/json, text/plain, */*",
            contentType: "application/json;charset=utf-8"
            // timeout: 10000
        }).done(function(result) {
            // console.log(arguments)
            if (_.isNumber(result)) {
                return window.location.href = encodeURI("/error?error" + "服务器错误,错误代码:" + result);
            }
            deferred.resolve(result);
        }).fail(function(err) {
            //失败回调
            // console.log('err')
            // deferred.reject();
            // console.log(arguments)
            if (err.status == 401) {
                return window.location.href = base_url + "/login";
            }
        }).always(function(err) {
            //请求完成
            // console.log('complete')
            // console.log(arguments)
        })
        return deferred;
    }

    // 返回http请求方法
    return httpRequest;
});
