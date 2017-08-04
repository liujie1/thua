require(['../../commonConfig'], function() {
    require(['jquery',
        'httpRequest',
        'lodash',
        'utils',
        'global_dialog_common'
        
    ], function($, httpRequest, _,utils) {
      //选项卡部分代码
      $(".form-pronav li").click(function(){
        $(this).addClass("onform-pronav")
        $(this).siblings().removeClass('onform-pronav');
        var silDiv = $(this).parents(".form-profile").find(".form-protabcon");
        silDiv.hide().eq($(this).index()).show();
      });
      $(".bankclick").click(function(){
           $(".form-pronav li").eq(1).click()
      })
      //选项卡部分代码结束
      //日期渲染
        function dateRender(data) {
            return utils.dateStr2DateStr(data, "YYYYMMDD", "YYYY-MM-DD");
        }
       
        //alert(dateRender(acc))
       
    })
});
