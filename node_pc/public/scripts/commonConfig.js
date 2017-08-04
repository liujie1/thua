require.config({
  waitSeconds: 30,
  // 相对路径
  baseUrl: base_url + "/scripts/libs/",
  // 路径
  paths: {
    // 依赖的库
    "jquery": "jquery/jquery.min",
    "lodash": "lodash/lodash.min",
    "moment": "moment/moment",
    "cookie": "cookie/cookie",
    "json2": "cookie/json2",
    "validate": "jquery-validate/jquery.validate",
    "message_zh": base_url + "/scripts/utils/messages_zh",
    "constant": base_url + "/scripts/constant",
    "dialog": "easydialog/easydialog",
    "deserialize": "jquery-deserialize/dist/jquery.deserialize.min",
    "crypto": "crypto-js/crypto-js",

    // 插件库
    "slide": base_url + "/scripts/plugins/slide/slide",
    "modal": base_url + "/scripts/plugins/modal/modal", // 模态弹框
    // "pagination": "/scripts/plugins/pagination/pagination", // 分页
    "echarts": base_url + "/scripts/plugins/echarts/echarts.common.min", //图标
    "pagination": "pagination/js/jquery.pagination",
    "simpletooltip": "Simpletooltip-master/src/js/simpletooltip", //提示
    "date": base_url + "/scripts/plugins/date/laydate", // 日期
    "area": base_url + "/scripts/plugins/area/area", // 

    //密码控件
    "crypt": base_url + "/scripts/plugins/PassGuardCtrl/crypto-js", //密码控件
    "PassGuardCtrl": base_url + "/scripts/plugins/PassGuardCtrl/PassGuardCtrl", //密码控件
    "microdone": base_url + "/scripts/plugins/PassGuardCtrl/microdone-h5.min", //密码控件
    "microdone1": base_url + "/scripts/plugins/PassGuardCtrl/microdone.min",
    // "thickbox": base_url + "/scripts/plugins/PassGuardCtrl/thickbox", // 密码控件
    "pwdStrength": base_url + "/scripts/plugins/PassGuardCtrl/pwdStrength", // 检测密码强度 

    "tradeRecordTpl": base_url + "/scripts/components/tradeRecordTpl",//交易查询模板
    "yieldRecordTpl": base_url + "/scripts/components/yieldRecordTpl",//收益查询模板

    // 自定义工具类
    "utils": base_url + "/scripts/utils/utils",
    "httpRequest": base_url + "/scripts/utils/httpRequest",
    "marquee": base_url + "/scripts/utils/marquee", // 公告跑马灯
    "table": base_url + "/scripts/utils/table", //表格
    "loading": base_url + "/scripts/utils/loading",
    "encrypt": base_url + "/scripts/utils/encrypt",
    "authCode": base_url + "/scripts/utils/authCode", //验证码获取
    "pay_prompt_tip": base_url + "/scripts/utils/pay_prompt_tip", //支付限额提示信息
    "bnkcha_target_radio": base_url + "/scripts/utils/bnkcha_target_radio", //认证方式radio生成
    "global_dialog_common": base_url + "/scripts/utils/common",
    "utils": base_url + "/scripts/utils/utils",
    "httpRequest": base_url + "/scripts/utils/httpRequest",
    "marquee": base_url + "/scripts/utils/marquee", // 公告跑马灯
    "table": base_url + "/scripts/utils/table", //表格
    "loading": base_url + "/scripts/utils/loading",
    "encrypt": base_url + "/scripts/utils/encrypt",
    "authCode": base_url + "/scripts/utils/authCode", //验证码获取
    "pay_prompt_tip": base_url + "/scripts/utils/pay_prompt_tip", //支付限额提示信息
    "bnkcha_target_radio": base_url + "/scripts/utils/bnkcha_target_radio", //认证方式radio生成
    "global_dialog_common": base_url + "/scripts/utils/common"
  },
  // 依赖
  shim: {
    "pagination": ["jquery"],
    "loading": ["jquery"],
    "httpRequest": ["jquery"],
    "marquee": ["jquery"],
    "cookie": ["json2"],
    "table": ["jquery"],
    "slide": {
      deps: ['jquery'],
      exports: 'slide'
    },
    "PassGuardCtrl": ["crypt", 'jquery'],
    "modal": ["jquery"],
    "simpletooltip": ["jquery"],
    "utils": ["jquery"],
    "deserialize": ["jquery"],
    "pay_prompt_tip": ["jquery", 'simpletooltip']
  }
});
