require(['../../commonConfig'], function () {
    require(['jquery',
        'lodash',
        'httpRequest',
        'utils',
        'pagination',
        'table',
        'date',
        'global_dialog_common'
    ], function ($, _, httpRequest, utils) {
        //初始化表格
        var table = $("#yieldtable").table({
            columns: [
                { field: "fund_name", title: "基金简称" },
                { field: "fund_code", title: "基金代码" },
                { field: "dividend_method", title: "分红方式", render: methodRender },
                { field: "income", title: "分红金额", render: jeRender }, /*--原收益金额/份额--*/
                { field: "dividend_method", title: "分红份额", render: feRender }, /*--新加字段--*/
                { field: "bkact_acctno", title: "银行卡", render: hideCard }, /*--原交易卡号--*/
                { field: "dividend_date", title: "收益日期", render: dateRender, className: "table-w-20" } /*--原收益日期--*/
            ]
        });
        table.loading();

        // 获取本页显示的数量a标签元素
        var showNumEl = $("#yieldShowData").find("a"),
            defaultQueryNum = showNumEl.first().text(),
            totalNum = '',
            historyParams = {};

        // 默认查询数据参数 默认一个月
        var fields = $("#yieldSearchForm").serializeArray();
        var formParams = {};
        $.each(fields, function (index, item) {
            formParams[item.name] = item.value;
        });
        var defaultQueryParams = {
            query_num: defaultQueryNum || 10,
            query_begin_line: '1',
            start_date: formParams.select_start_date,
            end_date: formParams.now_date
        };

        // 异步获取数据promise
        var syncData = function (params) {
            // console.log(params)
            var deferred = $.Deferred();
            var requestParams = _.assign(defaultQueryParams, params);
            httpRequest.post("/bao/yieldRecord", requestParams).then(function (sucData) {
                if (sucData.respHead.head_rtn_code == "000000") {
                    deferred.resolve(sucData);
                } else {
                    //处理查询失败
                    table.showMsg("查询失败");
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
            $('#yieldPagination').pagination({
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
                    query_begin_line: "1"
                };
                historyParams = _.assign(historyParams, queryParams);
                renderListData(historyParams, renderPagination);
            });
        });

        //条件查询
        $("#yieldSearchBtn").click(function () {
            var fields = $("#yieldSearchForm").serializeArray();
            var params = {};
            $.each(fields, function (index, item) {
                params[item.name] = item.value;
            });

            if (!utils.isSupportPlaceholder()) { //解决不支持plachold属性查询提交
                console.log($("input[name='start_date']").attr("placeholder"))
                if (params.start_date == $("input[name='start_date']").attr("placeholder")) {
                    params.start_date = "";
                }
                if (params.end_date == $("input[name='end_date']").attr("placeholder")) {
                    params.end_date = "";
                }
            }

            if (params.start_date === "" && params.end_date === "") {
                params.start_date = params.select_start_date;
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
        })
        //分红方式渲染
        function methodRender(el, rowData, data) {
            return dividendmethod[data];
        };
        //金额渲染
        function jeRender(el, rowData, data) {
            if (rowData.dividend_method == "1") { // 现金分红显示金额
                return utils.currency(rowData.income, 2);
            } else {
                return "--";
            }
        };
        //份额渲染
        function feRender(el, rowData, data) {
            if (rowData.dividend_method == "0") { // 红利再投显示份额
                return utils.currency(rowData.income, 2);
            } else {
                return "--";
            }
        }
        //日期渲染
        function dateRender(el, rowData, data) {
            return utils.dateStr2DateStr(data, "YYYYMMDD", "YYYY-MM-DD");
        };
        function hideCard(el, rowData, data) {
            return utils.hideCard(data);
        }
    });
});
