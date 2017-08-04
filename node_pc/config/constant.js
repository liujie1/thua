var base_url = "/company";
var h5_base_url = "/company";
module.exports = {
	port: "8090",
	title: "上海通华财富资产管理有限公司",
	head_channel_code: "78260000", //渠道代码04145210
	head_channel_code_sub: "7826000000", //子渠道
	baby_name: "万小宝", //宝类的名称 不同的银行名称不一样
	base_url: "/company", //项目根路径
	h5_base_url: h5_base_url,
	base_url: "/company", //静态资源根路径
	bank_phone:"95156转5",//客服电话
	has_funds: true, //是否有基金超市模块
	img_theme_finder: "red", //图片主题文件夹
	logo_file_path: "/company/images/common/logo.png", //页面logo  //logo.png //self_ql_logo.png
	bank_finder_name: "channel/allinpay",
	baby_code: "100003", //宝宝代码
	local_RSA_private_path: "../key/lphk.key",
	server_RSA_public_path: "../key/sphk.key",
	bindCardCallBackUrl:"http://192.168.31.16:8090"+ base_url +"/account/bankCard/EbankCallback/bind",//网银绑卡回调url
	changeCardCallBackUrl: "http://localhost:8090"+ base_url +"/account/bankCard/EbankCallback/change", //网银换卡回调url
	addCardCallBackUrl: "http://localhost:8090"+ base_url +"/account/bankCard/EbankCallback/add", //网银换卡回调url
	// bindCardCallBackUrl:"https://www.tonghuafund.com"+ base_url +"/account/bankCard/EbankCallback/bind",//网银绑卡回调url 生产
	// changeCardCallBackUrl: "https://www.tonghuafund.com"+ base_url +"/account/bankCard/EbankCallback/change", //网银换卡回调url 生产
	// addCardCallBackUrl: "https://www.tonghuafund.com"+ base_url +"/account/bankCard/EbankCallback/add", //网银换卡回调url 生产
	AffineX:"E8D4F279E1CE909959050B7455E1F2400C78FBD40E19449BB6DE338C12D7247F",
	AffineY:"44FD69FB4A90F87D400084501CEB8F879AFE474CD301C4534A56694EEDAC337A",
	sm2KeyHex: "04E8D4F279E1CE909959050B7455E1F2400C78FBD40E19449BB6DE338C12D7247F44FD69FB4A90F87D400084501CEB8F879AFE474CD301C4534A56694EEDAC337A", //国密公钥

	//生产
	// AffineX:"9134F7A7CC0C928F8E985CFFBAFDA97D51B6573964E17D7EA5DCE10F33F2B67C",
	// AffineY:"CFC22C20331D71DBDD6B6DC1B5EEB0CFF57F005FA57934F30F45DCE918BB75EA",
	// sm2KeyHex: "049134F7A7CC0C928F8E985CFFBAFDA97D51B6573964E17D7EA5DCE10F33F2B67CCFC22C20331D71DBDD6B6DC1B5EEB0CFF57F005FA57934F30F45DCE918BB75EA", //国密公钥

	httpUrl: "http://101.37.36.226:8088", //阿里云
	convertBaseUrl: "http://121.40.17.199:9801/api",

	// httpUrl: "http://172.16.61.87:8080",//生产
	// convertBaseUrl: "http://172.16.189.74:9081/api", //生产

	// httpUrl: "http://192.168.31.184:8080",
	//  httpUrl: "http://10.2.13.201:8080",
    appid: "wx4df4d4b039d5134a",
    appsecret: "d4624c36b6795d1d99dcf0547af5443d",
	trust_login: false, //是否支持信任登录 信任登录 修改手机号功能不能使用，登录密码模块不能使用
	pc_trust_login_url: "/directbank/trustLogin.action", //pc信任登录请求地址
	pc_trust_login_field_name: { //pc请求字段名
		request_xml: "plain",
		sign_msg: "sign"
	},
	bank_home_url: "https://ebank.qlbchina.com/directbank/logon_db.jsp", //信任登录退出登录 session过期跳转页面地址
	wechat_head_channel_code: "04202220",
	wechat_head_channel_code_sub: "0420222001",
	h5_trust_login: false, //是否支持H5信任登录
	h5_head_channel_code: "0420222002", //渠道代码04145210
	h5_head_channel_code_sub: "042022200200", //子渠道
	h5_trust_login_url: "/zijinbao", //h5信任登录
	h5_trust_login_field_name: { //H5请求字段名
		request_xml: "plain",
		sign_msg: "sign"
	},
	// wap_trust_login_redirect_URl: "/build/#/typeFunds", //手机版信任登录跳转H5页面 有H5功能才能使用
	trustAddBankCard_uri: "/build/#/trustBindBankCard", //h5绑卡页面
	setPayPwd_uri: "/build/#/setPayPwd", //h5 设置交易密码
	funds_uri: "/build/#/productIndex", //h5 基金超市页面
	bao_uri: "/build/#/typeFunds", //h5 宝宝页面
	error_uri: "/build/#/commonerror"

};
