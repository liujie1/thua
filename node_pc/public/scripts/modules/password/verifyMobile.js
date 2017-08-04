require(['../../commonConfig'], function() {
    require(['jquery',
        'authCode',
        'lodash',
        'message_zh',
        'global_dialog_common'
    ], function($, authCode, _, validate) {
        //配置验证规则
        // $("#verifyMobileForm").validate();
        validate.initForm($("#form"));
        var message = $("#form").formMsg();

        $("#get-verifycode-btn").authCode({
            url: "/common/getCode",
            data: {
                tran_code: "C10007",
                phone: $("#mobileTips").attr("data-mobile")
            },
            successCallback: function(data) {
                $("input[name='smslog_serno']").val(data.respBody.smslog_serno);
                // 显示短信信息
                $("#mobileTips").css("display", "");
            },
            errorCallback: function(data) {
                message.show(data.respHead.head_rtn_desc);
            },
            failCallback: function(error) {
                message.show(error);
            }
        });

    })
})
