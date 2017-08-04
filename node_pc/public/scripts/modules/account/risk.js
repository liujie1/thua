require(['../../commonConfig'], function() {
    require(['jquery',
        'message_zh',
        'global_dialog_common'
    ], function($, validate) {
        // 初始化验证信息
        // $("#form").validate();
        validate.initForm($("#form"));

    })
});
