require(['../../commonConfig'], function () {
    require(['echarts', 'utils', 'moment', 'httpRequest', 'lodash', 'global_dialog_common', 'slide', 'dialog', 'tradeRecordTpl', 'yieldRecordTpl'], function (echarts, utils, moment, httpRequest, _) {

        // $(".bao-slide").slide({
        //     trigger: "click",
        //     pnLoop: false
        // });
        $(".shouy-btn1").on('click', function () {
            easyDialog.open({
                container: 'jiaoyi_info1',
                fixedHeight: true,
                fixedWidth: '1170'
            });
        });
        $(".shouy-btn2").on('click', function () {
            easyDialog.open({
                container: 'jiaoyi_info2',
                fixedHeight: true,
                fixedWidth: '1170'
            });
        });
        $(".shouy-btn3").on('click', function () {
            easyDialog.open({
                container: 'jiaoyi_info3',
                fixedHeight: true,
                fixedWidth: '1170'

            });
        });
        $(".close-btn").click(function () {
            easyDialog.close();
        });
        $(".baobao-tab li").click(function () {
            var index = $(this).index();
            var num = index - 1;
            if (index !== 0) {
                $(this).addClass("on").siblings().removeClass("on");
                $(this).parents(".bao-box").find(".bao-tab").eq(num).removeClass("hide").siblings(".bao-tab").addClass("hide")
            }
        })
        //选择时间插件
        $.fn.timeZone = function (fn) {
            return this.each(function (index, item) {
                var $dateTab = $(this).find("span[end-date]");
                $dateTab.each(function (idx, item) {
                    $(item).click(function () {
                        $dateTab.removeClass("on");
                        $(item).addClass("on");
                        fn($(item).attr("end-date"));
                    });
                    if (idx == 0) {
                        $(item).click();
                    }
                });
            });
        };
        var babyEdata = babyCanvas.list;
        var qrnhEcharts = {};
        var wfsyEcharts = {};

        //循环绑定点击时间
        $.each(babyEdata, function (index, item) {
            $("#TimeZone" + item.fund_code).timeZone(function (value) {
                queryTrend(value, item.fund_code);
            });
            $("#TimeWan" + item.fund_code).timeZone(function (value) {
                queryWan(value, item.fund_code);
            });
        })
        var month = moment().subtract(1, 'months').format("YYYYMMDD"); //获取当前一月
        //默认执行一次
        // queryTrend(month);
        // queryWan(month);
        //图表循环
        $.each(babyEdata, function (index, item) {
            var head = document.getElementsByTagName('head').item(0);
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = convertBaseUrl + "/Chart/" + item.fund_code + "/json/wfsy.json";
            head.appendChild(script);
        })
        function queryTrend(start_date, fundCode) {

            var timer = [];
            $.each(babyEdata, function (index, item) {
                if (fundCode) {
                    if (fundCode !== item.fund_code) { return }
                    timer[index] = setInterval(function () {
                        if (window["wfsyJsonData_" + item.fund_code] === undefined) { return; }
                        // 清除定时器
                        clearInterval(timer[index]);
                        var data = window["wfsyJsonData_" + item.fund_code];
                        var qrnhsy = data.qrnhsy["data"];
                        var qrData = [];
                        var xAxisData = [];
                        //遍历根据start_date截取数据
                        $.each(qrnhsy, function (index, elm) {
                            if (elm[0] > start_date) {
                                qrData.push(elm[1]);
                                xAxisData.push(utils.dateStr2DateStr(elm[0], "YYYYMMDD", "YYYY-MM-DD"))
                            }
                        });

                        //插入七日年化率echart表
                        // var sevenChart = echarts.init(document.getElementById('baoCanvas' + item.fund_code))
                        var sevenChart = "";
                        // var index = _.indexOf(qrnhEcharts, 'baoCanvas' + item.fund_code);
                        if (!qrnhEcharts['baoCanvas' + item.fund_code]) {
                            sevenChart = echarts.init(document.getElementById('baoCanvas' + item.fund_code));
                            qrnhEcharts['baoCanvas' + item.fund_code] = sevenChart;
                        } else {
                            sevenChart = qrnhEcharts['baoCanvas' + item.fund_code];
                        }


                        sevenChart.setOption({
                            tooltip: {
                                formatter: "{a}<br />{b} : {c}%",
                                show: true,
                                trigger: 'axis'
                            },
                            legend: {
                                data: ['七日年化收益率']
                            },
                            xAxis: {
                                data: xAxisData,
                                axisLabel: {
                                    rotate: 45 //刻度旋转45度角
                                },
                                axisTick: {
                                    show: false
                                }
                            },
                            yAxis: {},
                            series: [{
                                name: '七日年化收益率',
                                type: 'line',
                                data: qrData, //七日数据
                                // markLine: {
                                //     data: [
                                //         { type: 'average', name: '平均值' }
                                //     ]
                                // },
                                itemStyle: {
                                    normal: { color: '#26aed4' }
                                }
                            }]
                        });

                    }, 1000)

                } else {
                    timer[index] = setInterval(function () {
                        if (window["wfsyJsonData_" + item.fund_code] === undefined) { return; }
                        // 清除定时器
                        clearInterval(timer[index]);
                        var data = window["wfsyJsonData_" + item.fund_code];

                        var qrnhsy = data.qrnhsy["data"];
                        var qrData = [];
                        var xAxisData = [];
                        //遍历根据start_date截取数据
                        $.each(qrnhsy, function (index, elm) {
                            if (elm[0] > start_date) {
                                qrData.push(elm[1]);
                                xAxisData.push(utils.dateStr2DateStr(elm[0], "YYYYMMDD", "YYYY-MM-DD"))
                            }
                        });

                        //插入七日年化率echart表
                        // var sevenChart = echarts.init(document.getElementById('baoCanvas' + item.fund_code))
                        if (!qrnhEcharts['baoCanvas' + item.fund_code]) {
                            sevenChart = echarts.init(document.getElementById('baoCanvas' + item.fund_code));
                            qrnhEcharts['baoCanvas' + item.fund_code] = sevenChart;
                        } else {
                            sevenChart = qrnhEcharts['baoCanvas' + item.fund_code];
                        }


                        sevenChart.setOption({
                            tooltip: {
                                formatter: "{a}<br />{b} : {c}%",
                                show: true,
                                trigger: 'axis'
                            },
                            legend: {
                                data: ['七日年化收益率'],
                            },
                            xAxis: {
                                data: xAxisData,
                                axisLabel: {
                                    rotate: 45 //刻度旋转45度角
                                },
                                axisTick: {
                                    show: false
                                }
                            },
                            yAxis: {},
                            series: [{
                                name: '七日年化收益率',
                                type: 'line',
                                data: qrData, //七日数据
                                // markLine: {
                                //     data: [
                                //         { type: 'average', name: '平均值' }
                                //     ]
                                // },
                                itemStyle: {
                                    normal: { color: '#26aed4' }
                                }
                            }]
                        });

                    }, 1000)
                }

            })
        }
        function queryWan(start_date, fundCode) {
            var head = document.getElementsByTagName('head').item(0);
            var timer = [];
            $.each(babyEdata, function (index, item) {
                if (fundCode) {
                    if (fundCode !== item.fund_code) { return }
                    timer[index] = setInterval(function () {
                        if (window["wfsyJsonData_" + item.fund_code] === undefined) { return; }
                        // 清除定时器
                        clearInterval(timer[index]);
                        var data = window["wfsyJsonData_" + item.fund_code];
                        var xAxisWfdata = [];
                        var wfsy = data.wfsy["data"];
                        var wfData = [];
                        $.each(wfsy, function (index, elm) {
                            if (elm[0] > start_date) {
                                wfData.push(elm[1]);
                                xAxisWfdata.push(utils.dateStr2DateStr(elm[0], "YYYYMMDD", "YYYY-MM-DD"))
                            }
                        });
                        // console.log(wfData);
                        //插入万份收益图表
                        // var itemChart = echarts.init(document.getElementById('wanCanvas' + item.fund_code))
                        if (!wfsyEcharts['wanCanvas' + item.fund_code]) {
                            itemChart = echarts.init(document.getElementById('wanCanvas' + item.fund_code));
                            wfsyEcharts['wanCanvas' + item.fund_code] = itemChart;
                        } else {
                            itemChart = wfsyEcharts['wanCanvas' + item.fund_code];
                        }

                        itemChart.setOption({
                            tooltip: {
                                formatter: "{a}<br />{b} : {c}元",
                                show: true,
                                trigger: 'axis'
                            },
                            legend: {
                                data: ['万份收益'],
                                left:'right'
                            },
                            xAxis: {
                                data: xAxisWfdata,
                                axisLabel: {
                                    rotate: 45 //刻度旋转45度角
                                },
                                axisTick: {
                                    show: false
                                }
                            },
                            yAxis: {},
                            series: [{
                                name: '万份收益',
                                type: 'line',
                                data: wfData, //七日数据
                                // markLine: {
                                //     data: [
                                //         { type: 'average', name: '平均值' }
                                //     ]
                                // },
                                itemStyle: {
                                    normal: { color: '#26aed4' }
                                }
                            }]
                        });
                    }, 1000)

                } else {
                    timer[index] = setInterval(function () {
                        if (window["wfsyJsonData_" + item.fund_code] === undefined) { return; }
                        // 清除定时器
                        clearInterval(timer[index]);
                        var data = window["wfsyJsonData_" + item.fund_code];
                        var xAxisWfdata = [];
                        var wfsy = data.wfsy["data"];
                        var wfData = [];
                        $.each(wfsy, function (index, elm) {
                            if (elm[0] > start_date) {
                                wfData.push(elm[1]);
                                xAxisWfdata.push(utils.dateStr2DateStr(elm[0], "YYYYMMDD", "YYYY-MM-DD"))
                            }
                        });
                        // console.log(wfData);
                        //插入万份收益图表
                        // var itemChart = echarts.init(document.getElementById('wanCanvas' + item.fund_code))
                        // var itemChart = echarts.init(document.getElementById('wanCanvas' + item.fund_code))
                        if (!wfsyEcharts['wanCanvas' + item.fund_code]) {
                            itemChart = echarts.init(document.getElementById('wanCanvas' + item.fund_code));
                            wfsyEcharts['wanCanvas' + item.fund_code] = itemChart;
                        } else {
                            itemChart = wfsyEcharts['wanCanvas' + item.fund_code];
                        }

                        itemChart.setOption({
                            tooltip: {
                                formatter: "{a}<br />{b} : {c}元",
                                show: true,
                                trigger: 'axis'
                            },
                            legend: {
                                data: ['万份收益'],
                                left:'right'
                            },
                            xAxis: {
                                data: xAxisWfdata,
                                axisLabel: {
                                    rotate: 45 //刻度旋转45度角
                                },
                                axisTick: {
                                    show: false
                                }
                            },
                            yAxis: {},
                            series: [{
                                name: '万份收益',
                                type: 'line',
                                data: wfData, //七日数据
                                // markLine: {
                                //     data: [
                                //         { type: 'average', name: '平均值' }
                                //     ]
                                // },
                                itemStyle: {
                                    normal: { color: '#26aed4' }
                                }
                            }]
                        });
                    }, 1000)
                }
            })
        }


        //宝宝资产查询(弹框展示)
        $("#baobaoAssets").click(function () {
            easyDialog.open({
                container: 'baobaoAssetsDialog',
                fixedHeight: true,
                fixedWidth: '1170'
            });
            $(document.body).addClass("html-body-overflow");
        });

        $('.js-detail-btnc').on('click', function () {
            easyDialog.open({
                container: 'rechargeDialog'
            });
        });


        //宝宝资产查询
        httpRequest.post("/bao/assetsInfo").then(function (data) {
            // var ejsTpl = '<% _.map(cardlist, function(item){%>'+
            // +'<div class="module funds-moudle accmodule-three">' +
            //     +'<div class="content"><p class="accmodule-tbankinfo">' +
            //     +'<span><%= item.bkinfo_name%></span><%= filter(\'hideCard\')(item.bkact_acctno)%></p>' +
            //     +'<table class="table" width="100%"><tbody>' +
            //     +'<tr><th class="text-left">基金名称</th><th>七日年化</th><th>万份收益</th><th>金额</th><th>可用金额</th><th>累计收益</th><th>操作</th>' +
            //     +'</tr><% item.fundlist.map(function(elem){%><tr><td class="text-left"><%= elem.fund_name%></td><td><%= elem.fund_yield%></td><td>' +
            //     +'<%= elem.fund_lncome%></td><td><%= elem.confirmed_vol%></td><td><%= elem.available_vol%></td><td><%= elem.total_income%></td><td>' +
            //     +'<a class="rech-btn" href="/company/bao/recharge/<%= elem.fund_code%>">充值</a><a class="take-btn" href="/company/bao/takeNow/<%= elem.fund_code%>">取现</a></td></tr><%})%>' +
            //     +'</tbody></table></div></div><%})%>';
            console.log(data.respBody);
            var ejsTpl = '<%_.map(cardlist,function(item){%><div class="funds-moudle accmodule-three"><div class="content"><p class="accmodule-tbankinfo"><span><%=item.bkinfo_name%></span><%=hideCard(item.bkact_acctno)%></p><table class="table" width="100%"><tbody><tr><th class="text-left">基金名称</th><th>七日年化(%)</th><th>万份收益(元)</th><th>金额(元)</th><th>可用金额(元)</th><th>累计收益</th><th>操作</th></tr><%_.map(item.fundlist,function(elem){%><tr><td class="text-left"><%=elem.fund_name%></td><td class="<%=elem.fund_yield>0?\'up-red\': \'down-black\'%>"><%=currency(elem.fund_yield,4)%></td><td class="<%=elem.fund_yield>0?\'up-red\': \'down-black\'%>"><%=currency(elem.fund_lncome,4)%></td><td><%=currency(elem.confirmed_vol,2)%></td><td><%=currency(elem.available_vol,2)%></td><td><%=currency(elem.total_income,2)%></td><td><%if(elem.fund_status!=="0"&&elem.fund_status!=="1"&&elem.fund_status!=="6"){%><span class="disable">充值</span>&nbsp;<%}else{%><a class="rech-btn" href="/company/bao/recharge/<%= elem.fund_code%>?id=<%= item.bkact_fncacct %>">充值</a>&nbsp;&nbsp;<%}%><%if(elem.fund_status!=="0"&&elem.fund_status!=="5"){%><span class="disable">取现</span><%}else{%><a class="take-btn" href="/company/bao/takeNow/<%= elem.fund_code%>?id=<%= item.bkact_fncacct %>">取现</a><%}%></td></tr><%})%></tbody></table></div></div><%})%>';
            data.respBody.hideCard = utils.hideCard;
            data.respBody.currency = utils.currency;
            var html = _.template(ejsTpl)(data.respBody);
            $("#dialogLoading").replaceWith(html ? html : '<div style="width:100%;height:300px;line-height:300px;vertical-align:middle;">您尚未购买</div>');
            // 
        });
        //宝宝资产查询(弹框展示)END

        //收益差选弹框
        $(".tradeSwitch").click(function () {
            easyDialog.open({
                container: 'tradeRecordDialog',
                fixedHeight: true,
                fixedWidth: '1170'

            });
            $(document.body).addClass("html-body-overflow");
        });

        ////收益差选END

        //交易查询弹框
        $(".yieldSwitch").click(function () {
            easyDialog.open({
                container: 'yieldRecordDialog',
                fixedHeight: true,
                fixedWidth: '1170'
            });
            $(document.body).addClass("html-body-overflow");
        });
        //交易查询弹框END

        $(".dialogClose").click(function () {
            $(document.body).removeClass("html-body-overflow");
        });

        // $(".bao-tab-box").slide({
        //     trigger: "click",
        //     pnLoop: false
        // });
        $("#bao-tab li").click(function () {
            $("#bao-tab li").removeClass("on");
            $(this).addClass("on");
            if ($(this).attr("index") == "tab_yield") {
                $("#" + $(this).attr("index")).fadeIn();
                $("#tab_trans").hide();
            } else {
                $("#tab_yield").hide();
                $("#" + $(this).attr("index")).fadeIn();
            }
        })

        // $("#bao-tab-box hd").find("li").click(function(){
        //     $("#bao-tab-box hd").find("li").removeClass("on");
        //     $(this).addClass()
        // })

    })
})
