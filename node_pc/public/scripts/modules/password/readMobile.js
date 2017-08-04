require(['../../commonConfig'], function() {
    require(['jquery',
        'message_zh',
        'global_dialog_common'
    ], function($, validate) {
    	// console.log(validate);
    	validate.initForm($("#form"));
        //配置验证规则
    })
})
