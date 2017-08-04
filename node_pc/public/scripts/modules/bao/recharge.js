require(['../../commonConfig'], function () {
  require(['jquery',
    'httpRequest',
    'message_zh',
    'dialog',
    'utils',
    'loading',
    "simpletooltip",
    'global_dialog_common',
    'microdone',
    'microdone1'
  ], function ($, httpRequest, validate, dialog, utils, loading) {
    var checkConfig = function () {
      // 查询客户信息警示内容
      if (serveConfig.param_whether) {
        queryTipMsg($("#caution_tip_text"), serveConfig.param_whethercode);
      }
      // 未风评提示
      if (isRisk === '01') {
        if (serveConfig.param_riskflag === '01') {
          easyDialog.open({
            container: 'czerror_dialog1'
          });
          // 查询未风评警示内容
          queryTipMsg($("#riskTip"), serveConfig.param_riskcode);
          return true;
        }
      }

      // 客户信息不完整提示
      if (isFullInfo === '01') {
        if (serveConfig.param_personal === '01') {
          easyDialog.open({
            container: 'czerror_dialog2'
          });
          // 查询客户信息警示内容
          queryTipMsg($("#fullInfoTip"), serveConfig.param_personalcode);
          return true;
        }
      }

      // // 风险不匹配弹框提示 （针对保守型用户）cust_level == 1
      // if (cust_level == "01" && cust_level < fund_level) {
      //   easyDialog.open({
      //     container: 'alertModal'
      //   });
      //   return;
      // }
    };

    function queryTipMsg(el, warn_code) {
      httpRequest.post("/common/riskWarnDetail", {
        warn_code: warn_code
      }).then(function (data) {
        if (data.respHead.head_rtn_code == "000000") {
          el.text(data.respBody.warn_content);
          $(".zhezhao-conlink").show();
        } else {
          el.text(data.respHead.head_rtn_desc);
          $(".zhezhao-conlink").hide();
          // window.location.href = encodeURI(base_url + "/" + sub_url + "/rechargeResult?status=error&message=" + data.respHead.head_rtn_desc);
        }
      }, function () {
        el.text("请求超时或网络异常");
        $(".zhezhao-conlink").hide();
        // window.location.href = encodeURI(base_url + "/" + sub_url + "/rechargeResult?status=error&message=" + "请求超时或网络异常，请重新提交!");
      });
    }

    checkConfig();

    if ($("#gzrje-new").value == undefined || $("#gzrje-new").value == '0') {
      if (utils.isSupportPlaceholder()) {
        $("#gzrje-new").val("");
      }
      $("#jeupddtext").text("零元");
    } else {
      var j = chineseNumber($("#gzrje-new").value);
      $("#jeupddtext").text(j);
    };
    $("#jjisubmit").on('click', function () {
      // if ($("#check-warn").get(0) && !$("#check-warn").valid()) return false;
      if (checkConfig()) return;
      if (!$("#form").valid()) return;
      var j = chineseNumber($("#js-inputAmount").val());
      $("input[name='amount']").val($("#js-inputAmount").val())
      $(".pay_money").text($("#js-inputAmount").val())
      $(".big-ch").text(j)

      console.log(j)
      // easyDialog.open({
      //   container: 'alertModal'
      // });

      //

      easyDialog.open({
        container: 'people_info',
        fixedHeight: true
      });

      $(document.body).addClass("html-body-overflow");

      $('.button.no').on('click', function () {
        $(document.body).removeClass("html-body-overflow");
      });

      $('.close-btn').on('click', function () {
        $(document.body).removeClass("html-body-overflow");
      });
    });


    $(".dialog-close-btn").click(function () {
      easyDialog.close();
    });
    // 多卡选择
    $('#card_no').on('click', function () {
      $(this).find('.select-options').slideToggle(300);
    });

    $(".select-options li").click(function () {
      var selectVal = $(this).text();
      var _bkact_fncacct = $(this).attr("data-val");
      var item = JSON.parse($(this).attr("data-list"));
      // console.log(item);
      // var item = JSON.parse($(this).attr("data-list"));
      $('#showCard').text(selectVal);
      $("input[name='bkact_fncacct']").val(_bkact_fncacct);
      $(".pay_bank").text(selectVal);
      $("#payTip").text(item.pay_prompt);
      $("input[name='bkact_fncacct']").valid();
    })
    $(document.body).click(function (e) {
      var $container = $('#card_no');   // 设置目标区域
      if (!$container.is(e.target) && $container.has(e.target).length === 0) {
        $('.select-options').slideUp(300);
      }
    });
    $(".databaseCTabti li").click(function () {
      $(this).addClass("ontab")
      $(this).siblings().removeClass('ontab');
      var silDiv = $(this).parents(".databaseCdiv").find(".databaseCTabcon");
      silDiv.hide().eq($(this).index()).show();
    });


    // 切换宝宝基金
    $('.jin-chooselist li').on('click', function (event) {
      if (!$(this).hasClass('chooseon')) {
        $('.jin-chooselitig').empty();
        $('.jin-chooselitig').eq($(this).index()).append('<p>已选择</p>');
        var fundCode = $(this).data('fund-code');
        var fund_fstminamtbyindi = $(this).data('fund_fstminamtbyindi');
        $('#js-fund-code').val(fundCode);
        // $("#gzrje-new").attr("placeholder", "最低起购金额" + fund_fstminamtbyindi);
        $(this).addClass("chooseon")
        $(this).siblings().removeClass('chooseon');
        $("#select_tip").fadeOut();
        httpRequest.post("/" + sub_url + "/fundDetails", { fundCode: fundCode }).done(function (data) {
          if (data.respHead.head_rtn_code == "000000") {
            var date = data.respBody.confirm_date;
            var fund_fstminamtbyindi = data.respBody.fund_fstminamtbyindi;
            // $("#gzrje-new").attr("placeholder", "最低起购金额" + utils.currency(fund_fstminamtbyindi, 2));
            utils.setPlaceholder($("#gzrje-new"), "最低起购金额" + utils.currency(fund_fstminamtbyindi, 2) + "元");
            $('.js-confirm-date').text(date.substring(0, 4) + '年' + date.substring(4, 6) + '月' + date.substring(6, 8) + '日');
          }
        });
      }


    });

    var tokenStr = "";
    httpRequest.getToken().then(function (token) {
      tokenStr = token;
    });
    $("#check-warn").click(function () {
      var check = $("#check-warn").is(":checked")
      if (check) {
        $("input[name='tranlog_isagreerisk']").val("00")
      } else {
        $("input[name='tranlog_isagreerisk']").val("01")
      }
    })
    //表单验证
    var form = validate.initForm($("#form"), "正在支付，请稍后。。。");
    $("#buy_btn").click(function () {
      if (checkConfig()) return;
      if (!$("#fundForm").valid()) return;
      var params = utils.serialize($("#fundForm"));
      easyDialog.close()
      formPost(params)

    });
    $("#submit").click(function () {
      if (checkConfig()) return;
      console.log($("input[name='fund_code']").val());
      if (!$("input[name='fund_code']").val()) { //判断有没有选择基金，如果没有提示用户
        $("#select_tip #tip_text").text("请先选择基金产品");
        $("#select_tip").fadeIn();
        return;
      }
      var params = utils.serialize($("#form"));
      formPost(params)
    });
    $(".tip-close-btn").click(function () {
      $("#select_tip").fadeOut();
    })

    function formPost(params) {
      if (!form.form()) return;
      var mingwen = params.pay_password;
      var srand = $('input[name="random_num"]').val();
      params.token = tokenStr;
      params.pay_password = SM2_Encrypt2(mingwen, sm2KeyHex, "1", srand, false);
      params.matchCode = serveConfig.param_whether; //后台风险警示留痕用
      var loaded = loading();
      // 检测配置
      httpRequest.post("/" + sub_url + "/recharge", params).then(function (data) {
        console.log("wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww")
        loaded.close();
        if (data.respHead.head_rtn_code == "000000") {
          //window.location.href = encodeURI(base_url + "/" + sub_url + "/rechargeResult?status=success&confirm_date=" + params.confirm_date);
          window.location.href = encodeURI(base_url + "/" + sub_url + "/rechargeResult?status=success&message=" + data.respHead.head_rtn_desc);
        } else if (data.respHead.head_rtn_code == "ER0150") {
          httpRequest.getToken().then(function (token) {
            tokenStr = token;
            $("#tip-text").text(data.respHead.head_rtn_desc);
            easyDialog.open({
              container: 'alertModal'
            });
          })
        } else {
          window.location.href = encodeURI(base_url + "/" + sub_url + "/rechargeResult?status=error&message=" + data.respHead.head_rtn_desc);
        }
      }, function () {
        loaded.close();
        window.location.href = encodeURI(base_url + "/" + sub_url + "/rechargeResult?status=error&message=" + "请求超时或网络异常，请重新提交!");
      })
    }

    $("#yes").click(function () {
      $("input[name='tranlog_isagreerisk']").val("00");
      easyDialog.close();
      // $("#submit").click();
    })

    $("#dialog-close-btn").click(function () {
      easyDialog.close();
      window.location.reload();
    });

    $('.simpletooltip').simpletooltip({
      themes: {
        pink: {
          color: 'red',
          border_color: 'red',
          background_color: 'pink',
          border_width: 4
        },
        brazil: {
          color: 'yellow',
          background_color: 'green',
          border_color: 'yellow',
          border_width: 4
        }
      }
    });


    $("#card_no").click(function () {
      $("#bank-list").fadeToggle();
    });
    $(".no").click(function () {
      easyDialog.close();
    })
    $("#bank-list").children('.c-item').click(function (e) {
      var hideNo = $(this).attr("hide-no");
      var cardNo = $(this).attr("card-no");
      var bankCode = $(this).attr("bank-code");
      $('input[name="card_no"]').val(cardNo);
      $('input[name="bkinfo_code"]').val(bankCode);
      $("#showCard").text("尾号（" + hideNo + "）");
      $("#bank-list").fadeOut();
      e.stopPropagation();
    });

    httpRequest.post("/common/getRandom", { channel_type: "01" }).done(function (data) {
      if (data.respHead.head_rtn_code == "000000") {
        random_num = data.respBody.random_num;
        random_uuid = data.respBody.random_uuid;
        $('input[name="random_uuid"]').val(random_uuid);
        $('input[name="random_num"]').val(random_num);
      }
    });
    $("#gzrje-new").bind('input propertychange', function (e) {
      return Edit1Change();
    });
    function Edit1Change() {
      $("#jeupddtext").text(chineseNumber(document.getElementById("gzrje-new").value));
    }
    function Edit2Change() {
      $("#jeupddtext").text(chineseNumber(document.getElementById("js-inputAmount").value));
    }
    function chineseNumber(dValue) {
      var maxDec = 2;
      // 验证输入金额数值或数值字符串：
      dValue = dValue.toString().replace(/,/g, "");
      dValue = dValue.replace(/^0+/, ""); // 金额数值转字符、移除逗号、移除前导零
      if (dValue == "") {
        return "零元";
      } // （错误：金额为空！）
      else if (isNaN(dValue)) { // IE8,9 value 值是 plachold属性值中文显示。所以注掉错误 直接显示0元
        return "零元";//"错误：金额不是合法的数值！";
      }
      var minus = ""; // 负数的符号“-”的大写：“负”字。可自定义字符，如“（负）”。
      var CN_SYMBOL = ""; // 币种名称（如“人民币”，默认空）
      if (dValue.length > 1) {
        if (dValue.indexOf('-') == 0) {
          dValue = dValue.replace("-", "");
          minus = "负";
        } // 处理负数符号“-”
        if (dValue.indexOf('+') == 0) {
          dValue = dValue.replace("+", "");
        } // 处理前导正数符号“+”（无实际意义）
      }
      // 变量定义：
      var vInt = "";
      var vDec = ""; // 字符串：金额的整数部分、小数部分
      var resAIW; // 字符串：要输出的结果
      var parts; // 数组（整数部分.小数部分），length=1时则仅为整数。
      var digits, radices, bigRadices, decimals; // 数组：数字（0~9——零~玖）；基（十进制记数系统中每个数字位的基是10——拾,佰,仟）；大基（万,亿,兆,京,垓,杼,穰,沟,涧,正）；辅币（元以下，角/分/厘/毫/丝）。
      var zeroCount; // 零计数
      var i, p, d; // 循环因子；前一位数字；当前位数字。
      var quotient, modulus; // 整数部分计算用：商数、模数。
      // 金额数值转换为字符，分割整数部分和小数部分：整数、小数分开来搞（小数部分有可能四舍五入后对整数部分有进位）。
      var NoneDecLen = (typeof (maxDec) == "undefined" || maxDec == null || Number(maxDec) < 0 || Number(maxDec) > 5); // 是否未指定有效小数位（true/false）
      parts = dValue.split('.'); // 数组赋值：（整数部分.小数部分），Array的length=1则仅为整数。
      if (parts.length > 1) {
        vInt = parts[0];
        vDec = parts[1]; // 变量赋值：金额的整数部分、小数部分
        if (NoneDecLen) {
          maxDec = vDec.length > 5 ? 5 : vDec.length;
        } // 未指定有效小数位参数值时，自动取实际小数位长但不超5。
        var rDec = Number("0." + vDec);
        rDec *= Math.pow(10, maxDec);
        rDec = Math.round(Math.abs(rDec));
        rDec /= Math.pow(10, maxDec); // 小数四舍五入
        var aIntDec = rDec.toString().split('.');
        if (Number(aIntDec[0]) == 1) {
          vInt = (Number(vInt) + 1).toString();
        } // 小数部分四舍五入后有可能向整数部分的个位进位（值1）
        if (aIntDec.length > 1) {
          vDec = aIntDec[1];
        } else {
          vDec = "";
        }
      } else {
        vInt = dValue;
        vDec = "";
        if (NoneDecLen) {
          maxDec = 0;
        }
      }
      if (vInt.length > 44) {
        return "错误：数值过大！整数位长【" + vInt.length.toString() + "】超过了上限！";
      }
      // 准备各字符数组 Prepare the characters corresponding to the digits:
      digits = new Array("零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"); // 零~玖
      radices = new Array("", "拾", "佰", "仟"); // 拾,佰,仟
      bigRadices = new Array("", "万", "亿", "兆", "京", "垓", "秭", "穰", "沟", "涧", "正"); // 万,亿,兆,京,垓,杼,穰,沟,涧,正
      decimals = new Array("角", "分", "厘", "毫", "丝"); // 角/分/厘/毫/丝
      resAIW = ""; // 开始处理
      // 处理整数部分（如果有）
      if (Number(vInt) > 0) {
        zeroCount = 0;
        for (i = 0; i < vInt.length; i++) {
          p = vInt.length - i - 1;
          d = vInt.substr(i, 1);
          quotient = p / 4;
          modulus = p % 4;
          if (d == "0") {
            zeroCount++;
          } else {
            if (zeroCount > 0) {
              resAIW += digits[0];
            }
            zeroCount = 0;
            resAIW += digits[Number(d)] + radices[modulus];
          }
          if (modulus == 0 && zeroCount < 4) {
            resAIW += bigRadices[quotient];
          }
        }
        resAIW += '元';
      }

      // 处理小数部分（如果有）
      for (i = 0; i < vDec.length; i++) {
        d = vDec.substr(i, 1);
        if (d != "0") {
          resAIW += digits[Number(d)] + decimals[i];
        }
      }
      // 处理结果
      if (resAIW == "") {
        resAIW = "零";
      } // 零元
      if (vDec == "") {
        resAIW;
      } // ...元整
      resAIW = CN_SYMBOL + minus + resAIW; // 人民币/负......元角分/整
      return resAIW;
    }



    // 获取输入框的值
    if (is_baby === '01') {
      $('#js-inputAmount').on('keyup', function () {
        var value = $(this).val();

        if (isNaN(Number(value))) {
          value = 0;
        } else {
          value = Number(value);
          Edit2Change();
        }

        httpRequest.post("/" + sub_url + "/recharge/queryRate", { amount: value, fundCode: fundCode }).done(function (data) {
          if (data.respHead.head_rtn_code == "000000") {
            $('#js-discountRate').text(data.respBody.fee_rate || '-');
            $('#js-rate').text('(' + (data.respBody.discount_fee_rate || '-') + ')');
          }
        });

      });
    }

  })
});
