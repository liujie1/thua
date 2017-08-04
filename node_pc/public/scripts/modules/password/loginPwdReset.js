require(['../../commonConfig'], function() {
    require(['jquery',
        'httpRequest',
        'message_zh',
        'utils',
        'global_dialog_common',
        'PassGuardCtrl'
    ], function($, httpRequest, validate, utils) {
        //配置验证规则
        // $("#setPayPwdForm").validate();
        var message = $("#form").formMsg();
        var classList = {
            "0": { "Elclass": "low", "text": "低" },
            "1": { "Elclass": "middle", "text": "中" },
            "2": { "Elclass": "high", "text": "高" }
        }

        //密码等级
        $('input[name="loginFirstPwd"]').keyup(function(e) {
            setState($(this));
        });
        $('input[name="loginLastPwd"]').keyup(function(e) {
            setState($(this));
        });

        function setState($el) {
            var level = utils.passwordStrong($el.val());
            var em = $el.parent().children(".inpur-outer-pwd-level").children("em");
            em.removeClass(function() {
                return $(this).attr('Elclass');
            });
            em.addClass(classList[level].Elclass);
            em.text(classList[level].text);
        }
        function onblur(){
            var n = pgeditor.pwdStrength();
            // setState("#_ocx_password", n);
            // setState("#_ocx_password2", n);
        }

        //*****密码控件*****
        var randomDef = $.Deferred();
        httpRequest.post("/common/getRandom").done(function(data) {
            if (data.respHead.head_rtn_code == "000000") {
                random_num = data.respBody.random_num;
                random_uuid = data.respBody.random_uuid;
                $("#random_uuid")[0].value=random_uuid;
                randomDef.resolve(random_num);
                console.log(data.respBody)
            }
        })

        httpRequest.post("/common/getPgeRZ").done(function(data) {
            if (data.respHead.head_rtn_code == "000000") {
                pgeRZRandNum = data.respBody.pgeRZRandNum;
                pgeRZDataB = data.respBody.pgeRZDataB;
                pgeditor.settings.pgeRZRandNum=pgeRZRandNum;
                pgeditor.settings.pgeRZDataB=pgeRZDataB;
                pgeditor2.settings.pgeRZRandNum=pgeRZRandNum;
                pgeditor2.settings.pgeRZDataB=pgeRZDataB;
                console.log(data.respBody)
            }
        })

        var pgeditor = new $.pge({
            pgePath: base_url + "/ocx/", //控件下载目录，可以指定绝对路径，如"http://www.baidu.com/download/"
            pgeId: "_ocx_password", //控件id
            pgeEdittype: 0, //控件显示类型,0(星号),1(明文)
            pgeEreg1: "[\\s\\S]*", //输入过程中字符类型限制，如"[0-9]*"表示只能输入数字
            pgeEreg2: "((?=.*[A-Za-z])(?=.*\\d)|(?=[A-Za-z])(?=.*[.#@!~%^&*])|(?=.*\\d)(?=.*[.#@!~%^&*]))[A-Za-z\\d.#@!~%^&*]{6,16}", //输入完毕后字符类型判断条件，与pgeditor.pwdValid()方法对应
            pgeMaxlength: 16, //允许最大输入长度
            pgeTabindex: 2, //tab键顺序
            pgePlaceHolder: '6~16位密码,包含数字、字母、特殊符号其中两种',
            AffineX: AffineX,
            AffineY: AffineY,
            pgeBackColor: "#f5f5f5",
            pgeClass: "ocx_style2", //控件css样式
            pgeInstallClass: "ocx_3", //针对安装或升级的css样式
            pgeOnkeydown: "FormSubmit()", //回车键响应函数，需焦点在控件中才能响应
            tabCallback: "input2", //火狐tab键回调函数,设置要跳转到的对象ID
            //pgeOnfocus: "pgeFocus($('#_ocx_password_str1'))", //监控光标切入密码控件框
            //pgeOnblur: "FormSubmit()", //监控光标切出密码控件框
            //windows10 edge&Chrome42+相关
            pgeWindowID: "password" + new Date().getTime() + 1,
            pgeRZRandNum: "97971748000895888789038158964609",//pgeRZRandNum, //这个后台返
            pgeRZDataB: "Eouam/LcrfetJjlpJZlDY8Auf5BC1nM6EgmhsE3aNkA=",//pgeRZDataB ////这个后台返 如果不对应 会报错。控件无法使用
        });
        var pgeditor2 = new $.pge({
            pgePath: base_url + "/ocx/", //控件下载目录，可以指定绝对路径，如"http://www.baidu.com/download/"
            pgeId: "_ocx_password2", //控件id
            pgeEdittype: 0, //控件显示类型,0(星号),1(明文)
            pgeEreg1: "[\\s\\S]*", //输入过程中字符类型限制，如"[0-9]*"表示只能输入数字
            pgeEreg2: "((?=.*[A-Za-z])(?=.*\\d)|(?=[A-Za-z])(?=.*[.#@!~%^&*])|(?=.*\\d)(?=.*[.#@!~%^&*]))[A-Za-z\\d.#@!~%^&*]{6,16}", //输入完毕后字符类型判断条件，与pgeditor.pwdValid()方法对应
            pgeMaxlength: 16, //允许最大输入长度
            pgeTabindex: 2, //tab键顺序
            pgePlaceHolder: '6~16位密码,包含数字、字母、特殊符号其中两种',
            AffineX: AffineX,
            AffineY: AffineY,
            pgeBackColor: "#f5f5f5",
            pgeClass: "ocx_style2", //控件css样式
            pgeInstallClass: "ocx_3", //针对安装或升级的css样式
            pgeOnkeydown: "FormSubmit()", //回车键响应函数，需焦点在控件中才能响应
            tabCallback: "input2", //火狐tab键回调函数,设置要跳转到的对象ID
            //pgeOnfocus: "pgeFocus($('#_ocx_password_str2'))", //监控光标切入密码控件框
            //pgeOnblur: "FormSubmit()", //监控光标切出密码控件框
            //windows10 edge&Chrome42+相关
            pgeWindowID: "password" + new Date().getTime() + 2,
            pgeRZRandNum: "97971748000895888789038158964609",//pgeRZRandNum, //这个后台返
            pgeRZDataB: "Eouam/LcrfetJjlpJZlDY8Auf5BC1nM6EgmhsE3aNkA=",//pgeRZDataB ////这个后台返 如果不对应 会报错。控件无法使用
        });
        window.pgeCtrl = pgeditor;
        $(function(){
            //$("#login").focus();
            pgeditor.pgInitialize();
            pgeditor2.pgInitialize();
            $("#_ocx_password_str1").html(pgeditor.load());
            $("#_ocx_password_str2").html(pgeditor2.load());
            //console.log(pgeditor.checkInstall());
        });

        //获取密码密文
        function pgformSubmit() {
            pgeditor.pwdSetSk(random_num);//给控件设置随机因子
            pgeditor2.pwdSetSk(random_num);
            if (pgeditor.pwdLength() == 0) {
                message.show("密码不能为空");
                _$("_ocx_password").focus();
                return false;
            }
            if (pgeditor2.pwdLength() == 0) {
                message.show("密码不能为空");
                _$("_ocx_password2").focus();
                return false;
            }
            if (pgeditor.pwdValid() == 1) {
                message.show("请输入6-16位数字/字母/特殊字符组合密码");
                _$("_ocx_password").focus();
                return false;
            }
            if (pgeditor2.pwdValid() == 1) {
                message.show("请输入6-16位数字/字母/特殊字符组合密码");
                _$("_ocx_password2").focus();
                return false;
            }
            if (pgeditor.pwdHash() != pgeditor2.pwdHash()) {
                message.show("两次输入密码不一致");
                return false;
            }
            var pwdResultNew = pgeditor.pwdResultSM2();//获取密文
            var pwdResultNew2 = pgeditor2.pwdResultSM2();
            var machineNetwork = pgeditor.machineNetwork();//获取网卡信息密文
            var machineDisk = pgeditor.machineDisk();//获取硬盘信息密文
            var machineCPU = pgeditor.machineCPU();//获取CPU信息密文
            _$("loginFirstPwd").value = pwdResultNew;//将密码密文赋值给表单
            _$("loginLastPwd").value = pwdResultNew2;//将密码密文赋值给表单
            _$("local_network").value = machineNetwork;//将网卡和MAC信息密文赋值给表单
            _$("local_disk").value = machineDisk;//将硬盘信息密文赋值给表单
            _$("local_cpu").value = machineCPU;//将CPU信息密文赋值给表单
            //document.getElementById("#form1").submit();
            $('#form').submit();
            return true;
        }
        validate.initForm($("#form"), "");

        $("#submit-btn").on("click", function () {
            if (!$("#form").valid()) return false;
            if (pgeditor.osBrowser == 10 || pgeditor.osBrowser == 11) {
                randomDef.then(function (random_num) {
                    pgeditor.pwdSetSk(random_num, function () {
                        pgeditor2.pwdSetSk(random_num, function () {
                            var pg1lenDef = $.Deferred(); //获取控件1长度
                            var pg2lenDef = $.Deferred(); //获取控件2长度
                            var pg1valDef = $.Deferred(); //获取控件1的验证
                            var pg2valDef = $.Deferred(); //获取控件2的验证
                            var pgeqDef = $.Deferred(); //两个插件是否相等
                            pgeditor.pwdLength(function (len) {
                                if (len == 0) {
                                    pg1lenDef.reject({ msg: "密码不能为空", id: "_ocx_password" });
                                    return false;
                                } else {
                                    pg1lenDef.resolve();
                                }
                            });
                            pg1lenDef.then(function () {
                                pgeditor2.pwdLength(function (len) {
                                    if (len == 0) {
                                        pg2lenDef.reject({ msg: "密码不能为空", id: "_ocx_password2" });
                                        return false;
                                    } else {
                                        pg2lenDef.resolve();
                                    }
                                });
                                pg2lenDef.then(function () {
                                    pgeditor.pwdValid(function (res) {
                                        if (res == 1) {
                                            pg1valDef.reject({ msg: "请输入6-16位数字/字母/特殊字符组合密码", id: "_ocx_password" });
                                            return false;
                                        } else {
                                            pg1valDef.resolve();
                                        }
                                    });
                                    pg1valDef.then(function () {
                                        pgeditor2.pwdValid(function (res) {
                                            if (res == 1) {
                                                pg2valDef.reject({ msg: "请输入6-16位数字/字母/特殊字符组合密码", id: "_ocx_password2" });
                                                return false;
                                            } else {
                                                pg2valDef.resolve();
                                            }
                                        });
                                        pg2lenDef.then(function () {
                                            pgeditor.pwdHash(function (pg1Hash) {
                                                pgeditor2.pwdHash(function (pg2Hash) {
                                                    if (pg1Hash != pg2Hash) {
                                                        pgeqDef.reject({ msg: "两次输入密码不一致", id: "_ocx_password2" });
                                                        return false;
                                                    } else {
                                                        pgeqDef.resolve();
                                                    }
                                                })
                                            });
                                        });
                                    });
                                });
                            });

                            $.when(pg1lenDef, pg2lenDef, pg1valDef, pg2valDef, pgeqDef).then(function (pg1len, pg2len, pg1val, pg2val, pgeq) {
                                pgeditor.pwdResultSM2(function (pwdResultNew) {
                                    pgeditor2.pwdResultSM2(function (pwdResultNew2) {
                                        $("#loginFirstPwd").val(pwdResultNew); //将密码密文赋值给表单
                                        $("#loginLastPwd").val(pwdResultNew2); //将密码密文赋值给表单
                                        $('#form').submit();
                                    });
                                });
                            }, function (error) {
                                message.show(error.msg);
                                console.log(error.id);
                                $("#" + error.id).focus();
                            });
                        })
                    })
                })
            } else {
                pgformSubmit();
            }
        })
    })
})
