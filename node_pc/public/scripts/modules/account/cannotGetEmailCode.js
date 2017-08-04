require(['../../commonConfig'], function() {
    require(['jquery',
        'httpRequest',
        'authCode',
        'utils',
        'message_zh',
        'global_dialog_common'
    ], function($, httpRequest,
        authCode,
        utils, validate) {
        // 初始化验证信息
        // $("#form").validate();
        var form = validate.initForm($("#form"));
        var message = $("#form").formMsg();

        $("#get-verifycode-btn").authCode({
            url: "/common/getCode",
            data: {
                tran_code: "C10021",
                phone: $("#mobileTips").attr("data-mobile")
            },
            successCallback: function(data) {
                $("input[name='smslog_serno']").val(data.respBody.smslog_serno);
                $("#mobileTips").show();
            },
            errorCallback: function(data) {
                message.show(data.respHead.head_rtn_desc);
            },
            failCallback: function(error) {
                message.show(error);
            }
        });

        httpRequest.post("/common/getRandom", {channel_type: "01"}).done(function(data) {
            if (data.respHead.head_rtn_code == "000000") {
                var random_num = data.respBody.random_num;
                var random_uuid = data.respBody.random_uuid;
                $('input[name="random_uuid"]').val(random_uuid);
                $('input[name="random_num"]').val(random_num);
            }
        });
    })
});
