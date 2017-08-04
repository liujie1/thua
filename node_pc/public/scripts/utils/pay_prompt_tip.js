/*
   描述: 支付限额提示信息
   TODO: title tip信息不能更新 需要处理
*/
define(['jquery'], function($) {
    $.fn.pay_prompt_tip = function(list) {
        console.log($(this))
        $(this).children('.new-tip-rule').remove();
        var pay_prompt = "";
        var isShow = false;
        var $tipEl = $('<div class="new-tip-rule" style=""></div>');
        _.forEach(list, function(item, i) {
            //pay_prompt_tip 提示
            if (item.pay_prompt) {
                pay_prompt = pay_prompt + JSON.parse(dict).cactlog_newmode[item.bnkcha_target];
                pay_prompt = pay_prompt + item.pay_prompt + "<br/>";
            }
            //end pay_prompt_tip 提示
            if (pay_prompt) {
                isShow = true
            }
        });
        if (isShow) {
            console.log(pay_prompt)
            console.log($(this))
            $(this).append($tipEl.append(pay_prompt));
            // $tipEl.attr("title", pay_prompt);
            // $(this).append($tipEl);
        }
        var toolTips = $('.simpletooltip').simpletooltip({
            themes: {
                pink: {
                    color: 'red',
                    border_color: 'red',
                    background_color: 'pink',
                    border_width: 4
                },
                brazil: {
                    color: 'yellow',
                    background_color: 'green',
                    border_color: 'yellow',
                    border_width: 4
                }
            }
        });
    }
});
