/*
   描述: 获取验证码
*/
define(['jquery', 'utils', 'httpRequest'], function($, utils, httpRequest) {
    $.fn.authCode = function(options) {
        var defaultOptions = {
            successCallback: $.noop,
            failCallback: $.noop,
            errorCallback: $.noop,
            clickCallback: $.noop
        };
        if (!options.url) return console.error("authCode plugin options has server's 'url' property!");
        $.extend(defaultOptions, options);
        return $(this).each(function() {
            var isGetCode = false;
            var countdown = utils.countdown(60);
            var that = $(this);
            $(this).click(function(event) {
                event.preventDefault();
                var custEvent = {
                    flag: false,
                    preventDefault: function() {
                        custEvent.flag = true;
                    }
                }
                defaultOptions.clickCallback(custEvent, defaultOptions.data);
                if (isGetCode || custEvent.flag) return;
                isGetCode = true;
                that.text("正在发送...").addClass("sending");
                httpRequest.post(defaultOptions.url, defaultOptions.data || {}).then(function(data) {
                    if (data.respHead.head_rtn_code == "000000") {
                        countdown.run(function(s) {
                            that.text("重新获取" + s + "s").addClass("sending");
                        }, function() {
                            that.text("获取验证码").removeClass("sending");
                            isGetCode = false;
                        });
                        defaultOptions.successCallback(data);
                    } else {
                        isGetCode = false;
                        that.text("获取验证码").removeClass("sending");
                        defaultOptions.errorCallback(data);
                    }
                }, function(error) {
                    isGetCode = false;
                    that.text("获取验证码").removeClass("sending");
                    defaultOptions.failCallback(error);
                })
            })
        });
    }
});
