/**
 * 首页模块
 */
require(['../commonConfig'], function() {
    require(['jquery',
        'httpRequest',
        'lodash',
        'jsviews'
    ], function($,
        httpRequest) {
        window.cust_no = "2016121258";
        $(function() {
            // $.views.settings.debugMode();
            var tmpl = $.templates("#register");
            var person = {
                mobile: "18871267051",
                verification_code: "111",
                login_password: "123456",
                cust_manager_mobile: "13177285595",
                captcha: "",
                imgCode: ""
            };
            var serial_number, uuid;
            var helpers = {
                getToken: function() { //获取令牌
                    console.log("获取令牌")
                    httpRequest.getToken();
                    return false;
                },
                getTHCode: function() { //获取通华验证码
                    httpRequest.post({
                            mobile: person.mobile,
                            tran_code: "A10001",
                            head_tran_code: "A00002"
                        })
                        .done(function(data) {
                            console.log(data);
                            if (data.respHead.head_rtn_code == "000000") {
                                serial_number = data.respBody.serial_number
                                console.log(serial_number);
                            }
                        })
                },
                getImgCode: function() { //获取图片验证码
                    httpRequest.post({ head_tran_code: "P00003" })
                        .done(function(data) {
                            console.log(data);
                            if (data.respHead.head_rtn_code == "000000") {
                                $.observable(person).setProperty({
                                    imgCode: "data:image/png;base64," + data.respBody.captcha
                                });
                                uuid = data.respBody.uuid;
                            }
                        })
                },
                getBankPhoneCode: function() { //获取银行预留手机号验证码
                    var deferred = $.Deferred();
                    httpRequest.post({
                            head_tran_code: "P00003",
                            cust_no: "", //客户号
                            tran_code: "", //交易码
                            bank_no: "", //银行卡行号
                            card_no: "", //银行卡卡号
                            id_type: "", //证件类型
                            id_code: "", //证件号码
                            bank_mobile: "", //银行卡预留手机号
                            cust_name: "" //客户姓名
                        })
                        .done(function() {
                            deferred.resolve();
                        });
                    return deferred;
                },
                register: function(code) { //用户注册
                    //获取图片验证码  获取短信验证码
                    httpRequest.post({
                        head_tran_code: "A10001",
                        mobile: person.mobile,
                        verification_code: person.verification_code, //短信验证码
                        serial_number: serial_number, //短信验证码序列号
                        login_password: person.login_password, //登录密码
                        cust_manager_mobile: person.cust_manager_mobile, //推荐人手机号
                        is_agree: "0", //是否同意协议 0同意 1不同意
                        captcha: person.captcha, //图形验证码
                        uuid: uuid // 生成图片返回
                    }).done(function(data) {
                        console.log("注册返回参数", data)
                    })
                }
            };
            tmpl.link("#registerResult", person, helpers); // Render and link the template
        });
        $(function() {
            var tmpl = $.templates("#login");
            var uuid;
            var loginModal = {
                mobile: "13475616200",
                login_password: "123456",
                captcha: "",
                imgCode: ""
            };

            var helpers = {
                getImgCode: function() { //获取图片验证码
                    httpRequest.post({ head_tran_code: "P00003" })
                        .done(function(data) {
                            console.log(data);
                            if (data.respHead.head_rtn_code == "000000") {
                                $.observable(loginModal).setProperty({
                                    imgCode: "data:image/png;base64," + data.respBody.captcha
                                });
                                uuid = data.respBody.uuid;
                            }
                        })
                },
                login: function() {
                    if (!uuid) {
                        return alert("请先获取图片验证码");
                    }
                    httpRequest.post({
                        head_tran_code: "A10002",
                        mobile: loginModal.mobile,
                        login_password: loginModal.login_password,
                        captcha: loginModal.captcha,
                        uuid: uuid
                    }).done(function(data) {
                        console.log(data);
                        if (data.respHead.head_rtn_code == "000000") {
                            window.cust_no = data.respBody.cust_no;
                        }
                    })
                },
                logout: function() {
                    if (!window.cust_no) return alert("你还没有登录")
                    httpRequest.post({
                        head_tran_code: "A10003",
                        cust_no: window.cust_no
                    }).done(function(data) {
                        if (data.respHead.head_rtn_code == "000000") {
                            window.cust_no = null;
                        }
                    })
                }
            };

            tmpl.link("#loginResult", loginModal, helpers); // Render and link the template
        });
        $(function() {
            var tmpl = $.templates("#resetLoginPwd");
            var serial_number, msg_serial_number, auth_serial_number;

            var resetLoginPwdModal = {
                mobile: "",
                login_password: "",
                verification_code: "",
                card_no: "",
                id_code: "",
                cust_name: "",
                serial_number: ""
            }

            var helpers = {
                getCode: function() { //获取验证码
                    httpRequest.post({
                            head_tran_code: "A00002",
                            tran_code: "A10004",
                            mobile: resetLoginPwdModal.mobile
                        })
                        .done(function(data) {
                            console.log(data);
                            if (data.respHead.head_rtn_code == "000000") {
                                // $.observable(resetLoginPwdModal).setProperty({
                                //     serial_number: data.respBody.serial_number
                                // });
                                serial_number = data.respBody.serial_number
                            }
                        })
                },
                verifyPhoneCode: function() {
                    httpRequest.post({
                        head_tran_code: "A10010",
                        cust_no: window.cust_no,
                        tran_code: "A10004",
                        mobile: resetLoginPwdModal.mobile,
                        verification_code: resetLoginPwdModal.verification_code,
                        serial_number: serial_number
                    }).done(function(data) {
                        console.log(data);
                        if (data.respHead.head_rtn_code == "000000") {
                            msg_serial_number = data.respBody.msg_serial_number
                        }
                    })
                },
                verifyIdCard: function() {
                    httpRequest.post({
                        head_tran_code: "A10009",
                        serial_number: serial_number,
                        cust_no: window.cust_no,
                        card_no: resetLoginPwdModal.card_no,
                        id_type: "0",
                        id_code: resetLoginPwdModal.id_code,
                        cust_name: resetLoginPwdModal.cust_name,
                        tran_code: "A10004"
                    }).done(function(data) {
                        if (data.respHead.head_rtn_code == "000000") {
                            auth_serial_number = data.respBody.auth_serial_number
                        }
                    })
                },
                resetLoginPwd: function() {
                    httpRequest.post({
                        head_tran_code: "A10004",
                        cust_no: window.cust_no,
                        login_password: resetLoginPwdModal.login_password,
                        msg_serial_number: msg_serial_number,
                        auth_serial_number: auth_serial_number
                    }).done(function(data) {
                        console.log(data);
                        if (data.respHead.head_rtn_code == "000000") {}
                    })
                }
            }
            tmpl.link("#resetLoginPwdResult", resetLoginPwdModal, helpers); // Render and link the template
        })
        $(function() {
            var tmpl = $.templates("#modifyManagerMobile");

            var modifyManagerMobileModal = {
                cust_manager_mobile: ""
            }

            var helpers = {
                modifyManagerMobile: function() { //修改推荐人手机号
                    httpRequest.post({
                            head_tran_code: "A10005",
                            cust_manager_mobile: modifyManagerMobileModal.cust_manager_mobile,
                            cust_no: window.cust_no
                        })
                        .done(function(data) {
                            console.log(data);
                            if (data.respHead.head_rtn_code == "000000") {
                                // $.observable(resetLoginPwdModal).setProperty({
                                //     serial_number: data.respBody.serial_number
                                // });
                                // serial_number = data.respBody.serial_number
                            }
                        })
                },
                risk: function() {
                    httpRequest.post({
                            head_tran_code: "A10006",
                            risk_assessment_answer: "a,b,c,d,a,d,c,d,a,b",
                            cust_no: window.cust_no,
                            risk_assessment_level: ""
                        })
                        .done(function(data) {
                            console.log(data);
                            if (data.respHead.head_rtn_code == "000000") {
                                // $.observable(resetLoginPwdModal).setProperty({
                                //     serial_number: data.respBody.serial_number
                                // });
                                // serial_number = data.respBody.serial_number
                            }
                        })
                },
                riskLevel: function() {
                    httpRequest.post({
                            head_tran_code: "A10007",
                            cust_no: window.cust_no
                        })
                        .done(function(data) {
                            console.log(data);
                            if (data.respHead.head_rtn_code == "000000") {
                                // $.observable(resetLoginPwdModal).setProperty({
                                //     serial_number: data.respBody.serial_number
                                // });
                                // serial_number = data.respBody.serial_number
                            }
                        })
                },
                getUserInfo: function() {
                    httpRequest.post({
                            head_tran_code: "A10008",
                            cust_no: window.cust_no
                        })
                        .done(function(data) {
                            console.log(data);
                            if (data.respHead.head_rtn_code == "000000") {
                                // $.observable(resetLoginPwdModal).setProperty({
                                //     serial_number: data.respBody.serial_number
                                // });
                                // serial_number = data.respBody.serial_number
                            }
                        })
                }
            }
            tmpl.link("#modifyManagerMobilResult", modifyManagerMobileModal, helpers); // Render and link the template
        })
    })
});
