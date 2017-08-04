require(['../../commonConfig'], function () {
  require(['jquery',
    'authCode',
    'httpRequest',
    'lodash',
    'utils',
    'message_zh',
    'pay_prompt_tip',
    'bnkcha_target_radio',
    'global_dialog_common'
  ], function ($, authCode, httpRequest, _,utils, validate) {

    //选择银行
    $('#select_bank').on('click', function() {
      $(this).find('.select-options').slideToggle(300);
    });
    $('#select_bank li').on('click', function(event) {
      event.preventDefault();
      var selectVal = $(this).text();
      var bkinfo_code = $(this).attr("data-val");
      var item = JSON.parse($(this).attr("data-list"));
      $('#select_bank .cur-bank').text(selectVal);
      $("input[name='bkinfo_code']").val(bkinfo_code);
    });

    //配置验证规则
    // var form = validate.initForm($("#addCardForm"));
    var message = $("#form").formMsg();

    var select_bank_phone = $('input[name="bkinfo_phone"]').val();
    // console.log('AAAA',select_bank_phone)

    //获取短信验证码
    $("#get-verifycode-btn").authCode({
      url: "/common/getCode",
      data: {
        tran_code: "A20001",
        // phone: $("input[name='mobile']").val()
        phone: select_bank_phone
      },
      clickCallback: function (e, data) {
        data.phone = select_bank_phone;
        // data.phone = $("input[name='mobile']").val();
        // var check = form.check($("input[name='mobile']"));
        // if (!check) {
        //   form.defaultShowErrors();
        //   e.preventDefault();
        // }
      },
      successCallback: function (data) {
        $("input[name='smslog_serno']").val(data.respBody.smslog_serno);
        // $("#tips").html("验证码已发送至<strong>" + utils.hidePhone($("input[name='mobile']").val()) + "</strong>手机，请注意查收！")
        $("#tips").html("验证码已发送至<strong>" + utils.hidePhone(select_bank_phone) + "</strong>手机，请注意查收！")
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
