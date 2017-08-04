require(['../../commonConfig'], function() {
    require(['jquery',
        'lodash',
        'utils',
        'httpRequest',
        'pagination',
        'table',
        'global_dialog_common'
    ], function($, _, utils, httpRequest) {

        //初始化表格
        var table = $("#table").table({
            columns: [
                { field: "index", title: "序号" },
                { field: "fund_code", title: "基金代码", className: "tabel-item-left" },
                { field: "fund_name", title: "基金名称", className: "tabel-item-left" },
                { field: "total_vol", title: "基金份额" },
                { field: "available_vol", title: "可用份额" },
                { field: "fundincome", title: "单位净值/每万份收益(元)", render: col6Render },
                { field: "increase", title: "日涨跌幅/7日年化收益率(%)", render: col7Render },
                { field: "fund_update", title: "净值日期", render: dateRender },
                { field: "dividendmethod", title: "分红方式", render: dividendmethodRender },
                { field: "riskgrade", title: "操作", render: btnRender }
            ]
        });

        // 获取本页显示的数量a标签元素
        var showNumEl = $("#showData").find("a"),
            defaultQueryNum = showNumEl.first().text(),
            totalNum = '',
            historyParams = {};

        // 默认查询数据参数
        var defaultQueryParams = {
            query_num: defaultQueryNum || 10,
            query_begin_line: '1'
        };

        // 异步获取数据promise
        var syncData = function(params) {
            // console.log(params)
            var deferred = $.Deferred();
            var requestParams = _.assign(defaultQueryParams, params);
            delete requestParams.query_num;
            delete requestParams.query_begin_line;
            httpRequest.post("/funds/myFunds", requestParams).then(function(sucData) {
                if (sucData.respHead.head_rtn_code == "000000") {
                    deferred.resolve(sucData);
                } else {
                    //处理查询失败
                    table.showMsg("查询失败," + sucData.respHead.head_rtn_desc);
                }
            }, function(errData) {
                table.showMsg("查询失败,网络异常！");
                deferred.reject(errData);
            });
            return deferred;
        };

        // 渲染查询数据
        var renderListData = function(params, callback) {
            table.loading();
            var requestParams = _.assign(defaultQueryParams, params);
            syncData(requestParams).then(function(data) {
                totalNum = data.respBody.total_count;
                if (callback) callback(totalNum, requestParams.query_num);
                // 更新列表数据
                table.updateData(data.respBody.list);
            });
        };

        // 渲染分页
        var renderPagination = function(totalData, showData) {
            // 调用分页
            $('.pagination').pagination({
                totalData: totalData,
                showData: showData,
                coping: true,
                jump: true,
                callback: function(pagination) {
                    var requestParams = _.assign(history, {
                        query_begin_line: "1"
                    });
                    renderListData(requestParams);
                }
            });
        };

        // 调用渲染数据方法，渲染列表数据
        renderListData(defaultQueryParams, renderPagination);

        // 绑定本页显示的A标签事件
        // $.each(showNumEl, function(index, el) {
        //     $(el).click(function() {
        //         showNumEl.removeClass("active");
        //         $(this).addClass("active");
        //         defaultQueryNum = $(this).text();
        //         // 渲染列表数据参数
        //         var queryParams = {
        //             query_num: defaultQueryNum,
        //             query_begin_line: defaultQueryParams.query_begin_line
        //         };
        //         historyParams = _.assign(historyParams, queryParams);
        //         renderListData(historyParams, renderPagination);
        //     })
        // });

        //日涨跌幅/7日年化收益率(%)
        function col7Render(el, rowData, data) {
            el.addClass("red-text");
            if (rowData.fund_type == "04") { //货币型
                if (rowData.fund_yieldflag == '0') { //标识为负数处理
                    el.addClass("green-text");
                    return "-" + utils.retainDecimal(rowData.fund_yield) + "%";
                }
                return utils.retainDecimal(rowData.fund_yield) + "%";
            } else {
                if (rowData.increase < 0) { //日涨跌幅无正负标识
                    el.addClass("green-text");
                    return "-" + utils.retainDecimal(rowData.increase, 2) + "%";
                }
                return utils.retainDecimal(rowData.increase, 2) + "%";
            }
        }
        //列6渲染 万份收益/单位净值
        function col6Render(el, rowData) {
            el.addClass("red-text");
            if (rowData.fund_type == "04") { //货币型
                if (rowData.fund_lncomeflag == '0') { //标识为负数处理
                    el.addClass("green-text");
                    return "-" + utils.currency(rowData.fund_lncome, 4);
                }
                return utils.currency(rowData.fund_lncome, 4);
            } else {
                if (rowData.fund_nav < 0) { //日涨跌幅无正负标识
                    el.addClass("green-text");
                    return "-" + utils.currency(rowData.fund_nav, 4);
                }
                return utils.currency(rowData.fund_nav, 4);
            }
        }

        function btnRender(el, rowData) {
            var buyBtn = $("<button class='buy-btn'>申购</button>");
            var redeemBtn = $("<button class='buy-btn'>赎回</button>");
            buyBtn.click(function() {
                window.location.href = "/funds/recharge/" + rowData.fund_code;
            })
            redeemBtn.click(function() {
                window.location.href = "/funds/takeNow/"  + rowData.fund_code;
            })
            el.append(buyBtn);
            el.append(redeemBtn);
        }

        function dividendmethodRender(el, rowData, data) {
            return dividendmethod[data];
        }

        function fundRender(el, rowData) {
            if (rowData.prod_type == "04") {
                el.text(rowData.fundincome)
            }
        }

        function dateRender(el, rowData, data) {
            console.log(data);
            el.text(utils.dateStr2DateStr(data, "YYYYMMDD", "YYYY-MM-DD"))
        }
    })
})
