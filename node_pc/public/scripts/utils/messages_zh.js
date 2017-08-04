(function (factory) {
    if (typeof define === "function" && define.amd) {
        define(["jquery", "loading", "utils", "jquery-validate/jquery.validate", "microdone", "microdone1"], factory);
    } else {
        factory(jQuery, loading, utils);
    }
}(function ($, loading, utils) {
    /*
     * Translated default messages for the jQuery validation plugin.
     * Locale: ZH (Chinese, 中文 (Zhōngwén), 汉语, 漢語)
     */

    var messages = {
        mobile: "请输入11位手机号码",
        verification_code: "请输入6位数字验证码",
        login_password: "请输入6-16位账号密码",
        payPwd: "请输入6位数字交易密码",
        is_agree: "请点击同意协议",
        captcha: "请输入4位数字验证码",
        account: "请输入用户名",
        loginFirstPwd: "请设置您的6-16位账号密码",
        payFirstPwd: "请设置您的6位数字交易密码",
        loginLastPwd: "两次密码输入不一致",
        cust_name: "请输入姓名",
        id_code: "请输入身份证号码"
    }

    var isShowTips = false;
    // $.validator.prototype.showLabel = function(element, message) {
    //     // if (isShowTips) return;
    //     // isShowTips = true;
    //     // $(element).tooltipsShow({ position: "bottom", message: message });
    // }

    $.validator.setDefaults({
        event: "keyup", //触发校验的方式，可选值有keyup(每次按键时)，blur(当控件失去焦点时)
        debug: false, //如果这个参数为true，那么表单不会提交，只进行检查，调试时十分方便.
        focusInvalid: true,
        errorElement: "p",
        messages: {
            mobile: {
                required: messages.mobile,
                maxlength: messages.mobile,
                minlength: messages.mobile
            },
            verification_code: {
                required: messages.verification_code,
                number: messages.verification_code,
                minlength: messages.verification_code,
                maxlength: messages.verification_code
            },
            login_password: {
                required: messages.login_password,
                number: messages.login_password,
                minlength: messages.login_password, //messages.login_password,
                maxlength: messages.login_password
            },
            is_agree: {
                required: messages.is_agree,
                number: messages.is_agree,
                minlength: messages.is_agree,
                maxlength: messages.is_agree
            },
            captcha: {
                required: messages.captcha,
                number: messages.captcha,
                minlength: messages.captcha,
                maxlength: messages.captcha
            },
            account: {
                required: messages.account,
                max: $.validator.format("最多可赎回 {0} 份")
            },
            account1: {
                required: "请输入金额",
                max: $.validator.format("最多可赎回 {0} 份")
            },
            loginFirstPwd: {
                required: messages.loginFirstPwd,
                number: messages.loginFirstPwd,
                minlength: messages.loginFirstPwd,
                maxlength: messages.loginFirstPwd
            },
            loginLastPwd: {
                required: "请再次输入密码",
                equalTo: "两次密码输入不一致"
            },
            payFirstPwd: {
                required: messages.payFirstPwd,
                number: messages.payFirstPwd,
                minlength: messages.payFirstPwd,
                maxlength: messages.payFirstPwd
            },
            payLastPwd: {
                required: "请再次输入密码",
                equalTo: "两次密码输入不一致"
            },
            cust_name: {
                required: messages.cust_name
            },
            pay_password: {
                required: "请输入交易密码",
                maxlength: "请输入正确的交易密码",
                minlength: "请输入6位数字交易密码",
                number: "请输入6位数字交易密码"
            },
            idCard: {
                required: messages.id_code
            },
            id_code: {
                required: messages.id_code
            },
            card_no: {
                required: "请输入银行卡号码",
                number: "您输入的银行卡号码不正确",
                minlength: "您输入的银行卡不正确，请检查号码位数",
                maxlength: "您输入的银行卡号码不正确"
            },
            amount: {
                required: "请输入金额"
            },
            account: {
                required: "请输入有效数字"
            },
            custlogname: {
                required: "请输入用户名"
            },
            email: {
                required: "请输入邮箱地址"
            },
            riskcheckbox: {
                required: "请勾选该选项"
            },
            bkact_fncacct: {
                required: "请选择支付方式"
            }
        }
    });

    $.extend($.validator.messages, {
        required: "这是必填字段",
        remote: "请修正此字段",
        email: "请输入有效的电子邮件地址",
        url: "请输入有效的网址",
        date: "请输入有效的日期",
        dateISO: "请输入有效的日期 (YYYY-MM-DD)",
        number: "请输入有效的数字",
        digits: "只能输入数字",
        creditcard: "请输入有效的信用卡号码",
        equalTo: "你的输入不相同",
        extension: "请输入有效的后缀",
        maxlength: $.validator.format("最多可以输入 {0} 个字符"),
        minlength: $.validator.format("最少要输入 {0} 个字符"),
        rangelength: $.validator.format("请输入长度在 {0} 到 {1} 之间的字符串"),
        range: $.validator.format("请输入范围在 {0} 到 {1} 之间的数值"),
        max: $.validator.format("请输入不大于 {0} 的数值"),
        min: $.validator.format("请输入不小于 {0} 的数值")
    });

    /** 自定义验证 **/
    var methods = {
        idCode: function (value) {
            return /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X|x)$/.test(value);
        },
        tranNum: function (value) {
            return /^\d+(\.\d{1,2})?$/.test(value);
        },
        tranNum_message: "请输入正确的金额",
        idCode_message: "您输入的身份证号不正确",
        amount: function (value, el, args) {
            return value - args >= 0;
        },
        amount_message: $.validator.format("最低起购金额为{0}"),
        account: function (value, el, args) {
            return value - args <= 0;
        },
        account_message: $.validator.format("该卡可提现金额为{0}元，输入金额超出"),
        account1: function (value, el, args) {
            return value - args <= 0;
        },
        account1_message: $.validator.format("该卡可赎回份额为{0}，输入份额超出"),

        email: function (value) {
            return /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(value);
        },
        email_message: "请输入正确的邮箱地址",
        phone: function (value) {
            return /^1[34578]\d{9}$/.test(value);
        },
        phone_message: "请输入正确的手机号",
        pwd: function (value) {
            return /((?=.*[A-Za-z])(?=.*\d)|(?=[A-Za-z])(?=.*[.#@!~%^&*])|(?=.*\d)(?=.*[.#@!~%^&*]))[A-Za-z\d.#@!~%^&*]{6,16}/.test(value);
        },
        pwd_message: "密码等级太低，请重新输入",
        checkprovice: function (value) {
            return !(value === '省份' || value === '地级市');
        },
        checkprovice_message: "请选择地址",
        checkSelect: function (value) {
            return value !== '00';
        },
        checkSelect_message: "请选择其中一项",
        risk: function(value){
            return value
        },
        risk_message: "请选择其中一项"

    };

    for (var key in methods) {
        $.validator.addMethod(key, methods[key], methods[key + "_message"]);
    }

    $.fn.formMsg = function () {
        var tip = $('<div class="tip-error form-tip" id="_tip"><i></i></div>');
        var btn = $('<button class="close-btn" type="button"></button>');
        var text = $("<span id='tip_text'></span>");
        tip.css("display", "none");
        btn.click(function () {
            $(this).parent().fadeOut();
        });
        tip.append(text).append(btn);
        $(this).prepend(tip);
        return {
            show: function (msg) {
                $("#tip_text").text(msg);
                $("#_tip").fadeIn();
            },
            close: function () {
                $("#_tip").fadeOut();
            }
        }
    }

    // 绑定关闭提示按钮事件
    $("#tipCloseBtn").on('click', function () {
        $(this).parent().fadeOut();
    });
    $("#loginTipClose").on('click', function () {
        $(this).parents(".login-tip").fadeOut();
    });

    return {
        initForm: function ($form, loadingMsg, submitHandler) {
            var message = $form.formMsg();
            // $form.append($('<input type="hidden" name="head_signature" value=""/>'));
            // $form.append($('<input type="hidden" name="head_timestamp" value=""/>'));
            var form = $form.validate({
                submitHandler: function (form) {
                    var fields = utils.serialize($(form));
                    //判断验证码是否获取
                    if (('smslog_serno' in fields) && !fields.smslog_serno) {
                        message.show("请先获取短信验证码!");
                        return false;
                    }
                    // alert(JSON.stringify(fields));
                    if (('emailog_serno' in fields) && !fields.emailog_serno) {
                        message.show("请先获取邮箱验证码!");
                        return false;
                    }
                    var srand = $('input[name="random_num"]').val();
                    if (('payFirstPwd' in fields) && fields.payFirstPwd) {
                        var mingwen = $('input[name="payFirstPwd"]').val();
                        $('input[name="payFirstPwd"]').val(SM2_Encrypt2(mingwen, sm2KeyHex, "1", srand, false));
                    }
                    if (('payLastPwd' in fields) && fields.payLastPwd) {
                        var mingwen = $('input[name="payLastPwd"]').val();
                        $('input[name="payLastPwd"]').val(SM2_Encrypt2(mingwen, sm2KeyHex, "1", srand, false));
                    }
                    if (('pay_password' in fields) && fields.pay_password) {
                        var mingwen = $('input[name="pay_password"]').val();
                        $('input[name="pay_password"]').val(SM2_Encrypt2(mingwen, sm2KeyHex, "1", srand, false));
                    }
                    if ($.isFunction(submitHandler)) {
                        return submitHandler(form)
                    }
                    if (utils.browser() != "Safari") {
                        loading(loadingMsg);
                    }
                    // $(form).deserialize(res);
                    return true;
                }
            });
            $form.find("input").each(function () {
                var msg = $(this).attr("error-msg");
                if (msg) {
                    $(this).focus();
                    form.showLabel($(this), msg);
                }
            });

            return form;
        },
        showErrMsg: function (msg) {
            text.text(msg);
            tip.fadeIn();
        }
    }
}));
