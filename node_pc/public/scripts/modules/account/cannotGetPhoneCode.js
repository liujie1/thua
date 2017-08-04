require(['../../commonConfig'], function() {
    require(['jquery',
        'message_zh',
        'httpRequest',
        'global_dialog_common',
    ], function($, validate, httpRequest) {
        // 初始化验证信息
        // $("#form").validate();
        validate.initForm($("#form"));

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
