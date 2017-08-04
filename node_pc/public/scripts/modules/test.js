require(['../commonConfig'], function() {
    require([
        'jquery',
        'global_dialog_common',
        'httpRequest',
        'PassGuardCtrl',
    ], function($, dialog, httpRequest, PassGuardCtrl) {

        //*****密码控件*****
        httpRequest.post("/common/getRandom").done(function(data) {
            if (data.respHead.head_rtn_code == "000000") {
                random_num = data.respBody.random_num;
                random_uuid = data.respBody.random_uuid;
                $("#random_uuid")[0].value=random_uuid;
                console.log(data.respBody)
            }
        })

        httpRequest.post("/common/getPgeRZ").done(function(data) {
            if (data.respHead.head_rtn_code == "000000") {
                pgeRZRandNum = data.respBody.pgeRZRandNum;
                pgeRZDataB = data.respBody.pgeRZDataB;
                pgeditor.settings.pgeRZRandNum=pgeRZRandNum;
                pgeditor.settings.pgeRZDataB=pgeRZDataB;
                console.log(pgeditor)
                console.log(data.respBody)
            }
        })

        var pgeditor = new $.pge({
            pgePath: "./ocx/", //控件下载目录，可以指定绝对路径，如"http://www.baidu.com/download/"
            pgeId: "_ocx_password", //控件id
            pgeEdittype: 0, //控件显示类型,0(星号),1(明文)
            pgeEreg1: "[\\s\\S]*", //输入过程中字符类型限制，如"[0-9]*"表示只能输入数字
            pgeEreg2: "[\\s\\S]{6,12}", //输入完毕后字符类型判断条件，与pgeditor.pwdValid()方法对应
            pgeMaxlength: 12, //允许最大输入长度
            pgeTabindex: 2, //tab键顺序
            AffineX: AffineX,
            AffineY: AffineY,
            pgeBackColor: "#f5f5f5",
            pgeClass: "ocx_style3", //控件css样式
            pgeInstallClass: "ocx_style", //针对安装或升级的css样式
            pgeOnkeydown: "FormSubmit()", //回车键响应函数，需焦点在控件中才能响应
            tabCallback: "input2", //火狐tab键回调函数,设置要跳转到的对象ID
            //pgeOnfocus: "pgeFocus()", //监控光标切入密码控件框
            //pgeOnblur: "FormSubmit()", //监控光标切出密码控件框
            //windows10 edge&Chrome42+相关
            pgeWindowID: "password" + new Date().getTime() + 1,
            pgeRZRandNum: "97971748000895888789038158964609",//pgeRZRandNum, //这个后台返
            pgeRZDataB: "Eouam/LcrfetJjlpJZlDY8Auf5BC1nM6EgmhsE3aNkA=",//pgeRZDataB ////这个后台返 如果不对应 会报错。控件无法使用
        });
        window.pgeCtrl = pgeditor;
        $(function(){
            //$("#login").focus();
            pgeditor.pgInitialize();
            $("#_ocx_password_str1").html(pgeditor.load());
            pgeditor.pwdSetSk(random_num);//给控件设置随机因子
            //console.log(pgeditor.checkInstall());
        });

        //获取密码密文
        function FormSubmit() {
            pgeditor.pwdSetSk(random_num);
            var pwdResultNew = pgeditor.pwdResultSM2();
            var machineNetwork = pgeditor.machineNetwork();//获取网卡信息密文
            var machineDisk = pgeditor.machineDisk();//获取硬盘信息密文
            var machineCPU = pgeditor.machineCPU();//获取CPU信息密文
            _$("login_password").value = pwdResultNew;//将密码密文赋值给表单
            _$("local_network").value = machineNetwork;//将网卡和MAC信息密文赋值给表单
            _$("local_disk").value = machineDisk;//将硬盘信息密文赋值给表单
            _$("local_cpu").value = machineCPU;//将CPU信息密文赋值给表单
            //document.getElementById("#form1").submit();
        }

        $("#btn").on("click", function() {
            pgeditor.pwdSetSk(random_num);
            pgeditor.settings.pgeRZRandNum=pgeRZRandNum;
            pgeditor.settings.pgeRZDataB=pgeRZDataB;
            var pwdResultNew = pgeditor.pwdResultSM2();
            var machineNetwork = pgeditor.machineNetwork();//获取网卡信息密文
            var machineDisk = pgeditor.machineDisk();//获取硬盘信息密文
            var machineCPU = pgeditor.machineCPU();//获取CPU信息密文
            _$("login_password").value = pwdResultNew;//将密码密文赋值给表单
        })
        $("#login-submit").on("click", function() {
            FormSubmit()
        })

        $("#imgCode").on("click", function() {
            httpRequest.post("/common/getImgCode").done(function(data) {
                if (data.respHead.head_rtn_code == "000000") {
                    $("input[name='captcha_serno']").val(data.respBody.captcha_serno);
                    $("#imgCode img").attr("src", "data:image/png;base64," + data.respBody.captcha_img);
                }
            })
        });
        $("#imgCode").trigger("click");

    })

})
