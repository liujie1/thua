require(['../../commonConfig'], function() {
    require(['jquery',
        'message_zh',
        'utils',
        'httpRequest',
        'authCode',
        'global_dialog_common'
    ], function($, validate, utils, httpRequest, authCode) {

        // console.log(validate);
        validate.initForm($("#form"));
        var message = $("#form").formMsg();

        $("#get-verifycode-btn").authCode({
            url: "/common/getCode",
            data: {
                tran_code: "C10011",
                phone: $("#get-verifycode-btn").attr("data-phone")
            },
            successCallback: function(data) {
                $("input[name='smslog_serno']").val(data.respBody.smslog_serno);
                $("#mobileTips").css("display", ""); //显示短线发送成功提示
            },
            errorCallback: function(data) {
                message.show(data.respHead.head_rtn_desc);
            },
            failCallback: function(error) {
                message.show(error);
            }
        })

    })
})
