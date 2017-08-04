require(['../../commonConfig'], function() {
    require(['jquery',
        'authCode',
        'httpRequest',
        'lodash',
        'utils',
        'message_zh',
        'pay_prompt_tip',
        'bnkcha_target_radio',
        'global_dialog_common',
        'area'
    ], function($, authCode, httpRequest, _, utils, validate) {
        // $('#select-bkact_acctno').on('click', function () {
        //   $(this).find('.select-options').slideToggle(300);
        // });
        //选择银行
        $('#select_bank').on('click', function() {
            $(this).find('.select-options').slideToggle(300);
        });
        $('#select_bank li').on('click', function(event) {
            event.preventDefault();
            var selectVal = $.trim($(this).text());
            var bkinfo_code = $(this).attr("data-val");
            var item = JSON.parse($(this).attr("data-list"));
            $('#select_bank .cur-bank').text(selectVal);
            $("input[name='bkinfo_code']").val(bkinfo_code);
            $("input[name='bkinfo_name']").val(selectVal);
            setbkinfo(item.list);
        });

        function setbkinfo(list) {
            //填充页面
            //   $("#pay_prompt_tip").pay_prompt_tip(list);
            // $("#select_bank").pay_prompt_tip(list);
            $("#bnkcha_target_radio").bnkcha_target_radio(list);
        }

        setbkinfo(bkinfo[0].list);

        //配置验证规则
        var form = validate.initForm($("#addCardForm"));
        var message = $("#form").formMsg();

        //获取短信验证码
        $("#get-verifycode-btn").authCode({
            url: "/common/getCode",
            data: {
                tran_code: "A20001",
                phone: $("input[name='mobile']").val()
            },
            clickCallback: function(e, data) {
                data.phone = $("input[name='mobile']").val();
                var check = form.check($("input[name='mobile']"));
                if (!check) {
                    form.defaultShowErrors();
                    e.preventDefault();
                }
            },
            successCallback: function(data) {
                $("input[name='smslog_serno']").val(data.respBody.smslog_serno);
                $("#tips").html("验证码已发送至<strong>" + utils.hidePhone($("input[name='mobile']").val()) + "</strong>手机，请注意查收！")
            },
            errorCallback: function(data) {
                message.show(data.respHead.head_rtn_desc);
            },
            failCallback: function(error) {
                message.show(error);
            }
        });
    })
});
