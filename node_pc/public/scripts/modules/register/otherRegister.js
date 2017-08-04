// 其它用户注册，如以前网银用户
require(['../../commonConfig'], function() {
    require(['jquery',
        'httpRequest',
        'jsviews',
        'global_dialog_common'
    ], function($, httpRequest) {
        // 登录状态
        var loginStatus = {
            logined: true
        };
        var loginStatusTmpl = $.templates("#loginStatusTemplate");
        loginStatusTmpl.link("#login-status", loginStatus);

        // 添加checkbox样式
        $('.agree-btn').on('click', function() {
            if ($(this).attr("checked")) {
                $(this).removeAttr("checked").removeClass('checked');
            } else {
                $(this).attr("checked", 'true').addClass('checked');
            }
        })
    })
})
