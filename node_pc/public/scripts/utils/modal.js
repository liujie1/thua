/* author: Mr.wang
   描述: 简易jQuery模态弹框插件
*/
define(['jquery'], function($) {
    $.fn.modal = function(options) {
        // 默认参数
        var defaultOpts = {
            closeByDocument: false,
            showCloseButton: false
        };
        // 合并默认参数
        var settings = $.extend({}, defaultOpts, options || {});
        //返回当前对象，维护链式调用
        return this.each(function() {
            var body = $("body");
            var $modalContainer = $("<div class='modal-container'></div>");
            var $bg = $("<div class='modal-bg'></div>");
        })
    }
});