require(['../../commonConfig'], function() {
    require(['jquery',
        'httpRequest',
        'utils',
        'message_zh',
        'global_dialog_common'
    ], function($,
        httpRequest,
        utils, validate) {
        // 初始化验证信息
        // $("#form").validate();
        validate.initForm($("#form"));

        // 是否已获取验证码
        var isGetCode = false;
        //获取短信验证码
        $("#get-verifycode-btn").on("click", function(event) {
            event.preventDefault();
            if (isGetCode) return;
            var mobile = $("#mobileTips").attr("data-mobile");
            httpRequest.post("/getCode", {
                mobile: mobile,
                tran_code: "A10014"
            }).done(function(data) {
                if (data.respHead.head_rtn_code == "000000") {
                    $("input[name='serial_number']").val(data.respBody.serial_number);
                    isGetCode = true;
                    var countdownObj = utils.countdown(60);
                    countdownObj.run(function(s) {
                        $("#get-verifycode-btn").text("重新获取" + s + "s").addClass("sending");
                    }, function() {
                        $("#get-verifycode-btn").text("获取验证码").removeClass("sending");
                        isGetCode = false;
                    });
                    // 显示短信信息
                    $("#mobileTips").show();
                } else {
                    validate.showErrMsg(data.respHead.head_rtn_desc);
                }
            });
        });

    })
});
