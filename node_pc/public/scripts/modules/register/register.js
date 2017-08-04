require(['../../commonConfig'], function () {
  require(['jquery',
    'httpRequest',
    'lodash',
    'message_zh',
    'utils',
    'authCode',
    'global_dialog_common',
    'PassGuardCtrl',
    'modal'
  ], function ($, httpRequest, _, validate, utils, authCode) {
    $('a[data-modal]').on('click', function () {
      $(this).modal();
      return false;
    });

    // 初始化表单验证信息
    var form;
    var message = $("#form").formMsg();
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

    $("#get-verifycode-btn").authCode({
      url: "/common/getCodeS",
      data: {
        tran_code: "C10004",
        phone: $("input[name='mobile']").val(),
        captcha_serno: $("input[name='captcha_serno']").val(),
        captcha: $("input[name='captcha']").val()
      },
      clickCallback: function (e, data) {
        data.phone = $("input[name='mobile']").val();
        data.captcha_serno= $("input[name='captcha_serno']").val();
        data.captcha= $("input[name='captcha']").val();
        var check = form.check($("input[name='mobile']")) && form.check($("input[name='captcha']"));
        if(!$("input[name='captcha_serno']").val()){
          message.show("请等待验证吗或点击验证刷新验证码");
          check = false;
        } 
        if (!check) {
          form.defaultShowErrors();
          e.preventDefault();
        }
      },
      successCallback: function (data) {
        $("input[name='smslog_serno']").val(data.respBody.smslog_serno);
        $("#tips").html("验证码已发送至<strong>" + utils.hidePhone($("input[name='mobile']").val()) + "</strong>手机，请注意查收！");
        // $("#mobileTips").show();
      },
      errorCallback: function (data) {
        message.show(data.respHead.head_rtn_desc);
      },
      failCallback: function (error) {
        message.show(error);
      }
    });


    //刷新图片验证码
    var $refreshBtn = $("#refresh-btn");
    $refreshBtn.on("click", function () {
      httpRequest.post("/common/getImgCode").done(function (data) {
        if (data.respHead.head_rtn_code == "000000") {
          // captcha_serno = data.respBody.captcha_serno;
          $("input[name='captcha_serno']").val(data.respBody.captcha_serno);
          $("#imgCode").attr("src", "data:image/png;base64," + data.respBody.captcha_img);
        } else {
          validate.showErrMsg(data.respHead.head_rtn_desc);
        }
      })
    });
    $refreshBtn.trigger("click");
    //点击图片刷新验证码
    $("#imgCode").on("click", function () {
      httpRequest.post("/common/getImgCode").done(function (data) {
        if (data.respHead.head_rtn_code == "000000") {
          $("input[name='captcha_serno']").val(data.respBody.captcha_serno);
          $("#imgCode").attr("src", "data:image/png;base64," + data.respBody.captcha_img);
        }
      })
    });
    $("#imgCode").trigger("click");

    // 密码安全等级处理
    // var classList = {
    //     "0": {
    //         "prettyClass": "low",
    //         "des": "低"
    //     },
    //     "1": {
    //         "prettyClass": "middle",
    //         "des": "中"
    //     },
    //     "2": {
    //         "prettyClass": "high",
    //         "des": "高"
    //     }
    // };
    // $('input[name="loginFirstPwd"]').keyup(function(e) {
    //     setState($(this));
    // });
    // $('input[name="loginLastPwd"]').keyup(function(e) {
    //     setState($(this));
    // });

    // function setState($el, level) {
    //     // var level = utils.passwordStrong($el.val());
    //     var em = $el.parent().children(".inpur-outer-pwd-level").children("em");
    //     em.removeClass(function() {
    //         return $(this).attr('prettyClass');
    //     });
    //     em.addClass(classList[level].prettyClass);
    //     em.text(classList[level].des);
    // }

    // function onblur(){
    //     var n = pgeditor.pwdStrength();
    //     setState("#_ocx_password", n);
    // }

    var pgeditor = new $.pge({
      pgePath: "./ocx/", //控件下载目录，可以指定绝对路径，如"http://www.baidu.com/download/"
      pgeId: "_ocx_password", //控件id
      pgeEdittype: 0, //控件显示类型,0(星号),1(明文)
      pgeEreg1: "[\\s\\S]*", //输入过程中字符类型限制，如"[0-9]*"表示只能输入数字
      pgeEreg2: "((?=.*[A-Za-z])(?=.*\\d)|(?=[A-Za-z])(?=.*[.#@!~%^&*])|(?=.*\\d)(?=.*[.#@!~%^&*]))[A-Za-z\\d.#@!~%^&*]{6,16}", //输入完毕后字符类型判断条件，与pgeditor.pwdValid()方法对应
      pgeMaxlength: 16, //允许最大输入长度
      pgeTabindex: 2, //tab键顺序
      pgeBackColor: '#f5f5f5',
      AffineX: AffineX,
      AffineY: AffineY,
      pgePlaceHolder: '6~16位密码,包含数字、字母、特殊符号其中两种',
      pgeClass: "ocx_style2", //控件css样式
      pgeInstallClass: "ocx_2", //针对安装或升级的css样式
      // pgeOnkeydown: "onkeydown()", //回车键响应函数，需焦点在控件中才能响应
      tabCallback: "_ocx_password2", //火狐tab键回调函数,设置要跳转到的对象ID
      //pgeOnfocus: "pgeFocus($('#_ocx_password_str1'))", //监控光标切入密码控件框
      // pgeOnblur: "onblur()", //监控光标切出密码控件框
      //windows10 edge&Chrome42+相关
      placeholderFont: "Microsoft YaHei",
      placeholderSize: "19",
      pgeWindowID: "password1" + new Date().getTime() + 1,
      pgeRZRandNum: "97971748000895888789038158964609", //pgeRZRandNum, //这个后台返
      pgeRZDataB: "Eouam/LcrfetJjlpJZlDY8Auf5BC1nM6EgmhsE3aNkA=" //pgeRZDataB ////这个后台返 如果不对应 会报错。控件无法使用
    });
    var pgeditor2 = new $.pge({
      pgePath: "./ocx/", //控件下载目录，可以指定绝对路径，如"http://www.baidu.com/download/"
      pgeId: "_ocx_password2", //控件id
      pgeEdittype: 0, //控件显示类型,0(星号),1(明文)
      pgeEreg1: "[\\s\\S]*", //输入过程中字符类型限制，如"[0-9]*"表示只能输入数字
      pgeEreg2: "((?=.*[A-Za-z])(?=.*\\d)|(?=[A-Za-z])(?=.*[.#@!~%^&*])|(?=.*\\d)(?=.*[.#@!~%^&*]))[A-Za-z\\d.#@!~%^&*]{6,16}", //输入完毕后字符类型判断条件，与pgeditor.pwdValid()方法对应
      pgeMaxlength: 16, //允许最大输入长度
      pgeTabindex: 2, //tab键顺序
      pgePlaceHolder: '6~16位密码,包含数字、字母、特殊符号其中两种',
      pgeBackColor: '#f5f5f5',
      //AffineX: "6CFD8CF879E10F0365AD478196181B4A6C90317925D394C9A8D7BE507E1FE988",
      //AffineY: "0660AEAE635864459855002BEE343C89E6599B374931BADF5EBBAA92AA45EB19",
      AffineX: AffineX,
      AffineY: AffineY,
      pgeClass: "ocx_style2", //控件css样式
      pgeInstallClass: "ocx_2", //针对安装或升级的css样式
      // pgeOnkeydown: "onkeydown()", //回车键响应函数，需焦点在控件中才能响应
      tabCallback: "verifycode", //火狐tab键回调函数,设置要跳转到的对象ID
      //pgeOnfocus: "pgeFocus($('#_ocx_password_str2'))", //监控光标切入密码控件框
      // pgeOnblur: "onblur()", //监控光标切出密码控件框
      //windows10 edge&Chrome42+相关
      placeholderFont: "Microsoft YaHei",
      placeholderSize: "19",
      pgeWindowID: "password2" + new Date().getTime() + 2,
      pgeRZRandNum: "97971748000895888789038158964609", //pgeRZRandNum, //这个后台返
      pgeRZDataB: "Eouam/LcrfetJjlpJZlDY8Auf5BC1nM6EgmhsE3aNkA=" //pgeRZDataB ////这个后台返 如果不对应 会报错。控件无法使用
    });
    //*****密码控件*****
    var randomDef = $.Deferred();
    httpRequest.post("/common/getRandom").done(function (data) {
      if (data.respHead.head_rtn_code == "000000") {
        random_num = data.respBody.random_num;
        random_uuid = data.respBody.random_uuid;
        pgeditor.pwdSetSk(random_num);
        pgeditor2.pwdSetSk(random_num);
        $("#random_uuid")[0].value = random_uuid;
        randomDef.resolve(random_num);
        // console.log(data.respBody)
      }
    })

    httpRequest.post("/common/getPgeRZ").done(function (data) {
      if (data.respHead.head_rtn_code == "000000") {
        pgeRZRandNum = data.respBody.pgeRZRandNum;
        pgeRZDataB = data.respBody.pgeRZDataB;
        pgeditor.settings.pgeRZRandNum = pgeRZRandNum;
        pgeditor.settings.pgeRZDataB = pgeRZDataB;
        pgeditor2.settings.pgeRZRandNum = pgeRZRandNum;
        pgeditor2.settings.pgeRZDataB = pgeRZDataB;
        console.log(data.respBody)
      }
    })
    window.pgeCtrl = pgeditor;
    window.pgeCtrl = pgeditor2;
    $(function () {
      //$("#login").focus();
      pgeditor.pgInitialize();
      pgeditor2.pgInitialize();
      $("#_ocx_password_str1").html(pgeditor.load());
      $("#_ocx_password_str2").html(pgeditor2.load());
      //console.log(pgeditor.checkInstall());
    });

    //通过id获得页面元素
    // function _$(v) {
    //   return document.getElementById("z" + v);
    // }

    form = validate.initForm($("#registerForm"), "");
    //获取密码密文
    function registerFormSubmit() {
      pgeditor.pwdSetSk(random_num);
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
        _$("_ocx_password").focus();
        return false;
      }
      if (pgeditor.pwdHash() != pgeditor2.pwdHash()) {
        message.show("两次输入密码不一致");
        return false;
      }
      var pwdResultNew = pgeditor.pwdResultSM2();
      var pwdResultNew2 = pgeditor2.pwdResultSM2();
      var machineNetwork = pgeditor.machineNetwork(); //获取网卡信息密文
      var machineDisk = pgeditor.machineDisk(); //获取硬盘信息密文
      var machineCPU = pgeditor.machineCPU(); //获取CPU信息密文
      $("#loginFirstPwd").val(pwdResultNew); //将密码密文赋值给表单
      $("#loginLastPwd").val(pwdResultNew2); //将密码密文赋值给表单
      $('#registerForm').submit();
    }

    $("#submit-btn").on("click", function () {
      if (!$("#registerForm").valid()) return false;
      if (pgeditor.osBrowser == 10 || pgeditor.osBrowser == 11) {
        randomDef.then(function (random_num) {
          pgeditor.pwdSetSk(random_num, function () {
            pgeditor2.pwdSetSk(random_num, function () {
              var pg1lenDef = $.Deferred(); //获取控件1长度
              var pg2lenDef = $.Deferred(); //获取控件2长度
              var pg1valDef = $.Deferred(); //获取控件1的验证
              var pg2valDef = $.Deferred(); //获取控件2的验证
              var pgeqDef = $.Deferred(); //两个插件是否相等
              var pg1getDef = $.Deferred(); // 获取控件1密文
              var pg2getDef = $.Deferred(); //获取控件2的密文
              pgeditor.pwdLength(function (len) {
                if (len == 0) {
                  pg1lenDef.reject("密码不能为空");
                  _$("_ocx_password").focus();
                } else {
                  pg1lenDef.resolve();
                }
              });
              pgeditor2.pwdLength(function (len) {
                if (len == 0) {
                  pg2lenDef.reject("密码不能为空");
                  _$("_ocx_password2").focus();
                } else {
                  pg2lenDef.resolve();
                }
              });
              pgeditor.pwdValid(function (res) {
                if (res == 1) {
                  pg1valDef.reject("请输入6-16位数字/字母/特殊字符组合密码");
                  _$("_ocx_password").focus();
                } else {
                  pg1valDef.resolve();
                }
              });
              pgeditor2.pwdValid(function (res) {
                if (res == 1) {
                  pg2valDef.reject("请输入6-16位数字/字母/特殊字符组合密码");
                  _$("_ocx_password2").focus();
                } else {
                  pg2valDef.resolve();
                }
              });
              pgeditor.pwdHash(function (pg1Hash) {
                pgeditor2.pwdHash(function (pg2Hash) {
                  if (pg1Hash != pg2Hash) {
                    pgeqDef.reject("两次输入密码不一致");
                    _$("_ocx_password2").focus();
                    $("#_ocx_password2").focus();
                  } else {
                    pgeqDef.resolve();
                  }
                })
              });
              $.when(pg1lenDef, pg2lenDef, pg1valDef, pg2valDef, pgeqDef).then(function (pg1len, pg2len, pg1val, pg2val, pgeq) {
                pgeditor.pwdResultSM2(function (pwdResultNew) {
                  pgeditor2.pwdResultSM2(function (pwdResultNew2) {
                    $("#loginFirstPwd").val(pwdResultNew); //将密码密文赋值给表单
                    $("#loginLastPwd").val(pwdResultNew2); //将密码密文赋值给表单
                    $('#registerForm').submit();
                  });
                });
              }, function (error) {
                message.show(error);
              });
            })
          })
        })
      } else {
        registerFormSubmit()
      }
    })
  })

});
