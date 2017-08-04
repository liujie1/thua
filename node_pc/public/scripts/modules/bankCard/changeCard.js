require(['../../commonConfig'], function() {
    require(['jquery',
        'authCode',
        'utils',
        'message_zh',
        'lodash',
        "simpletooltip",
        "pay_prompt_tip",
        "bnkcha_target_radio",
        'global_dialog_common'
    ], function($,
        authCode,
        utils, validate, _, simpletooltip) {
        // 初始化验证信息
        // $("#form").validate();
        var form = validate.initForm($("#form"));
        var message = $("#form").formMsg();


        //选择银行
        $('#select_bank').on('click', function() {
            $('.select-options').slideToggle(300)
        });
        $('#select_bank li').on('click', function(event) {
            event.preventDefault();
            var selectVal = $(this).text();
            var bkinfo_code = $(this).attr("data-val");
            var item = JSON.parse($(this).attr("data-list"));
            $('#select_bank .cur-bank').text(selectVal);
            $("input[name='bkinfo_code']").val(bkinfo_code);
            $("input[name='bkinfo_name']").val(selectVal);
             //setbkinfo(item.list);
        });

        function setbkinfo(list) {

            //填充页面
            // $("#pay_prompt_tip").pay_prompt_tip(list);
           // $("#select_bank").pay_prompt_tip(list);
            $("#bnkcha_target_radio").bnkcha_target_radio(list);
        }

        setbkinfo(bkinfo[0].list);



        $("#get-verifycode-btn").authCode({
            url: "/common/getCode",
            data: {
                tran_code: "A20002",
                phone: $("input[name='mobile']").val()
            },
            clickCallback: function(e, data) {
                data.phone = $("input[name='mobile']").val();
                var check = form.check($("input[name='mobile']"));
                if (!check) {
                    // form.defaultShowErrors();
                    e.preventDefault();
                }
            },
            successCallback: function(data) {
                $("input[name='smslog_serno']").val(data.respBody.smslog_serno);
                $("#hidePhone").text(utils.hidePhone($("input[name='mobile']").val()));
                $("#mobileTips").show();
            },
            errorCallback: function(data) {

                message.show(data.respHead.head_rtn_desc);
            },
            failCallback: function(error) {
                console.log(data);
                message.show(error);
            }
        });
    })
});
