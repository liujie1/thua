require(['../../commonConfig'], function() {
    require(['jquery',
        'message_zh',
        "loading",
        'global_dialog_common'
    ], function($, validate, loading) {
        validate.initForm($("#form"), "正在支付,请耐心等待...");

    })
})
