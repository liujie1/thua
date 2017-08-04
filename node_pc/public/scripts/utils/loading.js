/*
   描述: loading
*/
define(['jquery', 'dialog'], function ($, dialog) {
    var text = $("#loading").find("p");
    return function (msg) {
        easyDialog.open({
            container: 'loading'
        });
        msg = msg ? msg : "正在提交,请稍等片刻...";
        text.html(msg);
        return {
            close: function () {
                easyDialog.close();
            }
        }
    }
});
