require(['../../commonConfig'], function() {
    require(['jquery',
        'lodash',
        'httpRequest',
        'utils',
        'loading',
        'pagination',
        'table',
        'date',
        'global_dialog_common'
    ], function($, _, httpRequest, utils,loading) {
        //初始化表格
        var table = $("#table").table({
            columns: [
                { field: "fund_name", title: "基金简称", className: "table_th" },
                { field: "income", title: "收益金额", render: methodRender},
                { field: "bkact_acctno", title: "银行卡", render: hideCard }, /*--原交易卡号--*/
                { field: "dividend_date", title: "收益日期", render: dateRender } /*--原收益日期--*/
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
        var syncData = function(params,tb) { //type==01是收益 02是交易
            // console.log(params)
            var deferred = $.Deferred();
            var requestParams = _.assign(defaultQueryParams, params);
            // if(type=="01"){
                httpRequest.post("/bao/yestEarn", requestParams).then(function(sucData) {
                    if (sucData.respHead.head_rtn_code == "000000") {
                        deferred.resolve(sucData);
                    } else {
                        //处理查询失败
                        tb.showMsg("查询失败");
                    }
                }, function(errData) {
                    tb.showMsg("查询失败,网络异常！");
                    deferred.reject(errData);
                });
                return deferred;
            // }else{
              
               
                // httpRequest.post("/bao/yestTrans", requestParams).then(function(sucData) {
                //     if (sucData.respHead.head_rtn_code == "000000") {
                //         deferred.resolve(sucData);
                //     } else {
                //         //处理查询失败
                //         tb.showMsg("查询失败");
                //     }
                // }, function(errData) {
                //     tb.showMsg("查询失败,网络异常！");
                //     deferred.reject(errData);
                // });
                // return deferred;
            // }
            
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
           
                // tb.loading();
                // var requestParams = _.assign(defaultQueryParams, params);
                // syncData(requestParams,tb,type).then(function(data) {
                //     totalNum = data.respBody.total_count;
                //     if (callback) callback(totalNum, requestParams.query_num);
                //     // 更新列表数据
                //     tb.updateData(data.respBody.list);
                // });
          
            
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
                        query_begin_line: pagination.getCurrent() + ""
                    });
                    console.log("ddsadsa")
                    renderListData(requestParams);
                }
            });
        };

        // 调用渲染数据方法，渲染列表数据
       renderListData(defaultQueryParams, renderPagination,table);

        // 绑定本页显示的A标签事件
        $.each(showNumEl, function(index, el) {
            $(el).click(function() {
                showNumEl.removeClass("active");
                $(this).addClass("active");
                defaultQueryNum = $(this).text();
                // 渲染列表数据参数
                var queryParams = {
                    query_num: defaultQueryNum,
                    query_begin_line: "1"
                };
                historyParams = _.assign(historyParams, queryParams);
                renderListData(historyParams, renderPagination,table);
            });
        });

        //条件查询
        
        var searchForm = function(tables,btn,formid){
            
            $(btn).click(function() {
            var fields = $(formid).serializeArray();
            var params = {};
            $.each(fields, function(index, item) {
                params[item.name] = item.value;
            });
            if (params.select_start_date) {
                params.start_date = params.select_start_date;
                params.end_date = params.now_date;
            } else {
                params.start_date = params.start_date.replace(/-/g, "");
                params.end_date = params.end_date.replace(/-/g, "");
            }
            historyParams = _.assign(historyParams, {
                query_begin_line: "1" //重置到第一页
            }, params);
            renderListData(historyParams, renderPagination,tables);
            // $("#searchForm").reset();
            return false;
        })
    }
    searchForm(table,"#searchBtn","#searchForm")
        
        //分红方式渲染
        function methodRender(el, rowData, data) {
            return dividendmethod[data] ;
        };
        //金额渲染
        function currencyRender(el, rowData, data) {
            return utils.currency(data, 2);
        };
        //日期渲染
        function dateRender(el, rowData, data) {
            return utils.dateStr2DateStr(data, "YYYYMMDD", "YYYY-MM-DD");
        };
        function hideCard(el, rowData, data) {
          return utils.hideCard(data);
        }
    });
});
