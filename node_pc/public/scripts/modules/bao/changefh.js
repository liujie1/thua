require(['../../commonConfig'], function () {
  require(['jquery',
    'httpRequest',
    'message_zh',
    'dialog',
    'utils',
    'loading',
    "simpletooltip",
    'global_dialog_common',
    'microdone',
    'microdone1'
  ], function ($, httpRequest, validate, dialog, utils, loading) {

        var prams={
            regist_custno:"",
            bkact_fncacct:"",
            fund_code:"",
            dividend_method:"",
            regist_custtrspwd:"",
        };
        var form = validate.initForm($("#fundForm"), "正在支付，请稍后。。。");

        var fund_name=$("#fundname").text();
        var fund_code=$("#fundcode").text();
        var bkact_fncacct=$("#bkact_fncacct")[0].value;
              
        $("#submit").on('click', function () {
            var fhfs = $('input:radio:checked').val();
            if(fhfs == "0"){
                $("#honglifs").text('红利再投');
            }else if(fhfs == "1"){
                $("#honglifs").text('现金分红');
            }
            $("input[name='pay_password']").val("");
            easyDialog.open({
                container: 'alertModal'
            });
        });
        $(".close-btn").click(function () {
            easyDialog.close();
        });
        $(".no").click(function () {
            easyDialog.close();
        });
        function filterDate(value, field, item, data){
            console.log(data.fixedDebtInfo);
            return utils.dateStr2DateStr(data.fixedDebtInfo[field], "YYYYMMDD", "YYYY-MM-DD");
        }
        httpRequest.post("/common/getRandom", {
            channel_type: "01"
        }).done(function (data) {
            if (data.respHead.head_rtn_code == "000000") {
                random_num = data.respBody.random_num;
                random_uuid = data.respBody.random_uuid;
                $('input[name="random_uuid"]').val(random_uuid);
                $('input[name="random_num"]').val(random_num);
            }
        });
        function syncData(url, params) {
            // console.log(params)
            var deferred = $.Deferred();
            httpRequest.post(url, params).then(function(sucData) {
                deferred.resolve(sucData);
            }, function(errData) {
                deferred.reject(errData);
            });
            return deferred;
        }        
        //修改分红
        $("#yes").click(function() {
            var fields = utils.serialize($("#fundForm"));
            if ($("#fundForm").valid()) {
                var dividend_method=$('input:radio:checked').val();
                var regist_custtrspwd=$(".pwd-content")[0].value;
                var srand = $('input[name="random_num"]').val();
                syncData("/funds/changefh", {
                    bkact_fncacct:bkact_fncacct,
                    fund_code:fund_code,
                    dividend_method:dividend_method,
                    regist_custtrspwd:SM2_Encrypt2(regist_custtrspwd, sm2KeyHex, "1", srand, false),
                    random_uuid: $('input[name="random_uuid"]').val()
                }).then(function(data) {
                    console.log("123",data);
                    $("#devide_container").hide();
                    $("#devide_result").show();
                    console.log(data.respHead.head_rtn_code);
                    if (data.respHead.head_rtn_code == "000000") {
                        console.log("修改成功")
                        // alert("恭喜您，修改成功！");
                        window.location.href = encodeURI(base_url + "/funds/changefhInfo?status=success&message=" + "恭喜您，修改成功！");
                        easyDialog.close();
                    } else {
                        console.log("修改失败")
                        window.location.href = encodeURI(base_url + "/funds/changefhInfo?status=error&message=" + data.respHead.head_rtn_desc)
                        // alert(data.respHead.head_rtn_desc);
                        //$("#devide_result").html(data.respHead.head_rtn_desc)
                    }
                })
            }     
        });

    })
})
