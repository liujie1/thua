/**
 * [RSA 签名验签]
 * @type {[type]}
 */
var crypto = require('crypto');
var fs = require("fs");
var path = require("path");
// var config = configLite.config;
// var configLite = require('config-lite');
// var config = configLite.config;
// var init_config = require(config.config_file_path + "/init_config.js");

var local_RSA_private_path = global.init_config.local_RSA_private_path;
var server_RSA_public_path = global.init_config.server_RSA_public_path;

var local_RSA_private = fs.readFileSync(__dirname + '/' + local_RSA_private_path).toString();
var server_RSA_public = fs.readFileSync(__dirname + '/' + server_RSA_public_path).toString();

var _ = require('lodash');

var privateFn = {
    disposeSignStr: function(params, timestamp) {
        var data = _.clone(params, true);
        var macArr = [];
        var timestamp = timestamp ? timestamp : new Date().getTime();
        for (var key in data) {
            if (!_.isObject(data[key]) && !_.isUndefined(data[key]) && data[key] !== "" && !_.isNaN(data[key])) {
                macArr.push({
                    name: key,
                    value: data[key]
                });
            }
        }
        macArr.sort(function(x, y) { //对fields排序
            return x.name.localeCompare(y.name);
        });
        var str = "";
        _.forEach(macArr, function(item) {
            str += item.value + "|";
        })
        str = str + timestamp;
        return {
            signStr: str,
            timestamp: timestamp
        }
    }
}
var publicFn = {
    sign: function(signStr) {
        var sign = crypto.createSign('RSA-SHA1');
        sign.update(signStr, 'utf8');
        return sign.sign(local_RSA_private).toString('base64');
    },
    disposeSignStr: privateFn.disposeSignStr,
    verify: function(str, signature) {
        var verify = crypto.createVerify('RSA-SHA1');
        verify.update(str, 'utf8');
        return verify.verify(server_RSA_public, signature, "base64");
    }
};
/**
 * 测试
 * @type {Object}
 */
var params = {
    a: "00",
    b: "aa",
    c: "ss"
}
var data = privateFn.disposeSignStr(params);
var signStr = data.signStr;
var timestamp = data.timestamp;
var signature = publicFn.sign(signStr);
console.log(signStr);
console.log(signature);
console.log(publicFn.verify(signStr, signature));


module.exports = publicFn;
