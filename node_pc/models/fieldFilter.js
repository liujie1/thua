var _ = require('lodash');
var moment = require('moment');

var filterFactory = {
    currency: function (val, decimals, symbol) {
        var symbolStr = symbol || "";
        var arry = [];
        arry.length = decimals;
        var zero = _.map(arry, function (item) {
            return 0;
        }).join("");
        if (typeof val === 'undefined') {
            return '--'
        }

        if (!val) {
            return "0." + zero + symbolStr
        }

        var val = val + "";
        if (val.indexOf(".") == -1) {
            val += ".";
        }
        val = val + zero;
        var int = val.substring(0, val.indexOf("."));
        var f = val.substr(val.indexOf(".") + 1, decimals);
        int = int.replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g, '$&,');
        if (!int) {
            return 0 + "." + f + symbolStr;
        }
        return int + "." + f + symbolStr;
    },
    rcurrency: function (val) {
        return parseFloat(val.replace(/[^\d\.-]/g, ""));
    },
    percent: function (val, decimals) {
        if (!val) return "0.00";
        decimals = decimals ? decimals : 2;
        console.log(val, decimals, _.round(val, decimals));
        return val.toFixed(decimals);
    },
    hideEmail: function (val) {
        if (!val) return "";
        var prefix = val.substring(0, val.indexOf("@"));
        var suffix = val.substring(val.indexOf("@"), val.length);
        if (prefix.length > 7) {
            return prefix.substr(0, 3) + "****" + prefix.substr(-4, 4) + suffix;
        } else {
            return prefix.substr(0, 1) + "****" + suffix;
        }
    },
    hidePhone: function (val) {
        if (!val) return "";
        return val.substr(0, 3) + "****" + val.substr(-4, val.length);
    },
    hideCard: function (val) {
        if (!val) return "";
        return val.substr(0, 4) + " **** **** " + val.substr(-4, val.length);
    },
    hideIdCard: function (val) {
        if (!val) return "";
        return val.substr(0, 4) + " **** **** " + val.substr(-4, val.length);
    },

    hideName: function (val) {
        if (!val) return "";
        var suffix = "";
        for (var i = 1; i < val.length; i++) {
            suffix += "*";
        }
        return val.substr(0, 1) + suffix;
    },
    dateStr2DateStr: function (string, format, outFormat) {
        if (!string) return "--";
        console.log(string, format, outFormat);
        return moment(string, format).format(outFormat);
    },
    retainDecimal: function (val, decimals) {
        if (!val) return "0.00";
        decimals = decimals ? decimals : 2;
        return val.toFixed(decimals);
    },
    encodeStr: function (str) {
        if (!str) return "";
        str = str.replace(/\s+/g, "+")
        //str = str.replace(/\//g, "%2F").replace(/\?/g, "%3F").replace(/\#/g, "%23").replace(/\&/g, "%26").replace(/\=/g, "%3D").replace(/\+/g, "%2B").replace(/\\/g, "%5C");
        return str;
    },
    //交易类型过滤器
    tradeType: function (rowData) {
        //当baby_code空时，F30001为购买（business_code：020-认购 022-申购），F30002为赎回当baby_code不为空时，F30001为充值，F30002为取现（tranlog_redeemtype：00-快速取现 01-普通取现）
        if (rowData.busi_code == "F30001") {
            if (rowData.baby_code) {
                return "充值"
            }
            if (rowData.business_code == "020") {
                return "认购";
            }
            if (rowData.business_code == "022") {
                return "申购";
            }
        }
        if (rowData.busi_code == "F30002") {
            if (rowData.baby_code) {
                return "取现"
            }
            if (rowData.tranlog_redeemtype == "00") {
                return "快速取现";
            }
            if (rowData.tranlog_redeemtype == "01") {
                return "普通取现";
            }
        }
    }
}
module.exports = function (type) {
    return function () {
        var fn = filterFactory[type];
        if (_.isFunction(fn)) {
            return fn.apply(this, Array.prototype.slice.call(arguments));
        } else {
            return "";
        }
    }
};
