require(['../../commonConfig'], function () {
    require(['jquery',
        'lodash',
        'httpRequest',
        'utils',
        'pagination',
        'table',
        'json2',
        'global_dialog_common'
    ], function ($, _, httpRequest, utils) {

        //更多按钮
        $(".found-infomore").click(function () {
            var silDiv = $(this).parents(".found-infobox").find("ul");
            if ($(this).hasClass("found-infomoreon")) {
                $(this).removeClass("found-infomoreon");
                silDiv.css("height", "50px");
            } else {
                $(this).addClass("found-infomoreon");
                silDiv.css("height", "auto");
            }
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

        //基金筛选条件
        var filterParams = {
            fund_type: [],
            prov_code: []
        };

        var queryFilter = function (filterParams) {
            var params = {
                query_num: defaultQueryNum,
                query_begin_line: '1', //每次选择从第一
                fund_type: filterParams.fund_type.join(","),
                prov_code: filterParams.prov_code.join(",")
            };
            console.log("条件查询参数:", params);
            renderListData(params, renderPagination);
        }

        //基金类型条件选择
        $('#js-fund-filter li').on('click', function () {
            if ($(this).hasClass('active')) return;
            $(this).addClass('active');
            $('#js-fund-all').removeClass('active');
            var data = JSON.parse($(this).attr("data"));
            console.log("当前选择条件值", data);
            filterParams.fund_type.push(data.fund_type);
            queryFilter(filterParams);
        });
        //基金公司条件选择
        $('#js-scale-filter li').on('click', function () {
            if ($(this).hasClass('active')) return;
            $(this).addClass('active');
            // $(this).siblings().removeClass('active');
            $('#js-scale-all').removeClass('active');
            var data = JSON.parse($(this).attr("data"));
            console.log("当前选择条件值", data);
            filterParams.prov_code.push(data.prov_code);
            queryFilter(filterParams);
        });
        //基金类型条件重置
        $('#js-fund-all').on('click', function () {
            $(this).addClass("active");
            $('#js-fund-filter li').removeClass('active');
            filterParams.fund_type = [];
            queryFilter(filterParams);
        });
        //基金范围条件重置
        $('#js-scale-all').on('click', function () {
            $(this).addClass("active");
            $('#js-scale-filter li').removeClass('active');
            filterParams.prov_code = [];
            queryFilter(filterParams);
        });

        //基金类型条件选择关闭按钮
        $('#js-fund-filter i').on("click", function (e) {
            console.log(1);
            e.stopPropagation();
            console.log($(this).parents("li").attr("data"));
            $(this).parents("li").removeClass("active");
            var data = JSON.parse($(this).parents("li").attr("data"));
            filterParams.fund_type.splice(_.indexOf(filterParams.fund_type,data.fund_type), 1);
            queryFilter(filterParams);
        });

        $('#js-scale-filter i').on("click", function (e) {
            e.stopPropagation();
            console.log($(this).parents("li").attr("data"));
            $(this).parents("li").removeClass("active");
            var data = JSON.parse($(this).parents("li").attr("data"));
            filterParams.prov_code.splice(_.indexOf(filterParams.prov_code, data.prov_code), 1);
            queryFilter(filterParams);
        });

        // 基金公司更多按钮显示
        if ($('#js-scale-filter').height() > 50) {
            $('#js-company-more').show().text('更多');
            $('#js-company-more').on('click', function (e) {
                if ($(this).data('isshow') == '00') {
                    $(this).data('isshow', '01').text('收起');
                    $('#js-fold-board').css({height: 'auto', overflow: 'visible'});
                } else {
                    $(this).data('isshow', '00').text('更多'); 
                    $('#js-fold-board').css({height: '50px', overflow: 'hidden'});                   
                }
            });
        }


        function getFilterVal(filterEl) {
            var params = {};
            for (var key in filterEl) {
                params = _.assign(params, JSON.parse(filterEl[key].attr("type-val")));
            }
            return params;
        }

        //条件搜索
        $("#searchBtn").click(function () {
            var params = getFilterVal(filterEl);
            params.query_begin_line = "1"; //重置到第一页
            var search = $("#searchInput").val();
            params.code_or_name = search;
            renderListData(_.assign(defaultQueryParams, params), renderPagination);
        });
        //初始化表格
        var table = $("#table").table({
            columns: [
                { field: "fund_code", title: "基金代码", className: "tabel-item-left" },
                { field: "fund_name", title: "基金简称", render: fundNameRender, className: "tabel-item-left" },
                { field: "fund_type", title: "类型", render: fundTypeRender },
                { field: "fund_nav", title: "单位净值", render: fundNavRender, screenFn: screenFn },
                { field: "fund_lncome", title: "万份收益", render: earningsRender, screenFn: screenFn },
                { field: "day_increase", title: "日涨跌幅", render: percentRender, screenFn: screenFn },
                { field: "this_month_increas", title: "月涨幅", render: percentRender, screenFn: screenFn },
                { field: "last_three_month_increas", title: "季涨幅", render: percentRender, screenFn: screenFn },
                { field: "last_half_year_increas", title: "半年涨幅",render: percentRender, screenFn: screenFn },
                { field: "this_year_increas", title: "年涨幅",render: percentRender, screenFn: screenFn },
                { field: "", title: "操作", render: btnRender }
            ]
        });
        table.loading();

        // 异步获取数据promise
        var syncData = function (params) {
            // console.log(params)
            var deferred = $.Deferred();
            var requestParams = _.assign(defaultQueryParams, params);

            httpRequest.post("/funds/getFunds", requestParams).then(function (sucData) {
                if (sucData.respHead.head_rtn_code == "000000") {
                    deferred.resolve(sucData);
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

        // table.updateData([
        //     { "day_increase": 0.0116, "fund_accnav": 1.1, "fund_code": "000709", "fund_collectfeetype": "0", "fund_defdivmethod": "0", "fund_fstminamtbyindi": 0.01, "fund_level": "2", "fund_lncome": 6.9954, "fund_lncomeflag": "0", "fund_name": "华安汇财通货币市场基金", "fund_nav": 1, "fund_size": 0, "fund_status": "0", "fund_type": "04", "fund_update": "20170711", "fund_yield": 4.0987, "fund_yieldflag": "0", "last_five_year_increas": 0.1825, "last_half_year_increas": 0.018, "last_month_increas": 0.003, "last_three_month_increas": 0.009, "last_three_year_increas": 0.1095, "last_two_year_increas": 0.073, "last_year_increas": 0.0365, "prov_code": "88000000", "prov_name": "华安基金", "since_found_increas": 0.1617, "this_month_increas": 0.003, "this_week_increas": 0.0007, "this_year_increas": 0.0365 },
        //     { "day_increase": 0.3321, "fund_accnav": 0.8923, "fund_code": "001790", "fund_defdivmethod": "0", "fund_fstminamtbyindi": 23, "fund_level": "4", "fund_lncome": 3, "fund_lncomeflag": "1", "fund_name": "国泰智能汽车股票", "fund_nav": 0.45, "fund_size": 1212, "fund_status": "1", "fund_type": "01", "fund_update": "20170713", "fund_yield": 3, "fund_yieldflag": "1", "prov_code": "88000000", "prov_name": "华安基金" },
        //     { "day_increase": 0.3231, "fund_accnav": 12, "fund_code": "000716", "fund_collectfeetype": "01", "fund_defdivmethod": "1", "fund_fstminamtbyindi": 1, "fund_level": "0", "fund_lncome": 2.338, "fund_lncomeflag": "1", "fund_name": "华安科技动力", "fund_nav": 12.02, "fund_size": 8000000, "fund_status": "1", "fund_type": "04", "fund_update": "20170306", "fund_yield": 5.986, "fund_yieldflag": "1", "prov_code": "88000000", "prov_name": "华安基金" },
        //     { "day_increase": 0.2321, "fund_accnav": 1.399, "fund_code": "000149", "fund_collectfeetype": "0", "fund_defdivmethod": "1", "fund_fstminamtbyindi": 3, "fund_level": "4", "fund_lncome": 0, "fund_lncomeflag": "0", "fund_name": "华安双债添利债券型证券投资基金A类", "fund_nav": 1.079, "fund_size": 0, "fund_status": "0", "fund_type": "02", "fund_update": "20170531", "fund_yield": 0, "fund_yieldflag": "0", "prov_code": "88000000", "prov_name": "华安基金" },
        //     { "day_increase": 0.4321, "fund_accnav": 12, "fund_code": "000074", "fund_defdivmethod": "", "fund_fstminamtbyindi": 34, "fund_level": "2", "fund_lncome": 21, "fund_lncomeflag": "", "fund_name": "工银信用纯债一年定开债券A", "fund_nav": 21, "fund_size": 343344, "fund_status": "0", "fund_type": "02", "fund_update": "20170713", "fund_yield": 0.922, "fund_yieldflag": "", "prov_code": "88000000", "prov_name": "华安基金" },
        //     { "day_increase": 0.3231, "fund_accnav": 12, "fund_code": "000714", "fund_collectfeetype": "01", "fund_defdivmethod": "1", "fund_fstminamtbyindi": 1, "fund_level": "1", "fund_lncome": 2.586, "fund_lncomeflag": "1", "fund_name": "易方达消费行业", "fund_nav": 12.02, "fund_size": 8000000, "fund_status": "1", "fund_type": "04", "fund_update": "20170323", "fund_yield": 6.645, "fund_yieldflag": "1", "prov_code": "88000000", "prov_name": "华安基金" },
        //     { "day_increase": 0.3221, "fund_accnav": 1.037, "fund_code": "000221", "fund_collectfeetype": "0", "fund_defdivmethod": "1", "fund_fstminamtbyindi": 1, "fund_level": "0", "fund_lncome": 0, "fund_lncomeflag": "0", "fund_name": "测试02", "fund_nav": 1.037, "fund_size": 0, "fund_status": "0", "fund_type": "01", "fund_update": "20170531", "fund_yield": 0, "fund_yieldflag": "0", "prov_code": "008", "prov_name": "基金超市基金公司测试08" },
        //     { "fund_accnav": 12, "fund_code": "000712", "fund_collectfeetype": "01", "fund_defdivmethod": "1", "fund_fstminamtbyindi": 1, "fund_level": "0", "fund_lncome": 2.988, "fund_lncomeflag": "1", "fund_name": "南方新兴消费", "fund_nav": 12.02, "fund_size": 8000000, "fund_status": "0", "fund_type": "04", "fund_update": "20170302", "fund_yield": 7.536, "fund_yieldflag": "1", "prov_code": "002", "prov_name": "基金超市基金公司测试02" },
        //     { "fund_accnav": 1.037, "fund_code": "000230", "fund_collectfeetype": "0", "fund_defdivmethod": "1", "fund_fstminamtbyindi": 1, "fund_level": "0", "fund_lncome": 0, "fund_lncomeflag": "0", "fund_name": "测试11", "fund_nav": 1.037, "fund_size": 0, "fund_status": "0", "fund_type": "01", "fund_update": "20170531", "fund_yield": 0, "fund_yieldflag": "0", "prov_code": "017", "prov_name": "基金超市基金公司测试17" },
        //     { "fund_accnav": 1.037, "fund_code": "000219", "fund_collectfeetype": "0", "fund_defdivmethod": "1", "fund_fstminamtbyindi": 90, "fund_level": "0", "fund_lncome": 0, "fund_lncomeflag": "0", "fund_name": "嘉实", "fund_nav": 1.037, "fund_size": 0, "fund_status": "0", "fund_type": "01", "fund_update": "20170531", "fund_yield": 0, "fund_yieldflag": "0", "prov_code": "006", "prov_name": "基金超市基金公司测试06" }]);

        // 渲染查询数据
        var renderListData = function (params, callback) {
            // table.loading();
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
                    query_begin_line: "1" //重置到第一页
                };
                historyParams = _.assign(historyParams, queryParams);
                renderListData(historyParams, renderPagination);
            })
        });

        //列4渲染  七日年化/日涨跌幅
        function col4Render(el, rowData) {
            console.log('121212',rowData)
            el.addClass("red-text");
            if (rowData.fund_type == "04") { //货币型
                if (rowData.fund_yieldflag == '1') { //标识为负数处理
                    el.addClass("green-text");
                    return "-" + utils.retainDecimal(rowData.fund_yield, 4) + "%";
                }
                return utils.retainDecimal(rowData.fund_yield, 4) + "%";
            } else {
                if (typeof rowData.increase === 'undefined') {
                    return "--";
                }
                if (rowData.increase < 0) { //日涨跌幅无正负标识
                    el.addClass("green-text");
                    return "-" + utils.currency(rowData.increase, 4) + "%";
                }
                return utils.currency(rowData.increase, 4) + "%";
            }
        }
        //列5渲染 万份收益/单位净值
        function col5Render(el, rowData) {
            console.log('222222',rowData);
            el.addClass("red-text");
            if (rowData.fund_type == "04") { //货币型
                if (rowData.fund_lncomeflag == '1') { //标识为负数处理
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

        function fundNameRender(el, rowData, data) {
            return '<a href="' + base_url + '/funds/detail/' + rowData.fund_code + '">' + data + '</a>';
        }

        function fundTypeRender(el, rowData, data) {
            return fund_type[data];
        }
        function currencyRender(el, rowData, data) {
            return utils.currency(data, 4);
        }

        function earningsRender(el, rowData, data) {
            // if (rowData.fund_type == "04") {
            //     return utils.currency(data, 4);
            // }
             if (data) {
                if(data > 0){
                    $(el).addClass("up-red");
                } else {
                    $(el).addClass("down-black");
                }
                return utils.currency(data, 4);
            }
            return '--';
        }
        function percentRender(el, rowData, data) {
            if(data){
                if(data>0){
                    $(el).addClass("up-red"); 
                }else{
                    $(el).addClass("down-black"); 
                }
                return utils.currency(data, 2) + '%';
            } else {
                return "--";
            }
        }

        function incRender(el, rowData) {
            if (rowData.fund_type == "04") {
                el.text(rowData.yield);
                el.addClass("green-text");
            } else {
                el.addClass("green-text");
            }
        };

        function btnRender(el, rowData) {
            if (rowData.fund_status === '0' ||rowData.fund_status === '1' || rowData.fund_status === '6') {
                var btn = $("<button class='buy-btn'>购买</button>");
                btn.click(function () {
                    window.location.href = base_url + "/funds/recharge/" + rowData.fund_code;
                })
            } else {
                var btn = $("<button class='buy-btn' style='background: #ccc;' disabled>购买</button>");
            }

            el.append(btn);
        }

        function riskRender(el, rowData, data) {
            return funds_risk[data] || funds_risk[1];
        }

        function fundRender(el, rowData) {
            if (rowData.prod_type == "04") {
                el.text(rowData.fundincome);
            }
        }

        function screenFn(field, order){
            table.loading();
            renderListData(_.assign(defaultQueryParams, {
                sort_field: field,
                sort_rule: order
            }), renderPagination);
        }

        function fundNavRender(el, rowData, data){
            // console.log(el)
            if(rowData.fund_type=="04"){
                return "--";
            }
            if (data) {
                if(data > 0){
                    $(el).addClass("up-red");
                } else {
                      $(el).addClass("down-black");
                }
                return utils.currency(data, 4);
            }
            return '--';
        }
    })
})
