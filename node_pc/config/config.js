module.exports = {
    config_file_path: "../config/jbt",
    session: {
        secret: 'TLBfund',
        key: 'TLBfund',
        maxAge: null//1000 * 60 * 60 * 1
    },
    fetchOptions: {
        headers: {
            dataType: 'json', // 返回格式
            accept: "application/json, text/plain, */*",
            contentType: "application/json;charset=utf-8"
        }
    },
    uris: {
        "P00001": "/syspub/tokenIdentify", //获取token
        "P00002": "/syspub/msgIdentify", //短信验证码
        "P00002S": "/syspub/msgIdentifyS", //短信验证码
        "P00003": "/syspub/imgIdentify", //获取图片验证码
        "P00004": "/syspub/emailIdentify", //邮箱获取验证码
        "P00005": "/syspub/getRandomNum", //获取随机数
        "P00006": "/syspub/getChannelPara", //获取渠道参数配置
        "P00008": "/syspub/riskWarnDetail", //提示信息查询接口
        "GetPgeRZ": "/syspub/getPgeRZ", //获取pc控件参数
        "A20001": "/acct/bankCardBoundS", //绑定银行卡
        "A20002": "/acct/changeBankCard", //更换银行卡
        "A20003": "/acct/custCardQuery", //用户卡列表
        "A20004": "/acct/isChangCard", //用户是否可换卡
        "A20005": "/acct/bankCardUnbound", //用户是否可换卡
        "C10001": "/cust/registerS", //注册
        "C10002": "/cust/loginS", //登录
        "C10003": "/cust/trustLoginWay", //齐鲁信任登录
        "C10004": "/cust/logout", //注销
        "C10005": "/cust/resetLoginPwd1", //登录密码重置-1
        "C10006": "/cust/resetLoginPwd2", //登录密码重置-2
        "C10007": "/cust/resetLoginPwd3", //登录密码重置-3
        "C10008": "/cust/modifyLoginPwd", //登录密码修改
        "C10009": "/cust/transPwdSet", //交易密码设置
        "C10010": "/cust/transPwdReset1S", //交易密码重置-1
        "C10011": "/cust/transPwdReset2", //交易密码重置-2
        "C10012": "/cust/transPwdModify", //交易密码修改
        "C10013": "/cust/custMsgQueryS", //用户信息查询
        "C10027": "/cust/custMsgModify", //用户信息修改
        "C10014": "/cust/modifyPhone1", //原手机号验证-1
        "C10015": "/cust/modifyPhone3", //新手机号设置-2
        "C10016": "/cust/modifyPhone2", //修改手机号安全验证
        "C10018": "/cust/boundEmail", //绑定邮箱
        "C10019": "/cust/modifyEmail1", //验证码原邮箱-1
        "C10020": "/cust/modifyEmail3", //新邮箱验证-2
        "C10021": "/cust/modifyEmail2", //邮箱修改安全验证
        "C10023": "/cust/riskQuestionQueryS", //风险题目评测
        "C10024": "/cust/custRiskS", //风险答案提交
        "C10017": "/cust/modifyBankPhone", //修改银行预留手机号
        "C10025": "/cust/isAgreeUpdateProtocol", //同意升级协议
        "C10028": "/cust/modifyInfoList", //个人信息修改下拉查询
        "C20001": "/cust/wechatLogin", //openid 登录
        "F30001": "/fundTrans/buyFundS", //购买/充值
        "F30002": "/fundTrans/redeemFund", //赎回/取现
        // "F30003": "/fundTrans/custShareQuery", // 客户份额查询
        "F30003": "/fundTrans/custShareQueryS", // 客户份额查询
        "F30004": "/fundTrans/fundTransQueryS", //交易查询
        "F30005": "/fundTrans/custComeQueryS", //收益分红查询
        // "F30006": "/fundTrans/fundListQuery", //基金列表查询
        "F30006": "/fundTrans/fundListQueryS", //基金列表查询
        "F30007": "/fundTrans/fundDetailQuery", //基金详情查询
        // "F30008": "/fundTrans/babyShareQuery", //XX包份额查询（查所有）
        "F30008":"/fundTrans/babyShareQueryS", //XX包份额查询（查购买 持仓）
        "F30009": "/fundTrans/fundNameQuery", //基金名称列表查询
        "F30010": "/fundTrans/fundRateFeeQuery", //基金费率查询
        "F30011": "/fundTrans/dividendMethodChange", //修改分红
        "F30012": "/fundTrans/hotFundQuery", //热销产品查询
        "F30013": "/fundTrans/babyFundListS", //宝类基金查询（适当性
        "F30015": "/fundTrans/fundDiscountFeeRateQuery", //基金折扣费率查询       
        "F30017": "/fundTrans/hpFundNameQuery", //搜索基金代码
        "F30014": "/fundTrans/custAssetQueryByFundType", //客户资产分布查询
        "F30018": "/fundTrans/taQuery", //基金公司查询
        "S40001": "/system/sysNoticeList", //系统公告列表
        "S40002": "/system/sysNoticeDetails", //系统公告详情
        "S40003": "/system/sysBankList",//银行名称查询
        "X10001": "/aipdatas/fundnav", //净值走势
        "X10003": "/aipdatas/fundnavhis", //历史净值
        "X10005": "/aipdatas/fundinfodeal", //基金概况
        "S40004": "/system/wtsDecrypt" //wts解密
    }
};
