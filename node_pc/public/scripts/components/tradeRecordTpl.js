require(['../../commonConfig'], function () {
    require(['jquery',
        'lodash',
        'httpRequest',
        'utils',
        'moment',
        'pagination',
        'table',
        'date', 'global_dialog_common',
    ], function ($, _, httpRequest, utils, moment) {
        //初始化表格
        var table = $("#tradetable").table({
            columns: [{
                field: "fund_name",
                title: "基金简称",
                className: "tabel-item-left"
            },
            //  {
            //     field: "fund_code",
            //     title: "基金代码"
            //     // className: "tabel-item-left"
            // },
            {
                field: "busi_code",
                title: "交易类型",
                render: busiCodeRender
            },
            {
                field: "tranlog_applicationamount",
                title: "交易金额(元)",
                render: applicationamountRender
            },
            {
                field: "tranlog_confirmedamount",
                title: "确认金额(元)",
                render: currencyRender
            },
            {
                field: "tranlog_crtdate",
                title: "交易日期",
                render: dateRender
            },
            {
                field: "tranlog_crttime",
                title: "交易时间",
                render: timeRender
            },
            {
                field: "bkact_acctno",
                title: "银行卡号",
                render: hideCard
            },
            {
                field: "tranlog_status",
                title: "交易状态",
                render: statusRender
            }
                // ,{
                //     field: "tranlog_retmsg",
                //     title: "交易备注"
                // }
            ]
        });
        table.loading();


        // 获取本页显示的数量a标签元素
        var showNumEl = $("#tradeShowData").find("a"),
            defaultQueryNum = showNumEl.first().text(),
            totalNum = '',
            historyParams = {};

        // 默认查询数据参数 默认查询一个月数据
        var fields = $("#tradeSearchForm").serializeArray();
        var formParams = {};
        $.each(fields, function (index, item) {
            formParams[item.name] = item.value;
        });
        var defaultQueryParams = {
            query_num: defaultQueryNum || '10',
            query_begin_line: '1',
            query_type: query_type,
            start_date: formParams.time_filter,
            end_date: formParams.now_date
        };

        // 异步获取数据promise
        var syncData = function (params) {
            //console.log(params)
            var deferred = $.Deferred();
            var requestParams = _.assign(defaultQueryParams, params);
            httpRequest.post("/bao/yestTrans", requestParams).then(function (sucData) {
                if (sucData.respHead.head_rtn_code == "000000") {
                    deferred.resolve(sucData);
                    $("#tradeSearchForm > input[name='start_date']").val("");
                    $("#tradeSearchForm > input[name='end_date']").val("");
                } else {
                    //处理查询失败
                    table.showMsg("查询失败," + sucData.respHead.head_rtn_desc);
                }
            }, function (errData) {
                table.showMsg("查询失败,网络异常！");
                deferred.reject(errData);
            });
            return deferred;
        };

        // 渲染查询数据
        var renderListData = function (params, callback) {
            table.loading();
            var requestParams = _.assign(defaultQueryParams, params);
            syncData(requestParams).then(function (data) {
                totalNum = data.respBody.total_count;
                if (callback) callback(totalNum, requestParams.query_num);
                // 更新列表数据
                table.updateData(data.respBody.list);
            });
        };

        // 渲染分页
        var renderPagination = function (totalData, showData) {
            // 调用分页
            $('#tradePagination').pagination({
                totalData: totalData,
                showData: showData,
                coping: true,
                jump: true,
                callback: function (pagination) {
                    var requestParams = _.assign(history, {
                        query_begin_line: pagination.getCurrent() + ""
                    });
                    renderListData(requestParams);
                }
            });
        };

        // 调用渲染数据方法，渲染列表数据
        renderListData(defaultQueryParams, renderPagination);

        // 绑定本页显示的A标签事件
        $.each(showNumEl, function (index, el) {
            $(el).click(function () {
                showNumEl.removeClass("active");
                $(this).addClass("active");
                defaultQueryNum = $(this).text();
                // 渲染列表数据参数
                var queryParams = {
                    query_num: defaultQueryNum,
                    query_begin_line: "1",
                    query_type: query_type
                };
                historyParams = _.assign(historyParams, queryParams);
                renderListData(historyParams, renderPagination);
            })
        });

        //条件查询
        $("#tradeSearchBtn").click(function () {
            var fields = $("#tradeSearchForm").serializeArray();
            var params = {};
            $.each(fields, function (index, item) {
                params[item.name] = item.value;
            });

            if (!utils.isSupportPlaceholder()) { //解决不支持plachold属性查询提交
                if (params.start_date === $("input[name='start_date']").attr("placeholder")) {
                    params.start_date = "";
                }
                if (params.end_date === $("input[name='end_date']").attr("placeholder")) {
                    params.end_date = "";
                }
            }

            if (params.start_date === '' && params.end_date === '') {
                params.start_date = params.time_filter;
                params.end_date = params.now_date;
            } else {
                params.start_date = params.start_date.replace(/-/g, "");
                params.end_date = params.end_date.replace(/-/g, "");
            }
            historyParams = _.assign(historyParams, {
                query_begin_line: "1" //重置到第一页
            }, params);
            renderListData(historyParams, renderPagination);
            // $("#searchForm").reset();
            return false;
        });
        //下拉产品查询
        // httpRequest.post("/common/fundNameList", {
        //     baby_code: utils.getQueryString("code"),
        //     query_type: query_type
        // }).then(function (data) {
        //     var opentisTpl = '<% _.forEach(list, function(item){ %><option value="<%= item.fund_code%>"><%= item.fund_name%></option><%})%>';
        //     var fundNameHtml = _.template(opentisTpl)(data.respBody);
        //     $("#selectProduct").append(fundNameHtml);
        //     // console.log(fundNameHtml);
        // })

        //金额渲染
        function currencyRender(el, rowData, data) {
            return utils.currency(data, 2);
        }

        function applicationamountRender(el, rowData, data) {
            if (rowData.tranlog_applicationamount * 1 != 0) { //购买必输
                return utils.currency(rowData.tranlog_applicationamount, 2);
            }
            if (rowData.tranlog_applicationvol * 1 != 0) { //赎回必输
                return utils.currency(rowData.tranlog_applicationvol, 2);
            }
        }

        //日期渲染
        function dateRender(el, rowData, data) {
            return utils.dateStr2DateStr(data, "YYYYMMDD", "YYYY-MM-DD");
        }

        //时间渲染
        function timeRender(el, rowData, data) {
            return utils.dateStr2DateStr(data, "HHmmss", "HH:mm:ss");
        }

        //交易类型渲染
        function busiCodeRender(el, rowData, data) {
            //当baby_code空时，F30001为购买（business_code：020-认购 022-申购），F30002为赎回当baby_code不为空时，F30001为充值，F30002为取现（tranlog_redeemtype：00-快速取现 01-普通取现）
            if (rowData.busi_code == "F30001") {
                if (rowData.baby_code) {
                    return "充值"
                }
                if (rowData.business_code == "020") {
                    return "认购";
                }
                if (rowData.business_code == "022") {
                    return "申购";
                }
            }
            if (rowData.busi_code == "F30002") {
                if (!rowData.baby_code) {
                    return "赎回"
                }
                if (rowData.tranlog_redeemtype == "00") {
                    return "快速取现";
                }
                if (rowData.tranlog_redeemtype == "01") {
                    return "普通取现";
                }
            }
        }

        //交易状态渲染
        function statusRender(el, rowData, data) {
            return tranlog_status[data];
        }

        function hideCard(el, rowData, data) {
            return utils.hideCard(data);
        }

    })
})
