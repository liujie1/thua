require(['../../commonConfig'], function() {
    require(['jquery',
        'authCode',
        'utils',
        'message_zh',
        'lodash',
        "simpletooltip",
        "pay_prompt_tip",
        "bnkcha_target_radio",
        'global_dialog_common'
    ], function($,
                authCode,
                utils, validate, _, simpletooltip) {

        // $("#form").validate();
        var form = validate.initForm($("#form"));
        var message = $("#form").formMsg();

        $("#get-verifycode-btn").authCode({
            url: "/common/getCode",
            data: {
                tran_code: "A20002",
                phone: $("input[name='mobile']").val()
            },
            clickCallback: function(e, data) {
                data.phone = $("input[name='mobile']").val();
                var check = form.check($("input[name='mobile']"));
                if (!check) {
                    // form.defaultShowErrors();
                    e.preventDefault();
                }
            },
            successCallback: function(data) {
                $("input[name='smslog_serno']").val(data.respBody.smslog_serno);
                $("#hidePhone").text(utils.hidePhone($("input[name='mobile']").val()));
                $("#mobileTips").show();
            },
            errorCallback: function(data) {

                message.show(data.respHead.head_rtn_desc);
            },
            failCallback: function(error) {
                console.log(data);
                message.show(error);
            }
        });
    })
});
