/**
 * 首页模块
 */
require(['../../commonConfig'], function () {
    require([
        'jquery',
        'httpRequest',
        'dialog',
        'message_zh',
        'utils',
        'slide',
        'marquee',
        'global_dialog_common',
        'PassGuardCtrl',
    ], function ($, httpRequest, dialog, validate, utils) {

        validate.initForm($("#loginForm"));
        // console.log(utils.getQueryString('goPage'))
        var goPage = utils.getQueryString('goPage');
        if (goPage) {
            $("input[name='goPage']").val(base_url + "/" + goPage);
        }

        // banner轮播
        var s = $("#slideBox").slide({
            titCell: ".slide-pagination ul",
            mainCell: ".slide-container ul",
            effect: "leftLoop",
            autoPlay: true,
            autoPage: true,
            interTime: 3500,
            trigger: "click",
            startFun: function (i, c, slider, titCell, mainCell, targetCell, prevCell, nextCell) {
                console.log(i);
            }
        });
        // var slideBoxBg = $("#slideBox-bg").slide({
        //     mainCell: ".slide-container ul",
        //     effect: "leftLoop",
        //     autoPlay: false,
        // });
        // console.log(slideBoxBg);

        //刷新图片验证码
        $("#imgCode").on("click", function () {
            httpRequest.post("/common/getImgCode").done(function (data) {
                if (data.respHead.head_rtn_code == "000000") {
                    $("input[name='captcha_serno']").val(data.respBody.captcha_serno);
                    $("#imgCode img").attr("src", "data:image/png;base64," + data.respBody.captcha_img);
                }
            })
        });
        $("#imgCode").trigger("click");

        //关闭滚动公告
        $(".close-btn").on("click", function () {
            $('.system-msg').slideUp().empty();
        });

        //获取焦点
        if (utils.getIEVersion() && utils.getIEVersion() < 8) {
            var lognameEl = $("input[name='custlogname']");
            var logname = lognameEl.val();
            lognameEl.val("").focus().val(logname);
        } else {
            var lognameEl = $("input[name='custlogname']");
            lognameEl.focus();
        }


        // var noticeModal = $("#noticeModal");
        // if (noticeModal.attr("is-show") == "true") {
        //     easyDialog.open({
        //         container: 'noticeModal'
        //     });
        // }

        var noticeModal = $("#dealModal");
        if (noticeModal.attr("is-show") == "true") {
            easyDialog.open({
                container: 'dealModal'
            });
        }

        var dealModal = $("#dealModal");
        if (dealModal.attr("is-show") == "true") {
            easyDialog.open({
                container: 'dealModal'
            });
        }

        // 初始化表单验证信息
        var form = validate.initForm($("#agreeForm"));

        // 添加checkbox样式
        $('.agree-btn').on('click', function () {
            if ($(this).attr("checked")) {
                $('.pretty-checkbox').removeClass('checked');
                $(this).removeAttr("checked");
            } else {
                $('.pretty-checkbox').addClass('checked');
                $(this).attr("checked", 'true');
            }
        });

        // $("#dialog-close-btn").click(function () {
        //     easyDialog.close();
        // });


        //*****密码控件*****
        var randomDef = $.Deferred();
        httpRequest.post("/common/getRandom").done(function (data) {
            if (data.respHead.head_rtn_code == "000000") {
                random_num = data.respBody.random_num;
                random_uuid = data.respBody.random_uuid;
                $("#random_uuid").val(random_uuid);
                randomDef.resolve(random_num);
            }
        })

        httpRequest.post("/common/getPgeRZ").done(function (data) {
            if (data.respHead.head_rtn_code == "000000") {
                pgeRZRandNum = data.respBody.pgeRZRandNum;
                pgeRZDataB = data.respBody.pgeRZDataB;
                pgeditor.settings.pgeRZRandNum = pgeRZRandNum;
                pgeditor.settings.pgeRZDataB = pgeRZDataB;
                console.log(data.respBody)
            }
        })

        var pgeditor = new $.pge({
            pgePath: base_url + "/ocx/", //控件下载目录，可以指定绝对路径，如"http://www.baidu.com/download/"
            pgeId: "_ocx_password", //控件id
            pgeEdittype: 0, //控件显示类型,0(星号),1(明文)
            pgeEreg1: "[\\s\\S]*", //输入过程中字符类型限制，如"[0-9]*"表示只能输入数字
            pgeEreg2: "[\\s\\S]{1,16}", //输入完毕后字符类型判断条件，与pgeditor.pwdValid()方法对应
            pgeMaxlength: 16, //允许最大输入长度
            pgeTabindex: 1, //tab键顺序
            AffineX: AffineX,
            AffineY: AffineY,
            pgeClass: "ocx_style1", //控件css样式
            pgeInstallClass: "ocx_1", //针对安装或升级的css样式
            pgeOnkeydown: "FormSubmit()", //回车键响应函数，需焦点在控件中才能响应
            tabCallback: "captcha", //火狐tab键回调函数,设置要跳转到的对象ID
            // pgeOnfocus: "pgeFocus($('#_ocx_password_str1'))", //监控光标切入密码控件框
            // pgeOnblur: "FormSubmit()", //监控光标切出密码控件框
            pgeBackColor: "#f5f5f5",
            //windows10 edge&Chrome42+相关
            pgePlaceHolder: "请输入密码",
            pgeWindowID: "password" + new Date().getTime() + 1,
            pgeRZRandNum: "97971748000895888789038158964609",//pgeRZRandNum, //这个后台返
            pgeRZDataB: "Eouam/LcrfetJjlpJZlDY8Auf5BC1nM6EgmhsE3aNkA="//pgeRZDataB ////这个后台返 如果不对应 会报错。控件无法使用
        });
        window.pgeCtrl = pgeditor;

        $(function () {
            //$("#login").focus();
            pgeditor.pgInitialize();
            $("#_ocx_password_str1").html(pgeditor.load());
            //pgeditor.pwdSetSk(random_num);//给控件设置随机因子
            //console.log(pgeditor.checkInstall());
        });

        // 获取密码密文
        // 注意: 放在插件内的方法 如果不暴露给window对象，则会报错方法未定义
        window.FormSubmit = function () {
            // if(!lognameEl.val()){
            //     showTip("请输入登录名");
            //     lognameEl.focus();
            //     return false;
            // }

            var tip = $(".login-tip");

            if (pgeditor.osBrowser == 10 || pgeditor.osBrowser == 11) {
                pgeditor.pwdValid(function (valid) {
                    if (!$("#loginForm").valid()) return false;
                    if (valid == 1) {//判断密码是否匹配正则表达式二
                        setTimeout(function () {//防止回车提交时跟alert冲突
                            // msg.show("密码不能不为空");
                            tip.find(".tip-text").text("密码不能不为空");
                            tip.show();
                            _$("_ocx_password").focus();
                        }, 0);
                        return false;
                    }
                    randomDef.then(function (random_num) {
                        random_num = random_num;
                        pgeditor.pwdSetSk(random_num, function (callf) {
                            pgeditor.pwdResultSM2(function (result) {
                                var pwdResult = result;//获取密码AES密文
                                $("#login_password").val(pwdResult); //将密码密文赋值给表单
                                $('#loginForm').submit();
                            });
                        });
                    })
                });
            } else {
                randomDef.then(function (random_num) {
                    if (pgeditor.pwdLength() == 0) {
                        // console.log(message);
                        // showTip("密码不能为空");
                        tip.find(".tip-text").text("密码不能不为空");
                        tip.show();
                        _$("_ocx_password").focus();
                        return false;
                    }
                    pgeditor.pwdSetSk(random_num);
                    var pwdResultNew = pgeditor.pwdResultSM2();
                    var machineNetwork = pgeditor.machineNetwork(); //获取网卡信息密文
                    var machineDisk = pgeditor.machineDisk(); //获取硬盘信息密文
                    var machineCPU = pgeditor.machineCPU(); //获取CPU信息密文
                    $("#login_password").val(pwdResultNew); //将密码密文赋值给表单
                    $("#local_network").val(machineNetwork); //将网卡和MAC信息密文赋值给表单
                    $("#local_disk").val(machineDisk); //将硬盘信息密文赋值给表单
                    $("#local_cpu").val(machineCPU); //将CPU信息密文赋值给表单
                    //document.getElementById("#form1").submit();
                    $('#loginForm').submit();
                })

            }
        }

        $("#login-submit").on("click", function () {
            FormSubmit();
        })
        $("#captcha").keydown(function (e) {
            if (e.keyCode == 13) {
                FormSubmit();
            }
        })
        $(window).resize(function () {
            // console.log($(window).width());
            // console.log($(window).width() < 1170);
            // if ($(window).width() < 1170) {
            //     $("#slideBox").width("1170px");
            // }
            if ($(window).height() - $(".copyright").outerHeight(true) - $(".login-header").outerHeight(true) < 400) {
                $(".js-header-banner").height("400px")

            } else {
                $(".js-header-banner").height($(window).height() - $(".copyright").outerHeight(true) - $(".login-header").outerHeight(true))
            }
        });
        if ($(window).height() - $(".copyright").outerHeight(true) - $(".login-header").outerHeight(true) < 400) {
            $(".js-header-banner").height("400px")

        } else {
            $(".js-header-banner").height($(window).height() - $(".copyright").outerHeight(true) - $(".login-header").outerHeight(true))
        }
        $("#indexfooter").show();
    })
});
