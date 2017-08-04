require(['../../commonConfig'], function() {
    require(['jquery',
        'httpRequest',
        'message_zh',
        'global_dialog_common'
    ], function($, httpRequest, validate) {
    	// console.log(validate);
    	validate.initForm($("#form"));
        //配置验证规则、
        httpRequest.post("/common/getRandom", {channel_type: "01"}).done(function(data) {
            if (data.respHead.head_rtn_code == "000000") {
                console.log(data.respBody);
                random_num = data.respBody.random_num;
                random_uuid = data.respBody.random_uuid;
                $('input[name="random_uuid"]').val(random_uuid);
                $('input[name="random_num"]').val(random_num);
            }
        })
    })
})
