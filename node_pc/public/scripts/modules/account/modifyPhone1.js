require(['../../commonConfig'], function() {
    require(['jquery',
        'authCode',
        'utils',
        'message_zh',
        'global_dialog_common'
    ], function($,
        authCode,
        utils, validate) {
        // 初始化验证信息
        // $("#form").validate();
        validate.initForm($("#form"));
        var message = $("#form").formMsg();

        $("#get-verifycode-btn").authCode({
            url: "/common/getCode",
            data: {
                tran_code: "C10014",
                phone: $("#mobileTips").attr("data-mobile")
            },
            successCallback: function(data) {
                $("input[name='smslog_serno']").val(data.respBody.smslog_serno);
                // 显示短信信息
                $("#mobileTips").show();
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
