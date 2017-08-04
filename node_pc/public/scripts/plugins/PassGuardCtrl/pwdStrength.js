/* 
* 描述: 密码强度模块
*/
define([], function () {
  var classList = {
    "0": { "Elclass": "low", "text": "低" },
    "1": { "Elclass": "low", "text": "low" },
    "2": { "Elclass": "middle", "text": "中" },
    "3": { "Elclass": "high", "text": "高" }
  };

  //获取密码强度
  window.GetLevel = function (eleIdx) {
    // 这里是用密码控件暴露出来的window对象上的方法
    // 0 : 密码为空
    // 1 : 密码长度为6位以上（含6位），包含字母、数字、特殊字符
    //    中的一种；
    // 2 : 密码长度为6位以上（含6位），包含字母、数字、特殊字符
    // 中的两种；
    // 3 : 密码长度为6位以上（含6位），包含字母、数字、特殊字符
    // 中的三种。
    var pwdLevel = pgeditor.pwdStrength();
    console.log('表单控件的下标元素和安全等级1', eleIdx, pwdLevel)
    SetPWDStrength(eleIdx, pwdLevel);
  }
  
  window.GetLevel2 = function (eleIdx) {
    var pwdLevel = pgeditor2.pwdStrength();
    console.log('表单控件的下标元素和安全等级2', eleIdx, pwdLevel)
    SetPWDStrength(eleIdx, pwdLevel);
  }

  window.GetLevel3 = function (eleIdx) {
    var pwdLevel = pgeditor3.pwdStrength();
    console.log('表单控件的下标元素和安全等级3', eleIdx, pwdLevel)
    SetPWDStrength(eleIdx, pwdLevel);
  }

  //判断密码强度
  function SetPWDStrength(eleIdx, pwdLevel) {
    var em = $(".inpur-outer-pwd-level").eq(eleIdx).children("em");
    em.removeClass();
    em.addClass(classList[pwdLevel].Elclass);
    em.text(classList[pwdLevel].text);
  }

});