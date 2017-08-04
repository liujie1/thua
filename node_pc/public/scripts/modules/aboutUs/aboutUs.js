// 关于通华模块
require(['../../commonConfig'], function () {
  require([
    'jquery',
    'httpRequest',
    'slide',
    'global_dialog_common',
  ], function ($, httpRequest) {
    $(".tab-box").slide({trigger:"click",delayTime:0,pnLoop:false});
    
    var url = location.search;
    if(url.indexOf("xxpl")>0){
    	 $("#xin_xi_pi_lou").trigger("click");
    }
   
  })
})