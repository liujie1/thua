require(['../../commonConfig'], function() {
    require(['jquery',
        'authCode',
        'lodash',
        'message_zh',
        'global_dialog_common'
    ], function($, authCode, _, validate) {
        //配置验证规则
        // $("#verifyMobileForm").validate();
        var form = validate.initForm($("#form"));
        var message = $("#form").formMsg();

        $("#get-verifycode-btn").authCode({
            url: "/common/getEmailCode",
            data: {
                tran_code: "C10007",
                emailog_emailaddress: $("#get-verifycode-btn").attr("data-email")
            },
            successCallback: function(data) {
                $("input[name='emailog_serno']").val(data.respBody.emailog_serno);
                // 显示短信信息
                $("#tips").css("display", "");
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
