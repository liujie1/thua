define(['lodash', "moment", "jquery"], function (_, moment, $) {
    var utilsObj = {};
    // 倒计时
    utilsObj.countdown = function (timer) {
        var temp = timer;
        var interval;
        return {
            run: function (callback, cancelCallback) {
                var that = this;
                if (interval) return;
                callback(--timer);
                interval = setInterval(function () {
                    callback(--timer);
                    if (timer <= 0) {
                        timer = temp;
                        that.cancel(cancelCallback);
                    }
                }, 1000);
                return this;
            },
            cancel: function (callback) {
                window.clearInterval(interval);
                interval = null;
                if (callback) callback();
            }
        }
    };
    // 隐藏手机号
    utilsObj.hidePhone = function (str) {
        return str.substr(0, 3) + "****" + str.substr(str.length - 4, str.length);
    };
    // 数组转json
    utilsObj.ary2Json = function (ary) {
        var obj = {};
        _.forEach(ary, function (n) {
            obj[n.name] = n.value;
        });
        return obj;
    };
    //时间字符串 转 时间 字符串
    utilsObj.str2date = function (string, format) {
        return moment(string, format);
    };
    utilsObj.dateStr2DateStr = function (string, format, outFormat) {
        if (!string) return "--";
        return moment(string, format).format(outFormat);
    };
    utilsObj.subtractStr = function (number, string, format) {
        return moment(number, string).format(format);
    };
    //金额格式化
    /**
     * 修改为3个参数
     * @param symbol 为传入的符号
     */
    utilsObj.currency = function (val, decimals, symbol) {
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
    };
    //百分比
    utilsObj.percent = function (val, decimals) {
        if (!val) return "0.00";
        decimals = decimals ? decimals : 2;
        console.log(val, decimals, _.round(val, decimals));
        return (val * 100).toFixed(decimals);
    };
    //保留小数
    utilsObj.retainDecimal = function (val, decimals) {
        if (!val) return "0.00";
        decimals = decimals ? decimals : 2;
        return val.toFixed(decimals);
    };
    utilsObj.hideEmail = function (val) {
        var prefix = val.substring(0, val.indexOf("@"));
        var suffix = val.substring(val.indexOf("@"), val.length);
        if (prefix.length > 7) {
            return prefix.substr(0, 3) + "****" + prefix.substr(-4, 4) + suffix;
        } else {
            return prefix.substr(0, 1) + "****" + suffix;
        }
    };
    utilsObj.hideCard = function (val) {
        if (!val) return "";
        return val.substr(0, 4) + " **** **** " + val.substr(val.length - 4, val.length);
    };
    utilsObj.passwordStrong = function (val) {
        //密码为八位及以上并且字母数字特殊字符三项都包括
        var strongRegex = new RegExp("^(?=.{8,})(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*\\W).*$", "g");
        //密码为七位及以上并且字母、数字、特殊字符三项中有两项，强度是中等
        var mediumRegex = new RegExp("^(?=.{6,})(((?=.*[A-Za-z])(?=.*[0-9]))|((?=.*[A-Za-z])(?=.*[.#@!~%^&*]))|((?=.*[0-9])(?=.*[.#@!~%^&*]))).*$", "g");
        var enoughRegex = new RegExp("(?=.{6,}).*", "g");
        if (false == enoughRegex.test(val)) {
            return 0; //低
        } else if (strongRegex.test(val)) {
            return 2; //高
        } else if (mediumRegex.test(val)) {
            return 1; //中
        } else {
            return 0; //低
        }
    };
    /**
     * 序列化表单元素为JSON对象
     * @param form          Form表单id或表单jquery DOM对象
     * @returns {}
     */
    utilsObj.serialize = function ($form) {
        // var $form = (typeof(form) == "string" ? $("#" + form) : form);
        var dataArray = $form.serializeArray();
        var result = {};
        $(dataArray).each(function () {
            //如果在结果对象中存在这个值，那么就说明是多选的情形。
            if (result[this.name] && _.isArray(result[this.name])) {
                //多选的情形，值是数组，直接push
                alert(JSON.stringify(result[this.name]))
                result[this.name].push(this.value);
            } else {
                //获取当前表单控件元素
                var element = $form.find("[name='" + this.name + "']")[0];
                //获取当前控件类型
                var type = (element.type || element.nodeName).toLowerCase();
                //如果控件类型为多选那么值就是数组形式，否则就是单值形式。
                result[this.name] = (/^(select-multiple|checkbox)$/i).test(type) ? [this.value] : this.value;
            }
        });
        return result;
    };
    utilsObj.getQueryString = function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return ""; //返回参数值
    };
    utilsObj.browser = function () {
        var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
        var isOpera = userAgent.indexOf("Opera") > -1;
        if (isOpera) {
            return "Opera"
        }; //判断是否Opera浏览器
        if (userAgent.indexOf("Firefox") > -1) {
            return "FF";
        } //判断是否Firefox浏览器
        if (userAgent.indexOf("Chrome") > -1) {
            return "Chrome";
        }
        if (userAgent.indexOf("Safari") > -1) {
            return "Safari";
        } //判断是否Safari浏览器
        if (userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1 && !isOpera) {
            return "IE";
        }; //判断是否IE浏览器
    };
    //获取ie版本号
    utilsObj.getIEVersion = function () {
        if (utilsObj.browser() == "IE") {
            var browser = navigator.appName
            var b_version = navigator.appVersion
            var version = b_version.split(";");
            var trim_Version = version[1].replace(/[ ]/g, "");
            if (browser == "Microsoft Internet Explorer" && trim_Version == "MSIE6.0") {
                return 6;
            }
            else if (browser == "Microsoft Internet Explorer" && trim_Version == "MSIE7.0") {
                return 7;
            }
            else if (browser == "Microsoft Internet Explorer" && trim_Version == "MSIE8.0") {
                return 8;
            }
            else if (browser == "Microsoft Internet Explorer" && trim_Version == "MSIE9.0") {
                return 9;
            }
        } else {
            return null;
        }
    };
    //获取32位随机数
    utilsObj.getNum = function (name) {
        var chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
        var nums = "";
        for (var i = 0; i < 32; i++) {
            var id = parseInt(Math.random() * 61);
            nums += chars[id];
        }
        return nums;
    };
    utilsObj.isSupportPlaceholder = function () {
        var input = document.createElement('input');
        return 'placeholder' in input;
    };
    utilsObj.input = function (obj, val) {
        var $input = obj;
        var val = val;
        if (!$input.val()) {
            $input.attr({
                value: val
            });
        } else {
            $(this).attr({
                value: $input.val()
            });
        }

        function placefocus() {
            if ($input.val() == val) {
                $(this).attr({
                    value: ""
                });
            }
        }
        function placeblur() {
            if ($input.val() == "") {
                $(this).attr({
                    value: val
                });
            }
        }
        $input.off('focus');
        $input.off('blur');
        $input.focus(placefocus).blur(placeblur);
    };
    utilsObj.placeholderable = function () {
        $(function () {
            // 如果不支持placeholder，用jQuery来完成
            if (!utilsObj.isSupportPlaceholder()) {
                // 遍历所有input对象, 除了密码框
                $('input').not("input[type='password']").each(
                    function () {
                        var self = $(this);
                        var val = self.attr("placeholder");
                        utilsObj.input(self, val);
                    }
                );

                /**
                 14          *  对password框的特殊处理
                 15          * 1.创建一个text框
                 16          * 2.获取焦点和失去焦点的时候切换
                 17          */
                $('input[type="password"]').each(
                    function () {
                        var pwdField = $(this);
                        var pwdVal = pwdField.attr('placeholder');
                        pwdVal = pwdVal ? pwdVal : "";
                        var pwdId = pwdField.attr('id');
                        var pwdClass = pwdField.attr("class");
                        var name = pwdField.attr("name");
                        var cloneInput = $('<input required placeholder="' + pwdVal + '" name="' + name + '" id="' + pwdId + '1" class="' + pwdClass + '" type="text" value="' + pwdVal + '"/>');
                        cloneInput.attr("minlength", pwdField.attr("pwdField"));
                        cloneInput.attr("maxlength", pwdField.attr("maxlength"));
                        if (pwdField.attr("pwd")) {
                            cloneInput.attr("pwd", pwdField.attr("pwd"));
                        }
                        if (pwdField.attr("number")) {
                            cloneInput.attr("number", pwdField.attr("number"));
                        }
                        if (pwdField.attr("error-msg")) {
                            cloneInput.attr("error-msg", pwdField.attr("error-msg"));
                        }
                        // 重命名该input的id为原id后跟1
                        pwdField.after(cloneInput);
                        var pwdPlaceholder = $('#' + pwdId + '1');
                        pwdPlaceholder.show();
                        pwdField.hide();

                        pwdPlaceholder.focus(function () {
                            pwdPlaceholder.hide();
                            pwdPlaceholder.attr("disabled", true);
                            pwdField.show();
                            pwdField.focus();
                        });

                        pwdField.blur(function () {
                            if (pwdField.val() == '') {
                                pwdPlaceholder.attr("disabled", false);
                                pwdPlaceholder.show();
                                pwdField.hide();
                            }
                        });
                    }
                );
            }
        });
    };
    utilsObj.setPlaceholder = function (ele, str) {
        if (!utilsObj.isSupportPlaceholder()) {
            if ($(ele).val() === $(ele).attr("placeholder")) {
                $(ele).val("");
            }
            $(ele).attr("placeholder", str);
            utilsObj.input($(ele), str);
        } else {
            $(ele).attr("placeholder", str);
        }
    }
    return utilsObj;
});
