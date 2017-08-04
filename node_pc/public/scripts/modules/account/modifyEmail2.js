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
        var form = validate.initForm($("#form"));
        var message = $("#form").formMsg();

        $("#get-verifycode-btn").authCode({
            url: "/common/getEmailCode",
            data: {
                tran_code: "A10019",
                emailog_emailaddress: $("input[name='email']").val()
            },
            clickCallback: function(e, data) {
                data.emailog_emailaddress = $("input[name='email']").val();
                var check = form.check($("input[name='email']"));
                if (!check) {
                    form.defaultShowErrors();
                    e.preventDefault();
                }
            },
            successCallback: function(data) {
                $("input[name='emailog_serno']").val(data.respBody.emailog_serno);
                $("#hideEmail").text(utils.hideEmail($("input[name='email']").val()));
                $(".tip-info").show();
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
