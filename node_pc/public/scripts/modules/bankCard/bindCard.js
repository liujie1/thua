require(['../../commonConfig'], function () {
  require(['jquery',
    'authCode',
    'lodash',
    'utils',
    'message_zh',
    'area',
    'pay_prompt_tip',
    'bnkcha_target_radio',
    'global_dialog_common',
    'modal'
  ], function ($,
    authCode,
    _,
    utils, validate, area) {
      area.init_area();

      // 返显收货地址
      if (fields.province) {
        $("#s_province").find("option[value=" + fields.province + "]").attr("selected", true).trigger("change");
      }

      if (fields.city) {
        $("#s_city").find("option[value=" + fields.city + "]").attr("selected", true);
      }


      $('a[data-modal]').on('click', function () {
        $(this).modal();
        return false;
      });
      $('#select-bkact_acctno').on('click', function () {
        $(this).find('.select-options').slideToggle(300);
      });

      //选择银行
      $('.selected-bank').on('click', function () {
        $(this).find('.select-options').slideToggle(300);
      });
      $('.selected-bank li').on('click', function (event) {
        event.preventDefault();
        var selectVal = $.trim($(this).text());
        var bkinfo_code = $(this).attr("data-val");
        var item = JSON.parse($(this).attr("data-list"));
        $('.selected-bank .cur-bank').text(selectVal);
        $("input[name='bkinfo_code']").val(bkinfo_code);
        $("input[name='bkinfo_name']").val(selectVal);
        setbkinfo(item.list);
      });

      function setbkinfo(list) {
        //填充页面
        // $("#select_bank").pay_prompt_tip(list);
        $("#pay_prompt_tip").pay_prompt_tip(list);
        $("#bnkcha_target_radio").bnkcha_target_radio(list);
        $("input[name='cactlog_newmode']").change(function(){
          console.log($(this).val());
        })
      }

      setbkinfo(bkinfo[0].list);

      //配置验证规则
      // $("#addCardForm").validate();
      var form = validate.initForm($("#addCardForm"));
      var message = $("#addCardForm").formMsg();

      $("#get-verifycode-btn").authCode({
        url: "/common/getCode",
        data: {
          tran_code: "A20001",
          phone: $("input[name='mobile']").val()
        },
        clickCallback: function (e, data) {
          data.phone = $("input[name='mobile']").val();
          var check = form.check($("input[name='mobile']"));
          if (!check) {
            form.defaultShowErrors();
            e.preventDefault();
          }
        },
        successCallback: function (data) {
          $("input[name='smslog_serno']").val(data.respBody.smslog_serno);
          $("#tips").html("验证码已发送至<strong>" + utils.hidePhone($("input[name='mobile']").val()) + "</strong>手机，请注意查收！")
        },
        errorCallback: function (data) {
          message.show(data.respHead.head_rtn_desc);
        },
        failCallback: function (error) {
          message.show(error);
        }
      });

    })


});
