require(['../../commonConfig'], function () {
    require(['jquery',
        'httpRequest',
        'utils',
        'lodash',
        'echarts',
        'moment',
        'table',
        'dialog',
        'slide',
        'global_dialog_common',
        'pagination'
    ], function ($, httpRequest, utils, _, echarts, moment, table, dialog) {

        //最低风险等级确认风险后是否能购买高于其风险承受能力的产品控制 （保守型） 并且已经风评后的用户 跳转基金详情页面 提示弹框
        if (isAlert) {
            easyDialog.open({
                container: 'param_whether_dialog',
                fixedHeight: true
            });
            queryTipMsg($("#param_whether_tip"), serveConfig.param_fundcode);
        }

        //弹框关闭
        $(".dialogClose").click(function () {
            easyDialog.close();
        })

        function queryTipMsg(el, warn_code) {
            httpRequest.post("/common/riskWarnDetail", {
                warn_code: warn_code
            }).then(function (data) {
                if (data.respHead.head_rtn_code == "000000") {
                    var text = data.respBody.warn_content;
                    if (serveConfig.param_fundflag === '00') {
                        text = text + '<a class="link" href="' + base_url + '/account/risk">重新风评</a>'
                    }
                    el.html(text);
                    $(".zhezhao-conlink").show();
                } else {
                    el.text(data.respHead.head_rtn_desc);
                    $(".zhezhao-conlink").hide();
                    // window.location.href = encodeURI(base_url + "/" + sub_url + "/rechargeResult?status=error&message=" + data.respHead.head_rtn_desc);
                }
            }, function () {
                el.text("请求超时或网络异常");
                $(".zhezhao-conlink").hide();
                // window.location.href = encodeURI(base_url + "/" + sub_url + "/rechargeResult?status=error&message=" + "请求超时或网络异常，请重新提交!");
            });
        }

        var dqye = 1;
        var zongye = 0;
        $(".tab-box").slide({
            trigger: "click",
            pnLoop: false
        });
        //资产饼图
        var color = [{ normal: { color: '#ff962b' } },
        { normal: { color: '#3bc6ff' } },
        { normal: { color: '#fb5957' } },
        { normal: { color: '#24b62d' } }
        ]
        httpRequest.post('/common/Fund?interface=zcpz/' + fund_code + '_0_' + "0_" + moment().format("YYYY-MM-DD") + '_1_20').then(function (result) {
            var data = JSON.parse(result).data;
            if (data instanceof Array) {
                var trea = data[0];
                var treaData = [
                    { value: trea.gpzjb, name: "股票", itemStyle: color[0] },
                    { value: trea.zqzjb, name: "债券", itemStyle: color[1] },
                    { value: trea.xjzjb, name: "现金", itemStyle: color[2] },
                    { value: trea.qtzjb, name: "其他", itemStyle: color[3] },
                ];
                //  treaData.map(function(elem,index){
                //      var html = '<div class="trea_row"><div class="trea_name"><i class="icon-c'+index+'"></i><span>'+elem.name+'</span></div><div class="trea_num">'+elem.value+'</div></div>';
                //      $(".trea_list").append(html)
                //  })
                // if (treaData.length!=0) {
                //     $.each(treaData, function (index, elem) {
                //     var html = '<div class="trea_row"><div class="trea_name"><i class="icon-c' + index + '"></i><span>' + elem.name + '</span></div><div class="trea_num">' +  elem.value>0?elem.value : '暂无数据';+ '</div></div>';
                //     $(".trea_list").append(html)
                // })
                // } else {
                //     $(".trea_list").text('暂无数据')
                // }
                var treaData = _.filter(treaData, function (n) {
                    return n;
                });
                $.each(treaData, function (index, elem) {
                    console.log(elem);
                    var html = '<div class="trea_row"><div class="trea_name"><i class="icon-c' + index + '"></i><span>' + elem.name + '</span></div><div class="trea_num">' + elem.value + '</div></div>';
                    $(".trea_list").append(html);
                    // 初始化资产饼图
                });

                var treaChart = echarts.init(document.getElementById('treaBox'));
                // 饼图配置
                treaChart.setOption({
                    width: "200px",
                    height: "200px",
                    type: 'hideTip',
                    tooltip: {
                        trigger: 'item'
                    },
                    series: [
                        {
                            // name: '',
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
                            data: treaData
                        }
                    ]
                });
            }
        })

        //时间tab切换
        // var wfsyDeferred = $.Deferred();
        // if(fund_type == "04"){
        //     httpRequest.post('/common/Chart/?interface=' + fund_code + '/json/wfsy.js').then(function(data) {
        //         var data = data.substr(data.indexOf("=") + 1, data.length);
        //         var d = $.parseJSON(data);
        //         wfsyDeferred.resolve(d);
        //     });
        // }
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

        // 初始化净值走势图表
        // var trendChart = echarts.init(document.getElementById('trend'));
        // 显示标题，图例和空的坐标轴
        // trendChart.setOption({
        //     title: {
        //         text: '净值走势',
        //         textStyle: {
        //             fontWeight: 'normal'
        //         }
        //     },
        //     tooltip: {
        //         show: true,
        //         trigger: 'axis'
        //     },
        //     legend: {
        //         data: ['单位净值', '累计净值']
        //     },
        //     xAxis: {
        //         data: []
        //     },
        //     yAxis: {}, 
        //     series: [{
        //         name: '单位净值',
        //         type: 'line',
        //         data: []
        //     }]
        // });


        //选择时间段查询不同数据
        $("#trendTimeZone").timeZone(function (value) {
            queryTrend(value);
        });
        //选择收益率万份收益切换
        $(".file-tb li").click(function () {
            var index = $(this).index();
            console.log('123', index)
            $(this).addClass("on").siblings().removeClass("on")
            $(".file-canvas").eq(index).addClass("show").siblings(".file-canvas").removeClass("show")
        })
        if (fund_type == "04") {
            // 初始化七日年化收益率
            var sevenChart = echarts.init(document.getElementById('file-seven'));
            // 七日年化收益率配置
            // 初始化万份收益
            var wanChart = echarts.init(document.getElementById('file-wan'));
            // 万份收益配置
            // wanChart.setOption({
            //     tooltip: {
            //         formatter: "{a}<br />{b} : {c}元",
            //         show: true,
            //         trigger: 'axis'
            //     },
            //     legend: {
            //         data: ['万份收益']
            //     },
            //     xAxis: {
            //         data: [],
            //         axisTick: {
            //             show: false
            //         }
            //     },
            //     yAxis: {},
            //     series: [{
            //         name: '万份收益',
            //         type: 'line',
            //         data: [],
            //         itemStyle: {
            //             normal: { color: '#26aed4' }
            //         }
            //         // markLine: {
            //         //     data: [
            //         //         { type: 'average', name: '平均值' }
            //         //     ]
            //         // }
            //     }]
            // });

            //选择时间段查询不同数据
            $("#sevenTimeZone").timeZone(function (value) {
                queryTrend(value, 1);

            });
            //选择时间段查询不同数据
            $("#wanTimeZone").timeZone(function (value) {
                queryTrend(value, 2);
            });
        }





        //fields 渲染方法
        var renderFactory = {
            date: function (val) {
                if (!val) return "--";
                return utils.dateStr2DateStr(val, "YYYYMMDD", "YYYY-MM-DD");
            },
            currency: function (val, decimals) {
                if (!val) return;
                return utils.currency(val, 2);
            },
            percent: function (val) {
                if (!val) return;
                return utils.percent(val, 2);
            }
        };
        //生成表格元素
        var create = function ($el, fields, data) {
            $el.empty();
            _.forEach(fields, function (item) {
                var value = (data[item.field] || data[item.field] == '0') ? data[item.field] : "--";
                if (item.render && value != "--") {
                    if ($.isFunction(item.render)) {
                        value = item.render(value);
                    } else {
                        value = renderFactory[item.render](value, item.decimals);
                    }
                }
                var html = "<dl><dt>" + item.name + "</dt><dd>" + value + "</dd></dl>";
                $el.append($(html));
            });
        };
        var createTable = function ($el, fields, data) {
            $el.empty();
            var table = $("<table></table>");
            _.forEach(fields, function (items) {
                var tr = $("<tr></tr>");
                _.forEach(items, function (item) {
                    var value = (data[item.field] || data[item.field] == '0') ? data[item.field] : "--";
                    if (item.render && value != "--") {
                        if ($.isFunction(item.render)) {
                            value = item.render(value, item.field, items, data);
                        } else {
                            value = renderFactory[item.render](value, item.decimals);
                        }
                    }
                    var html = '<td class="t-name">' + item.name + '</td><td class="t-value">' + value + '</td>';
                    tr.append($(html));
                });
                table.append(tr);
            });
            $el.append(table);
        };

        //渲染fundInfo表格数据
        var renderInterduce = function (data) {
            if (!data) return;
            createTable($("#fundInfo"), [
                [{
                    name: "基金名称",
                    field: "fullname"
                }, {
                    name: "基金简称",
                    field: "name"
                }],
                [{
                    name: "基金代码",
                    field: "code"
                }, {
                    name: "基金类型",
                    field: "jjlx"
                }],
                [{
                    name: "基金管理人",
                    field: "admin"
                }, {
                    name: "基金托管人",
                    field: "bank"
                }],
                [{
                    name: "业绩比较基准",
                    field: "yjbjjz"
                }, {
                    name: "成立日期",
                    field: "clrq"
                }]
            ], data);
            // var fields = [{
            //         field: "fullname",
            //         name: "基金名称"
            //     },
            //     {
            //         field: "name",
            //         name: "基金简称"
            //     },
            //     {
            //         field: "code",
            //         name: "基金代码"
            //     },
            //     {
            //         field: "jjlx",
            //         name: "基金类型"
            //     },
            //     {
            //         field: "admin",
            //         name: "基金管理人"
            //     },
            //     {
            //         field: "bank",
            //         name: "基金托管人"
            //     },
            //     {
            //         field: "yjbjjz",
            //         name: "业绩比较基准"
            //     },
            //     {
            //         field: "clrq",
            //         name: "成立日期",
            //         render: "date"
            //     }
            // ];
            //
            // create($("#fundInfo"), fields, data);
        };

        // 评级接口
        function queryStarInfo() {
            httpRequest.post("/common/fund?interface=starinfo/" + fund_code).then(function (result) {
                var data = JSON.parse(result);
                console.log('评级接口', data);

                if (data) {
                    var resultdata = data.data;

                    //  yh 评级
                    if (resultdata.yh) {
                        var yhstar = resultdata.yh.F001N_FUND212;
                        var wyhstar = resultdata.yh.F002N_FUND212;

                        // 3年 ===================
                        if (!isNaN(parseInt(yhstar))) {
                            for (var i = 0; i < yhstar; i++) {
                                $(".sstar-yh").append('<span class="info-starnum"></span>');
                                $(".sstar-yhn").append('<span class="info-starnum"></span>');
                            }
                        } else {
                            $(".sstar-yh").append('<span></span>');
                            $(".sstar-yhn").append('<span></span>');
                        }

                        // 5年 ==================
                        if (!isNaN(parseInt(wyhstar))) {
                            for (var i = 0; i < wyhstar; i++) {
                                $(".wstar-yh").append('<span class="info-starnum"></span>');
                            }
                        } else {
                            $(".wstar-yh").append('<span>--</span>');
                        }

                        $(".fdsstar-yh").text(resultdata.yh.F001N_FUND212_Rise[0]);
                        $(".fdwstar-yh").text(resultdata.yh.F002N_FUND212_Rise[0]);
                        $(".pjdate-yh").text(resultdata.yh.ENDDATE);
                    } else {
                        $(".sstar-yh").append("<span>--</span>");
                        $(".sstar-yhn").append("<span>--</span>");
                        $(".wstar-yh").append("<span>--</span>");
                        $(".wstar-yhn").append("<span>--</span>");
                        $(".fdsstar-yh").text("--");
                        $(".fdwstar-yh").text("--");
                        $(".pjdate-yh").text("--");
                    }

                    // cx 评级
                    if (resultdata.cx) {
                        var cxstar = resultdata.cx.F001N_FUND211;
                        var wcxstar = resultdata.cx.F002N_FUND211;

                        // 3年
                        if (!isNaN(parseInt(cxstar))) {
                            for (var i = 0; i < cxstar; i++) {
                                $(".sstar-cx").append('<span class="info-starnum"></span>');
                            }
                        } else {
                            $(".sstar-cx").append('<span></span>');
                        }

                        // 5年
                        if (!isNaN(parseInt(wcxstar))) {
                            for (var i = 0; i < wcxstar; i++) {
                                $(".wstar-cx").append('<span class="info-starnum"></span>');
                            }
                        } else {
                            $(".wstar-cx").append('<span>--</span>');
                        }

                        $(".fdsstar-cx").text(resultdata.cx.F001N_FUND211_Rise[0]);
                        $(".fdwstar-cx").text(resultdata.cx.F002N_FUND211_Rise[0]);
                        $(".pjdate-cx").text(resultdata.cx.ENDDATE);

                    } else {
                        $(".sstar-cx").append("<span>--</span>");
                        $(".wstar-cx").append("<span>--</span>");
                        $(".fdsstar-cx").text("--");
                        $(".fdwstar-cx").text("--");
                        $(".pjdate-cx").text("--");
                    }

                    // ht 评级
                    if (resultdata.ht) {
                        var htstar = resultdata.ht.F003N_FUND209;
                        // 普通
                        if (!isNaN(parseInt(htstar))) {
                            for (var i = 0; i < htstar; i++) {
                                $(".sstar-ht").append('<span class="info-starnum"></span>');
                            }
                        } else {
                            $(".sstar-ht").append('<span></span>');
                        }

                        $(".fdwstar-ht").text(resultdata.ht.F003N_FUND209_Rise[0]);
                        $(".pjdate-sz").text(resultdata.sz.ENDDATE);
                        $(".pjdate-ht").text(resultdata.ht.ENDDATE);

                    } else {
                        $(".sstar-ht").append("<span>--</span>");
                        $(".wstar-ht").append("<span>--</span>");
                        $(".pjdate-ht").text("--");
                        $(".fdwstar-ht").text("--");
                    }

                    // 评级
                    if (resultdata.sz) {
                        var szstar = resultdata.sz.F002N_FUND210;
                        var wszstar = resultdata.sz.F006N_FUND210;

                        // 3年
                        if (!isNaN(parseInt(szstar))) {
                            for (var i = 0; i < szstar; i++) {
                                $(".sstar-sz").append('<span class="info-starnum"></span>');
                            }
                        } else {
                            $(".sstar-sz").append('<span>--</span>');
                        }

                        // 5年
                        if (!isNaN(parseInt(wszstar))) {
                            for (var i = 0; i < wszstar; i++) {
                                $(".wstar-sz").append('<span class="info-starnum"></span>');
                            }
                        } else {
                            $(".wstar-sz").append('<span>--</span>');
                        }

                        $(".fdsstar-sz").text(resultdata.sz.F002N_FUND210_Rise[0]);
                        $(".fdwstar-sz").text(resultdata.sz.F006N_FUND210_Rise[0]);

                    } else {
                        $(".sstar-sz").append("<span>--</span>");
                        $(".wstar-sz").append("<span>--</span>");
                        $(".fdsstar-sz").text("--");
                        $(".fdwstar-sz").text("--");
                        $(".pjdate-sz").text("--");
                    }
                }
            });
        };


        //基金概况
        function queryInterduce() {
            // syncData("/funds/fundInfo", {
            //     fund_code: fund_code,
            //     fund_id: fund_id,
            // }).then(function(data) {
            //     if (data.respHead.head_rtn_code == "000000") {
            //         renderFundInfo(data.respBody);
            //         $("#invest_target").append("<p>" + (data.respBody.invest_target || "") + "</p>");
            //         $("#invest_field").append("<p>" + (data.respBody.invest_field || "") + "</p>");
            //     } else {
            //         $("#fundInfo").append("<p>" + data.respHead.head_rtn_desc + "</p>");
            //     }
            // });
            // 更换为同花顺接口
            httpRequest.post("/common/Fund?interface=interduce/" + fund_code).then(function (result) {
                var data = JSON.parse(result).data;
                if (data) {
                    console.log('======', data);
                    renderFundInfo(data);
                    $("#invest_target").append("<p>" + (data.tzmb || "") + "</p>");
                    $("#invest_field").append("<p>" + (data.tzfw || "") + "</p>");
                    $("#fund-ptz").text(data.tzmb || '--');
                    $("#fund-pfw").text(data.tzfw || '--');
                    $("#fund-pcl").text(data.tzcl || '--');
                    $("#fund-pfxsytz").text(data.fxsytz || '--');
                    $("#js-asset").text(data.asset || '--');
                    $('#js-manager').text(data.admin || '--');
                }
            });

        };
        //渲染fundNav表格数据
        var renderFundInfo = function (data) {
            if (!data) return;
            var fields = [
                [{
                    field: "code",
                    name: "基金代码"
                },
                {
                    field: "name",
                    name: "基金简称"
                }
                ],
                [{
                    field: "jjlx",
                    name: "基金类型"
                },
                {
                    field: "fullname",
                    name: "基金全称"
                }
                ],
                [{
                    field: "type",
                    name: "投资类型"
                },
                {
                    field: "manager",
                    name: "基金经理"
                }
                ],
                [{
                    field: "clrq",
                    name: "成立日期"
                },
                {
                    field: "clgm",
                    name: "成立规模",
                    render: function (val) {
                        return val + "亿份"
                    }
                }
                ],
                [{
                    field: "zxgm",
                    name: "份额规模",
                    render: function (val) {
                        return val + "亿份"
                    }
                },
                {
                    field: "zxgmdate",
                    name: "	份额规模更新日期"
                }
                ],
                [{
                    field: "glf",
                    name: "管理费",
                    render: function (val) {
                        return val + "%"
                    }
                },
                {
                    field: "tgf",
                    name: "托管费",
                    render: function (val) {
                        return val + "%"
                    }
                }
                ],
                [{
                    field: "admin",
                    name: "基金管理人"
                },
                {
                    field: "bank",
                    name: "基金托管人"
                }
                ],
                [{
                    field: "rgfl",
                    name: "最高认购费",
                    render: function (val) {
                        return val + '%';
                    }
                },
                {
                    field: "sgfl",
                    name: "最高申购费",
                    render: function (val) {
                        return val + '%';
                    }
                }
                ],
                [{
                    field: "shfl",
                    name: "最高赎回费",
                    render: function (val) {
                        return val + '%';
                    }
                },
                {
                    field: "yjbjjz",
                    name: "业绩比较基准"
                }
                ],
                // [{
                //         field: "zdsg",
                //         name: "最低申购"
                //     },
                //     {
                //         field: "issh",
                //         name: "赎回状态",
                //         render: function(value) {
                //             return value == 1 ? '能赎回' : '不能赎回';
                //         }
                //     }
                // ],
                // [{
                //         field: "ztsg",
                //         name: "是否暂停申购",
                //         render: function(value) {
                //             return value == 1 ? '是' : '否';
                //         }
                //     },{
                //         field: "--",
                //         name: "--",
                //     }]
                // [{
                //     field: "purchase_start",
                //     name: "申购开始日期",
                //     render: filterDate
                // },{
                //     field: "purchase_end",
                //     name: "开始结束日期",
                //     render: filterDate
                // }],
                // [{
                //     field: "redeem_start",
                //     name: "赎回开始日期",
                //     render: filterDate
                // },{
                //     field: "redeem_end",
                //     name: "赎回结束日期",
                //     render: filterDate
                // }]
            ];
            // create($("#fund_info"), fields, data || {});
            createTable($("#fund_info"), fields, data || {});
        };
        function filterDate(value, field, item, data) {
            console.log(data.fixedDebtInfo);
            return utils.dateStr2DateStr(data.fixedDebtInfo[field], "YYYYMMDD", "YYYY-MM-DD");
        }
        //交易信息表格渲染
        var renderTransInfo = function (data) {
            if (!data) return;
            var fields = [
                [{
                    field: "rgfl",
                    name: "认购费率"
                },
                {
                    field: "zkl",
                    name: "折扣率"
                }
                ],
                [{
                    field: "sgfl",
                    name: "优惠申购后费率"
                },
                {
                    field: "sgoldfl",
                    name: "优惠申购前费率"
                }
                ]
            ];
            createTable($("#trans_info"), fields, data || {});
            // create($("#trans_info"), fields, data || {});
        };
        //沪深指数表格渲染
        var renderHspoint = function (data) {
            if (!data) return;
            var fields = [
                [{
                    field: "week",
                    name: "周涨幅"
                },
                {
                    field: "month",
                    name: "月涨幅"
                }
                ],
                [{
                    field: "tmonth",
                    name: "季涨幅"
                },
                {
                    field: "year",
                    name: "年涨幅"
                }
                ],
                [{
                    field: "twoyear",
                    name: "两年涨幅"
                },
                {
                    field: "nowyear",
                    name: "今年涨幅"
                }
                ],
                [{
                    field: "tyear",
                    name: "三年涨幅"
                },
                {
                    field: "fyear",
                    name: "五年涨幅"
                }
                ]
            ];
            createTable($("#hspoint"), fields, data || {});
            // create($("#hspoint"), fields, data || {});
        };
        //个基信息接口
        function queryFundInfo() {
            // $.get("http://101.37.36.226:9801/api/fund/detail/" + fund_code, {}, function (result) {
            //     var data = JSON.parse(result).data;
            //     if (data) {
            //         renderFundInfo(data);
            //         renderTransInfo(data.tradeInfo);
            //         renderHspoint(data.hspoint);
            //     }
            // })
            httpRequest.post("/common/fund?interface=detail/" + fund_code).then(function (result) {
                var data = JSON.parse(result).data;

                console.log('detail', data);

                if (data) {
                    renderTransInfo(data.tradeInfo || '--');
                    renderHspoint(data.hspoint || '--');
                    $('#js-manager').text(data.admin || '--');
                    $("#ljjznum").text(data.totalnet || '--');
                    $('#js-year').text(data.year || '--');
                    var rate = utils.currency(data.rate, 4);
                    var rzdf_val_class = data.rate > 0 ? "info-num" : "down-black";
                    $("#rzdf_val").html('<span class="'+ rzdf_val_class +'" style="font-size: 24px;">'+ rate +'</span><span>%</span>');

                    if (data.clrq) {
                        var timeArr = data.clrq.split('-');
                        $('#js-clrq').text(timeArr[0] + '年' + timeArr[1] + '月' + timeArr[2] + '日');
                    } else {
                        $('#js-clrq').text('--');
                    }

                    // $("#gopenw1").append('<p class="fl">净值估算：'+data.asset+'~'+data.purchase_end+'</p><p class="fr">'+data.asset+'</p>');
                    //新发基金
                    if (data.ifnew == '1') {
                        $("#gopenw1").css("display", "none");
                        $('#gopenw2').append('<p class="fl">募集起始日：' + data.rgstart + '</p><p class="fr">募集结束日：' + data.rgend + '</p>');
                    }
                    //定开债
                    if (data.isFixedDebt == "1") {
                        $('#gopenw3').append('<p style="font-size:12px;">开放申购日：' + utils.dateStr2DateStr(data.fixedDebtInfo.purchase_start, 'YYYY-MM-DD', 'YYYY年MM月DD日') + '~' + utils.dateStr2DateStr(data.fixedDebtInfo.purchase_end, 'YYYY-MM-DD', 'YYYY年MM月DD日') + '</p><p style="font-size:12px;">开放赎回日：' + utils.dateStr2DateStr(data.fixedDebtInfo.redeem_start, 'YYYY-MM-DD', 'YYYY年MM月DD日') + '~' + utils.dateStr2DateStr(data.fixedDebtInfo.redeem_end, 'YYYY-MM-DD', 'YYYY年MM月DD日') + '</p>');
                    }
                    //是否有估值 
                    if (data.ifgz == '1') {
                        $("#gopenw1").append('<p class="fl">净值估算：' + data.nowtime + '</p><p class="fr">' + data.asset + '</p>');
                    }
                }
            });
        };

        //费率信息接口
        function queryFundRateInfo() {
            httpRequest.post("/common/Fund?interface=rate/" + fund_code).then(function (result) {
                var data = JSON.parse(result).data;

                console.log('费率detail', data);

                if (data) {


                }
            });
        };

        //基金经理信息详细信息
        function queryManagerInfo() {
            httpRequest.post("/common/Manager?interface=info/" + fund_code).then(function (result) {
                var data = JSON.parse(result).data.now;
                if (data) {
                    // data.forEach(function (current, index) {
                    //     $(".funder-tb ul").append('<li>' + current.name + '</li>');
                    //     $("#funder-infobox").append('<div class="funder-info"><div class="funder-item"><div class="funder-name">姓名：' + current.name + '</div><div class="funder-time">上任日期：' + current.start + '</div><div class="funder-detail">' + current.intro + '</div></div></div>');
                    // });
                    $.each(data, function (index, current) {
                        $(".funder-tb ul").append('<li>' + current.name + '</li>');
                        $("#funder-infobox").append('<div class="funder-info"><div class="funder-item"><div class="funder-name">姓名：' + current.name + '</div><div class="funder-time">上任日期：' + current.start + '</div><div class="funder-detail" style="text-indent:2em";>' + current.intro + '</div></div></div>');
                    })
                    $("body").find(".funder-tb li").eq(0).addClass("on");
                    $("body").find("#funder-infobox .funder-info").eq(0).addClass("funder-act");

                }
            });
        };

        //交易信息
        function queryTransInfo() {
            syncData("/funds/trendMap", {
                fund_code: fund_code,
                fund_id: fund_id,
                start_date: utils.subtractStr(3, 'days', "YYYYMMDD"),
                query_begin_line: "1",
                query_num: "1"
            }).then(function (data) {
                if (data.respHead.head_rtn_code == "000000") {
                    renderFundNav(data.respBody.list);
                } else {
                    $("#fundInfo").append("<p>" + data.respHead.head_rtn_desc + "</p>");
                }
            });
        };

        //费用信息表格渲染
        var renderCharge = function () {
            if (!data) return;
            var fields = [{
                field: "end_date",
                name: "净值日期",
                render: "date"
            },
            {
                field: "nav",
                name: "单位净值",
                render: "currency",
                decimals: 4
            },
            {
                field: "",
                name: "累计净值"
            },
            {
                field: "",
                name: "单位面值"
            },
            {
                field: "management_company",
                name: "基金管理人"
            },
            {
                field: "custodian",
                name: "基金托管人"
            },
            {
                field: "perf_benchmark",
                name: "业绩比较基准"
            },
            {
                field: "establish_date",
                name: "成立日期",
                render: "date"
            }
            ];
            create($("#charge"), fields, data);
        };
        //收益率渲染
        var renderYield = function () {
            if (!data) return;
            create($("#charge"), fields, data);
        };
        //基金走势 http://101.37.36.226:9801/api/Fund/historyNet/000709_0_0_20170519_1_999999_date_asc
        function queryTrend(start_date, num) {
            //非货基
            if (fund_type != "04") {
                httpRequest.post('/common/Fund?interface=historyNet/' + fund_code + '_0_' + start_date + '_' + moment().format("YYYYMMDD") + '_1_999999_date_asc')
                    .then(function (result) {
                        // $.get('http://101.37.36.226:9801/api/Fund/historyNet/' + fund_code + '_0_' + start_date + "_" + moment().format("YYYYMMDD") + "_1_999999_date_asc", {}, function (result) {
                        var data = JSON.parse(result).data;
                        // console.log(data);
                        if (data) {
                            var xAxisData = [];
                            var navData = [];
                            var totalnet = [];
                            _.forEach(data, function (item) {
                                xAxisData.push(item.date);
                                navData.push(item.net);
                                totalnet.push(item.totalnet);
                            });
                            console.log(xAxisData, navData);
                            // trendChart.setOption({
                            //     xAxis: {
                            //         data: xAxisData
                            //     },
                            //     series: [{
                            //         name: "单位净值",
                            //         type: "line",
                            //         data: navData
                            //     }, {
                            //         name: "累计净值",
                            //         type: "line",
                            //         data: totalnet
                            //     }]
                            // });
                        } else {
                        }
                    });
            } else { //货基
                // httpRequest.post('/common/Chart/?interface=' + fund_code + '/json/wfsy.js').then(function(data) {
                //     if (data) {
                //         var data = data.substr(data.indexOf("=") + 1, data.length);
                //         var d = $.parseJSON(data);
                //         var wfsy = [];
                //         var qrnhsy = [];
                //         var xAxisData = [];
                //         _.forEach(d.wfsy.data, function(n){
                //             if(n[0] > start_date){
                //                 xAxisData.push(utils.dateStr2DateStr(n[0], "YYYYMMDD", "YYYY-MM-DD"));
                //                 wfsy.push(n[1]);
                //             }
                //         });
                //         _.forEach(d.qrnhsy.data, function(n){
                //             if(n[0] > start_date){
                //                 qrnhsy.push(n[1]);
                //             }
                //         })
                //         trendChart.setOption({
                //             legend: {
                //                 data: ['万份收益', '七日年化收益']
                //             },
                //             xAxis: {
                //                 data: xAxisData
                //             },
                //             series: [{
                //                 name: "万份收益",
                //                 type: "line",
                //                 data: wfsy
                //             }, {
                //                 name: "七日年化收益",
                //                 type: "line",
                //                 data: qrnhsy
                //             }]
                //         });
                //     }
                // }, function(data) {});


                var head = document.getElementsByTagName('head').item(0);
                var script = document.createElement('script');
                script.type = 'text/javascript';
                script.src = convertBaseUrl + "/Chart/" + fund_code + "/json/wfsy.js";
                head.appendChild(script);
                var timerConut = 0;
                var timer = setInterval(function () {
                    if (++timerConut == 10) {
                        clearInterval(timer);
                        $("#file-wan").parent().append('<div class="canvas-text">暂无数据</div>');
                        $("#file-wan").parent().addClass("canvas-show-tip");
                        // console.log("file-sevenfile-sevenfile-seven")
                        $("#file-seven").parent().append('<div class="canvas-text">暂无数据</div>');
                        $("#file-seven").parent().addClass("canvas-show-tip");
                    }
                    if (window.wfsyJsonData === undefined) { return; }
                    // 清除定时器
                    clearInterval(timer);
                    $("#file-wan").parent().remove(".canvas-text");
                    // 数据 handle
                    // console.info('---------console-wfsyJsonData-------', window.wfsyJsonData);

                    var wfsyJsonData = window.wfsyJsonData;
                    var wfsy = [];
                    var qrnhsy = [];
                    var xAxisData = [];
                    _.forEach(wfsyJsonData.wfsy.data, function (n) {
                        if (n[0] > start_date) {
                            xAxisData.push(utils.dateStr2DateStr(n[0], "YYYYMMDD", "YYYY-MM-DD"));
                            wfsy.push(n[1]);
                        }
                    });
                    _.forEach(wfsyJsonData.qrnhsy.data, function (n) {
                        if (n[0] > start_date) {
                            qrnhsy.push(n[1]);
                        }
                    })
                    if (num == 1) {
                        console.log(xAxisData);
                        if (xAxisData.length > 0) {
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
                                    data: qrnhsy,
                                    itemStyle: {
                                        normal: { color: '#26aed4' }
                                    }
                                    // markLine: {
                                    //     data: [
                                    //         { type: 'average', name: '平均值' }
                                    //     ]
                                    // }
                                }]
                            });
                            // sevenChart.setOption({
                            //     legend: {
                            //         data: ['七日年化收益率']
                            //     },
                            //     xAxis: {
                            //         data: xAxisData,
                            //         axisLabel: {
                            //             rotate: 45 //刻度旋转45度角
                            //         }
                            //     },
                            //     series: [
                            //         {
                            //             name: "七日年化收益率",
                            //             type: "line",
                            //             data: qrnhsy
                            //         }
                            //     ]
                            // });
                        } else {
                            // $("#file-seven").append('<div style="padding-top:25px; text-align: center;">暂无数据</div>');
                        }

                    } else {
                        wanChart.setOption({
                            tooltip: {
                                formatter: "{a}<br />{b} : {c}元",
                                show: true,
                                trigger: 'axis'
                            },
                            legend: {
                                data: ['万份收益']
                            },
                            xAxis: {
                                data: xAxisData,
                                axisTick: {
                                    show: false
                                }
                            },
                            yAxis: {},
                            series: [{
                                name: '万份收益',
                                type: 'line',
                                data: wfsy,
                                itemStyle: {
                                    normal: { color: '#26aed4' }
                                }
                                // markLine: {
                                //     data: [
                                //         { type: 'average', name: '平均值' }
                                //     ]
                                // }
                            }]
                        });
                    }
                }, 1000);


                // wfsyDeferred.then(function(wfsyJsonData){
                //     console.log(wfsyJsonData);
                //     if (wfsyJsonData) {
                //         // var data = data.substr(data.indexOf("=") + 1, data.length);
                //         // var d = $.parseJSON(data);
                //         var wfsy = [];
                //         var qrnhsy = [];
                //         var xAxisData = [];
                //         _.forEach(wfsyJsonData.wfsy.data, function(n){
                //             if(n[0] > start_date){
                //                 xAxisData.push(utils.dateStr2DateStr(n[0], "YYYYMMDD", "YYYY-MM-DD"));
                //                 wfsy.push(n[1]);
                //             }
                //         });
                //         _.forEach(wfsyJsonData.qrnhsy.data, function(n){
                //             if(n[0] > start_date){
                //                 qrnhsy.push(n[1]);
                //             }
                //         })
                //         trendChart.setOption({
                //             legend: {
                //                 data: ['万份收益', '七日年化收益']
                //             },
                //             xAxis: {
                //                 data: xAxisData
                //             },
                //             series: [{
                //                 name: "万份收益",
                //                 type: "line",
                //                 data: wfsy
                //             }, {
                //                 name: "七日年化收益",
                //                 type: "line",
                //                 data: qrnhsy
                //             }]
                //         });
                //     }
                // })
            }

            // syncData("/funds/historyNav", {
            //     fund_code: fund_code,
            //     fund_id: fund_id,
            //     fund_type: fund_type,
            //     start_date: start_date,
            //     query_begin_line: "1",
            //     query_num: "1500"
            // }).then(function(data) {
            //     if (data.respHead.head_rtn_code == "000000") {
            //         var xAxisData = [];
            //         var navData = [];
            //         var dailyProfit = [];
            //         var weeklyYield = [];
            //         _.forEach(data.respBody.list, function(item) {
            //             xAxisData.push(utils.dateStr2DateStr(item.update_time, "YYYYMMDD", "YYYY-MM-DD"));
            //             navData.push(item.nav);
            //             dailyProfit.push(item.daily_profit);
            //             weeklyYield.push(item.weekly_yield);
            //         })
            //         trendChart.setOption({
            //             xAxis: {
            //                 data: xAxisData
            //             },
            //             series: [{
            //                 name: "单位净值",
            //                 type: "line",
            //                 data: navData
            //             }, {
            //                 name: "万份收益",
            //                 type: "line",
            //                 data: dailyProfit
            //             }, {
            //                 name: "7日年化收益率",
            //                 type: "line",
            //                 data: weeklyYield
            //             }]
            //         });
            //     } else {}
            // });
        };

        //费率查询
        // var createTable = function(options) {
        //     if (!options) return;
        //     var table = $("<table></table>");
        //     var htr = $("<tr></tr>");
        //     var btr = $("<tr></tr>");
        //     _.forEach(options.header, function(data) {
        //         htr.append("<th>"+ data. +"</th>";
        //     })
        // };
        var readerRate = function (adm, rate, $) {
            if (!adm) return;
            var admFields = [{
                field: "glf",
                name: "基金管理费率："
            }, {
                field: "tgf",
                name: "基金托管费率："
            }, {
                field: "fwf",
                name: "销售服务费率："
            }];
            var sgq = $("#sgq").table({
                columns: [{
                    field: "code",
                    title: "适用金额",
                    render: function (el, rowData, data) {
                        var str = "";
                        if (rowData.F005N_FUND290 && !rowData.F006N_FUND290) {
                            str = rowData.F005N_FUND290 + "万元以上" + (rowData.F007N_FUND290 == "1" ? "(包含)" : "");
                        }
                        if (rowData.F005N_FUND290 && rowData.F006N_FUND290) {
                            str = rowData.F005N_FUND290 + "万元" + (rowData.F007N_FUND290 == "1" ? "(包含)" : "") + " - " + rowData.F006N_FUND290 + "万元" + (rowData.F008N_FUND290 == "1" ? "(包含)" : "");
                        }
                        if (!rowData.F005N_FUND290 && rowData.F006N_FUND290) {
                            str = rowData.F006N_FUND290 + "万元以下" + (rowData.F008N_FUND290 == "1" ? "(包含)" : "");
                        }
                        return str || "--";
                    }
                },
                {
                    field: "F013N_FUND290",
                    title: "申购费率",
                    render: function (el, rowData, data) {
                        if (rowData.F014N_FUND290 > 0) {
                            return rowData.F014N_FUND290 + "元/笔";
                        }
                        if (rowData.F014N_FUND290 <= 0) {
                            utils.currency(Number(rowData.F013N_FUND290 || 0), 2) + "%";
                        }
                        if (rowData.discount == '2') {
                            return "暂无";
                        }
                        if (rowData.discount == "1") {
                            return "免申购费";
                        }
                        return utils.currency(Number(rowData.F013N_FUND290 || 0), 2) + "%";
                        //return Number(data || 0) + "%"
                    }
                }
                ]
            });
            var sh = $("#sh").table({
                columns: [{
                    field: "code",
                    title: "适用期限",
                    render: function (el, rowData, data) {
                        // return _filter(rowData);
                        var str = "";
                        var start = "";
                        var end = "";
                        if (rowData.F009N_FUND290 >= 12) {
                            start = rowData.F009N_FUND290 / 12 + "年以上";
                        } else {
                            start = rowData.F009N_FUND290 * 30 + "天以上";
                        }
                        if (rowData.F011N_FUND290) {
                            start += "(包含)";
                        }
                        if (rowData.F010N_FUND290 >= 12) {
                            end = rowData.F010N_FUND290 / 12 + "年以上";
                        } else {
                            end = rowData.F010N_FUND290 * 30 + "天以上";
                        }
                        if (rowData.F012N_FUND290) {
                            end += "(包含)";
                        }
                        if (rowData.F009N_FUND290 && !rowData.F010N_FUND290) {
                            return start;
                        }
                        if (!rowData.F009N_FUND290 && rowData.F010N_FUND290) {
                            return end;
                        }
                        if (rowData.F009N_FUND290 && rowData.F010N_FUND290) {
                            return start + "-" + end;
                        } else {
                            return "--";
                        }
                    }
                },
                {
                    field: "F013N_FUND290",
                    title: "赎回费率",
                    render: function (el, rowData, data) {
                        if (rowData.F014N_FUND290) {
                            return rowData.F014N_FUND290 + "元/笔";
                        }
                        if (rowData.F013N_FUND290 == "0") {
                            return "免赎回费";
                        }
                        return utils.currency(Number(data || 0), 2) + "%";
                    }
                }
                ]
            });
            create($("#adm"), admFields, adm || {});
            try {
                console.log(rate.sg['前端']);
                sgq.updateData(rate.sg['前端'] || { F013N_FUND290: "0.00%" });
                // sgh.updateData(rate.sg['后端']);
                sh.updateData(rate.sh['前端'] || { F013N_FUND290: "0.00%" });
            } catch (err) {
                sgq.showMsg("查询失败或当前产品暂无费率");
                sh.showMsg("查询失败或当前产品暂无费率");
            }
            // create($("#sgq"), sgqFields, rate.sg['前端'] || {});
            // create($("#sgh"), sgqFields, rate.sg['后端'] || {});
            // create($("#sh"), shFields, rate.sg['前端'] || {});
        };

        function queryRate() {
            httpRequest.post("/common/Fund?interface=rate/" + fund_code).then(function (result) {
                // $.get("http://101.37.36.226:9801/api/Fund/rate/" + fund_code, {}, function (result) {
                var data = JSON.parse(result).data;
                if (data) {
                    readerRate(data.adm, data.rate, $);
                }
            });
        };

        //收益走势
        function querySy() {
            var head = document.getElementsByTagName('head').item(0);
            var syscript = document.createElement('script');
            var szscript = document.createElement('script');
            szscript.type = syscript.type = 'text/javascript';
            syscript.src = convertBaseUrl + "/Chart/1B0008.js";
            szscript.src = convertBaseUrl + "/Chart/1A0001.js";
            head.appendChild(syscript);
            head.appendChild(szscript);
            var syEchart = echarts.init(document.getElementById('file-rate'));
            var toggleTime = function (js1A0001, js1B0008) {
                $("#sevenTimeZone").timeZone(function (data) {
                    console.log(data);
                    var xAxisData = [];
                    var szData = [];
                    var syData = [];
                    for (var key in js1A0001) {
                        var date = utils.dateStr2DateStr(key, "YYYY-MM-DD", "YYYYMMDD");
                        if (data <= date) {
                            xAxisData.push(key);
                            szData.push(js1A0001[key]);
                            syData.push(js1B0008[key]);
                        }
                    }
                    syEchart.setOption({
                        tooltip: {
                            // formatter: "{a0}<br />{b0} : {c0}%<br />{a1}<br />{b1} : {c1}%",
                            show: true,
                            trigger: 'axis'
                        },
                        legend: {
                            data: ['上证指数', '基金指数']
                            //left: "right"
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
                            name: '上证指数',
                            type: 'line',
                            data: szData,
                            itemStyle: {
                                normal: { color: '#DE4949' }
                            }
                        }, {
                            name: '基金指数',
                            type: 'line',
                            data: syData,
                            itemStyle: {
                                normal: { color: '#de9a49' }
                            }
                        }]
                    })
                });
            }

            var syIntervalTimer = 0;
            //  $("#file-rate").html("<div>暂无数据</div>");
            var syInterval = setInterval(function () {
                syIntervalTimer++;
                if (js1A0001 && js1B0008) {
                    clearInterval(syInterval);
                    console.log(js1A0001, js1B0008);
                    toggleTime(js1A0001, js1B0008)
                } else {
                    if (syIntervalTimer > 10) {
                        clearInterval(syInterval);
                        $("#file-rate").html("<div style='text-align: center;line-height: 300px;'>暂无数据</div>");
                    }
                }

            }, 1000);
        }

        //查询基金概况
        queryFundInfo();
        queryFundRateInfo();
        queryInterduce();
        queryRate();
        queryStarInfo();
        queryManagerInfo();
        // querySy();

        //基金公告
        var renderListData = function (page, flag) {
            httpRequest.post("/common/Fund?interface=pubnote/" + fund_code + "_all_0_0_" + page + "_20").then(function (result) {
                var result = JSON.parse(result);
                var data = result.data;
                var pageInfo = result.pageInfo;
                if (data.length <= 0) return;
                pubTable($("#pubTable"), data, 0);
                console.log("基金公告:", data);
                if (pageInfo.totalcount <= "20" || flag) return;
                $('#pubnote').pagination({
                    totalData: pageInfo.totalcount * 1,
                    count: 3,
                    showData: 20,
                    coping: true,
                    jump: true,
                    callback: function (pagination) {
                        renderListData(pagination.getCurrent(), true);
                    }
                });
            });
        };
        renderListData();
        var pubTable = function ($cl, data) {
            var html = '';
            $cl.text(html);
            // data.map(function (elem, index) {

            //     html += '<tr><td class="table-title"><p class="textover">' + elem.title + '</p></td><td class="tabel-gg">'
            //         + elem.type + '</td><td class="table-time">' + elem.time + '</td></tr>';
            //     return html;
            // })
            // console.log("sdsd",data);
            $.each(data, function (index, elem) {
                var last = elem.rawURL.lastIndexOf("/");
                var uri = elem.rawURL.substr(last + 1, elem.rawURL.length);
                var url = "/company/common/thspdf/" + uri;
                html += '<tr><td class="table-title"><a  target="_blank" href="' + url + '"><p class="textover">' + elem.title + '</p></a></td><td class="tabel-gg">'
                    + elem.type + '</td><td class="table-time">' + elem.time + '</td></tr>';
                return html;
            })
            $cl.append('<tr style="background-color:#eeeeee; "><td class="table-title"><p class="textover">' + '标题' + '</p></td><td class="tabel-gg">'
                + '公告类型' + '</td><td class="table-time">' + '日期' + '</td></tr>')
            $cl.append(html)

        }
        //业绩表现接口
        httpRequest.post("/common/Fund?interface=Profit/" + fund_code).then(function (result) {
            var data = JSON.parse(result).data;
            if ('hbxpoint' in data) {
                console.log('业绩表现', data)
                assemTable($(".treaBond"), "国债指数", data.hbxpoint, 1)
                avgTable($(".averInc"), "同类型平均收益数据", data.avgSy, 1)
                assemTable($(".sy"), "期间收益率", data.sy, 1)
                assemTable($(".point"), "沪深300指数数据", data.point, 1)
                $(".per-endtime").text(data.date)
            }
        });

        $("#worthTimeZone").timeZone(function (value) {
            setData(value)
        })
        if (fund_type !== '04') {
            var head = document.getElementsByTagName('head').item(0);
            var script1 = document.createElement('script');
            script1.type = 'text/javascript';
            // 累计净值
            script1.src = convertBaseUrl + "/Chart/" + fund_code + "/json/jsonljjz.json";
            head.appendChild(script1);



            var timer2 = setInterval(function () {
                if (window['ljjz_' + fund_code]) {
                    // 获取数据
                    var _data2 = window['ljjz_' + fund_code];
                    clearInterval(timer2);
                }
            }, 1000);

        }
        if (fund_type !== "04") {
            var worthChart = echarts.init(document.getElementById('file-worth'));
        }
        function setData(value) {
            var dwjztimer = 0;
            var timer1 = setInterval(function () {
                if (++dwjztimer > 10) {
                    clearInterval(timer1);
                    $("#file-worth").html("<div style='text-align: center;line-height: 300px;'>暂无数据</div>");
                }
                console.log("dsd山东科技ask的加拉手机了")
                if (window['ljjz_' + fund_code] === undefined) { return; }
                console.log("dsajdkasjdklasjldkjasldjasljdljsaljdlasjld===")
                clearInterval(timer1);
                //获取数据
                var _data1 = window['ljjz_' + fund_code];
                var xAxisData = [], worthData = []
                _.forEach(_data1, function (n) {
                    if (n[0] > value) {
                        xAxisData.push(utils.dateStr2DateStr(n[0], "YYYYMMDD", "YYYY-MM-DD"));
                        worthData.push(n[1]);
                    }
                });

                // 七日年化收益率配置
                worthChart.setOption({
                    tooltip: {
                        show: true,
                        trigger: 'axis'
                    },
                    legend: {
                        data: ['单位净值']
                    },
                    xAxis: {
                        data: xAxisData,
                        axisTick: {
                            show: false
                        }
                    },
                    yAxis: {},
                    series: [{
                        name: '单位净值',
                        type: 'line',
                        data: worthData,
                        markLine: {
                            data: [
                                { type: 'average', name: '平均值' }
                            ]
                        }
                    }]
                });


            }, 1000);
        }





        var avgTable = function ($cl, title, data, type) {
            var fu;
            if (type == 1) {
                fu = "%"
            }
            data.name = title;
            console.log(data.week.avg);

            var html = '<td class="per-name">'+ data.name + ' </td>' + 
                '<td ' + (data.week.avg > 0 ? ' class="per-color"' : ' class="per-black"') + '> ' + data.week.avg + fu + ' </td>' + 
                '<td ' + (data.month.avg > 0 ? ' class="per-color"' : 'class="per-black"') + '> ' + data.month.avg + fu + ' </td>' + 
                '<td ' + (data.tmonth.avg > 0 ? ' class="per-color"' : 'class="per-black"') + '> ' + data.tmonth.avg + fu + ' </td>' + 
                '<td ' + (data.hyear.avg > 0 ? ' class="per-color"' : 'class="per-black"') + '> ' + data.hyear.avg + fu + ' </td>' + 
                '<td ' + (data.year.avg > 0 ? ' class="per-color"' : 'class="per-black"') + '> ' + data.year.avg + fu + ' </td>' + 
                '<td ' + (data.nowyear.avg > 0 ? ' class="per-color"' : 'class="per-black"') + '> ' + data.nowyear.avg + fu + ' </td>' +
                '<td ' + (data.tyear.avg > 0 ? ' class="per-color"' : 'class="per-black"') + '> '+ data.tyear.avg + fu + ' </td>'

            $cl.append(html)
        }
        var assemTable = function ($cl, title, data, type) {
            var fu;
            if (type == 1) {
                fu = "%"
            }
            data.name = title;
            var html = '<td class="per-name"> ' + data.name + ' </td>' + 
            '<td ' + (data.week > 0 ? ' class="per-color"' : ' class="per-black"') + '> ' + data.week + fu + '</td>' + 
            '<td ' + (data.month > 0 ? ' class="per-color"' : ' class="per-black"') + '> ' + data.month + fu + '</td>' + 
            '<td ' + (data.tmonth > 0 ? ' class="per-color"' : ' class="per-black"') + '> '+ data.tmonth + fu + '</td>' + 
            '<td ' + (data.hyear > 0 ? ' class="per-color"' : ' class="per-black"') + '> ' + data.hyear + fu + '</td>' + 
            '<td ' + (data.year > 0 ? ' class="per-color"' : ' class="per-black"') + '> ' + data.year + fu + ' </td>' + 
            '<td ' + (data.nowyear > 0 ? ' class="per-color"' : ' class="per-black"') + '> '+ data.nowyear + fu + ' </td>' + 
            '<td ' + (data.tyear > 0 ? ' class="per-color"' : ' class="per-black"') + '> '+ data.tyear + fu + ' </td>'

            $cl.append(html)
        }
        //异步请求方法
        function syncData(url, params) {

            var deferred = $.Deferred();
            httpRequest.post(url, params).then(function (sucData) {
                if (sucData.respHead.head_rtn_code == "000000") {
                    deferred.resolve(sucData);
                } else {
                    //处理查询失败
                }
            }, function (errData) {
                deferred.reject(errData);
            });
            return deferred;
        };
        //基金经理tab切换
        $(".funder-tb ul").on('click', 'li', function () {
            var index = $(this).index();
            $(this).addClass("on").siblings("li").removeClass("on");
            $(".funder-info").eq(index).addClass("funder-act").siblings(".funder-info").removeClass("funder-act");
        })
    })

})


var renderPagination = function (totalData, showData) {
    // 调用分页
    $('.pagination').pagination({
        totalData: totalData,
        count: 3,
        showData: showData,
        coping: true,
        jump: true,
        callback: function (pagination) {
            var requestParams = _.assign(history, {
                query_begin_line: pagination.getCurrent()
            });
            renderListData(requestParams);
        }
    });
};
