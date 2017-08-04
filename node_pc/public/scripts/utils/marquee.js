/* author: Mr.wang
 描述: 简易jQuery跑马灯插件
 */
define(['jquery'], function($) {
    $.fn.marquee = function(options) {
        // 默认参数
        var defaultOpts = {
            'direction': 'up', // 方向,目前只写了上
            'speed': '1500', // 切换速度
            'timer': '3000' // 切换间隔
        };
        // 合并默认参数
        var settings = $.extend({}, defaultOpts, options || {});
        //返回当前对象，维护链式调用
        return this.each(function() {
            // this转换jQuyer对象
            var $this = $(this).find('ul'),
                totalH = $this.height(), // 总高度
                lineH = $this.find('li').eq(0).height(), // 单个高度
                timer = settings.timer, // 切换间隔
                timerID; // 计时器对象ID
            // 当只有一条消息时候不执行运动
            if (lineH == totalH) return;
            // 自动播放
            var autoPlay = function() {
                timerID = setInterval(function() {
                    scrollUp();
                }, timer);
            };
            // 自动停止
            var autoStop = function() {
                clearInterval(timerID);
            };
            // 向上滚动
            function scrollUp() {
                $this.animate({ 
                    "marginTop": "-"  + lineH + 'px' 
                }, settings.speed, function() {                    
                    $this.children("li:first").insertAfter($this.children("li:last"));                    
                    $this.css("marginTop",  0);                
                });
            }
            // 监听鼠标事件
            $this.hover(autoStop, autoPlay).mouseout();
        })
    }
});
