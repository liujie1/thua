/*
   描述: 认证方式radio生成
*/
define(['jquery'], function($) {
    $.fn.bnkcha_target_radio = function(list) {
      $(this).empty()
      var that = $(this);
      _.forEach(list, function(item, i) {
          //签约方式渲染
          var optionsEl = $('<div class="quickly-mode">');
          var radio = $('<input id="quickly-mode" class="simpletooltip" name="cactlog_newmode" type="radio" />');
          var span = $('<span></span>');
          var des = $('<span class="des">'+ item.bnkcha_prompt+":&nbsp;&nbsp;" + item.pay_prompt +'</span>')
          radio.val(item.bnkcha_target);
          //span.val(JSON.parse(dict).cactlog_newmode[item.bnkcha_target]);
          if(i == 0){
            radio.attr("checked", "checked");
          }
          optionsEl.append(radio).append('<span>'+JSON.parse(dict).cactlog_newmode[item.bnkcha_target]+'</span><br>').append(des);
          that.append(optionsEl);
      });

    }
});
