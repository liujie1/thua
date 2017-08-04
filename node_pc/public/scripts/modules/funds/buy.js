require(['../../commonConfig'], function() {
    require(['jquery',
        'message_zh',
        'global_dialog_common'
    ], function($, validate) {
        validate.initForm($("#form"));
    })
})
