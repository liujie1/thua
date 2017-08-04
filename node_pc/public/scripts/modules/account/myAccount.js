require(['../../commonConfig'], function () {
    require(['jquery',
        'httpRequest',
        'lodash',
        'message_zh',
        'dialog',
        'utils',
        'loading',
        'echarts',
        'global_dialog_common',
        'simpletooltip',
        'microdone',
        "microdone1"
    ], function ($, httpRequest, _, validate, dialog, utils, loading, echarts) {
        //var noticeModal = $("#noticeModal");
        console.log(assetsList)
        var prams = {
            regist_custno: "",
            bkact_fncacct: "",
            fund_code: "",
            dividend_method: "",
            regist_custtrspwd: ""
        }

        var fund_name = $(".myAccount .model-form .fund_name")[0];
        var fund_code = $(".myAccount .model-form .fund_code")[0];
        var regist_custno = $(".myAccount .model-form .regist_custno")[0];
        var bkact_fncacct = $("#bkact_fncacct")[0].value;

        $(".open").click(function (event) {
            event.stopPropagation();
            $("#devide_container").show();
            $("#devide_result").hide();
            open();
            $("#pay_pwd").val("");
            var name = $(this).parent().parent().find(".fund_name")[0].innerHTML;
            var code = $(this).parent().parent().find(".fund_code")[0].value;
            fund_name.innerHTML = name;
            fund_code.innerHTML = code;
        });

        function syncData(url, params) {
            // console.log(params)
            var deferred = $.Deferred();
            httpRequest.post(url, params).then(function (sucData) {
                deferred.resolve(sucData);
            }, function (errData) {
                deferred.reject(errData);
            });
            return deferred;
        }

        httpRequest.post("/common/getRandom", { channel_type: "01" }).done(function (data) {
            if (data.respHead.head_rtn_code == "000000") {
                random_num = data.respBody.random_num;
                random_uuid = data.respBody.random_uuid;
                $('input[name="random_uuid"]').val(random_uuid);
                $('input[name="random_num"]').val(random_num);
            }
        });
        var chartData = [];
        var cc = [{ normal: { color: '#e7141a' } },
        { normal: { color: '#ea531a' } },
        { normal: { color: '#ee7717' } },
        { normal: { color: '#efaf1a' } },
        { normal: { color: '#eeea38' } },
        { normal: { color: '#3eb134' } },
        { normal: { color: '#25943a' } },
        { normal: { color: '#158471' } },
        { normal: { color: '#2761ad' } },
        { normal: { color: '#544197' } },
        { normal: { color: '#5f308f' } },
        { normal: { color: '#881b88' } }
        ]
        // //assetsList
        // var assetsList = [{fundtype_code:"000078",fundtype_name:"万小宝1",fundtype_total_amt:88888,funtype_total_percent:400},
        // {fundtype_code:"000079",fundtype_name:"万小宝2",fundtype_total_amt:88888,funtype_total_percent:500},
        // {fundtype_code:"000178",fundtype_name:"万小宝3",fundtype_total_amt:88888,funtype_total_percent:600},
        // {fundtype_code:"000228",fundtype_name:"万小宝4",fundtype_total_amt:88888,funtype_total_percent:700}]
        _.map(assetsList,function (item, index) {
            chartData.push({ value: item.funtype_total_percent, name: item.fundtype_name, itemStyle: cc[index] })
            chartData = chartData
        })
        console.log(chartData)
        // 初始化资产饼图
        if ($("#accountEchart").length > 0) {
            var trendChart = echarts.init(document.getElementById('accountEchart'));
            // 饼图配置
            trendChart.setOption({
                width: "260px",
                height: "260px",
                type: 'hideTip',
                tooltip: {
                    trigger: 'item',
                    formatter: "{b} : {c}%"
                },
                series: [
                    {
                        name: '',
                        type: 'pie',
                        radius: ['50%', '70%'],
                        avoidLabelOverlap: false,
                        label: {
                            normal: {
                                show: false,
                                position: 'center'
                            },
                            emphasis: {
                                show: false,
                                textStyle: {
                                    fontSize: '30',
                                    fontWeight: 'bold'
                                }
                            }
                        },
                        labelLine: {
                            normal: {
                                show: false
                            }
                        },
                        legendHoverLink: false,
                        hoverAnimation: false,
                        data: chartData
                    }
                ]
            });
        }

        //修改分红
        $("#ok-btn").click(function () {
            var dividend_method = $("#dividend_method")[0].value;
            var regist_custtrspwd = $(".model-form .pwd-content")[0].value;
            var srand = $('input[name="random_num"]').val();
            syncData("/myAccount/changeDividend", {
                bkact_fncacct: bkact_fncacct,
                fund_code: fund_code.innerHTML,
                dividend_method: dividend_method,
                regist_custtrspwd: SM2_Encrypt2(regist_custtrspwd, sm2KeyHex, "1", srand, false),
                random_uuid: $('input[name="random_uuid"]').val()
            }).then(function (data) {
                $("#devide_container").hide();
                $("#devide_result").show();
                console.log(data.respHead.head_rtn_code);
                if (data.respHead.head_rtn_code == "000000") {
                    console.log("修改成功")
                    $("#devide_result").html("恭喜您，修改成功！")
                } else {
                    console.log("修改失败")
                    $("#devide_result").html(data.respHead.head_rtn_desc)
                }
            })
        });


        $("#dialog-close-btn").click(function () {
            //window.location.href="/";
            close();
        });

        $("#close-btn").click(function () {
            close();
        });


        function open() {
            easyDialog.open({
                container: 'midifyModal'
            });
        }
        function close() {
            easyDialog.close();
        }

        $('.simpletooltip').simpletooltip({
            themes: {
                pink: {
                    color: 'red',
                    border_color: 'red',
                    background_color: 'pink',
                    border_width: 4
                },
                brazil: {
                    color: 'yellow',
                    background_color: 'green',
                    border_color: 'yellow',
                    border_width: 4
                }
            }
        });

    })
});
