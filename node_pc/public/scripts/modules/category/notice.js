require(['../../commonConfig'], function () {
    require(['jquery',
        'lodash',
        'utils',
        'httpRequest',
        'pagination',
        'date',
        'global_dialog_common'
    ], function ($, _, utils, httpRequest) {
        // 获取本页显示的数量a标签元素
        var showNumEl = $("#showData").find("a"),
            defaultQueryNum = showNumEl.first().text(),
            totalNum = '';

        // 默认查询数据参数
        var defaultQueryParams = {
            query_num: defaultQueryNum || 10,
            query_begin_line: '1'
        };

        // 异步获取数据promise
        var syncData = function (params) {
            // console.log(params)
            var deferred = $.Deferred();
            // 请求参数
            var queryDataParams = {
                query_num: params.query_num,
                query_begin_line: params.query_begin_line
            };
            httpRequest.post("/category/notice", queryDataParams)
                .then(function (sucData) {
                    if (sucData.respHead.head_rtn_code == "000000") {
                        deferred.resolve(sucData);
                    }
                }, function (errData) {
                    deferred.reject(errData);
                });
            return deferred;
        };

        // 渲染查询数据
        var renderListData = function (params, callback) {
            console.log('params',params)
            syncData({
                query_num: params.query_num,
                query_begin_line: params.query_begin_line
            }).then(function (data) {
                totalNum = data.respBody.total_count;
                if (callback) callback(data);
                // 更新列表数据
                updateList(data.respBody.list);
            });
        };

        // 渲染分页
        var renderPagination = function () {
            // 调用分页
            $('.pagination').pagination({
                totalData: totalNum,
                showData: defaultQueryNum,
                coping: true,
                jump: true,
                callback: function (pagination) {
                    var paginationQueryParams = {
                        query_num: defaultQueryNum,
                        query_begin_line: pagination.getCurrent()
                    };
                    renderListData(paginationQueryParams)
                }
            });
        };

        // 调用渲染数据方法，渲染列表数据
        renderListData(defaultQueryParams,renderPagination);

        // 绑定本页显示的A标签事件
        $.each(showNumEl, function (index, el) {
            $(el).click(function () {
                showNumEl.removeClass("active");
                $(this).addClass("active");
                defaultQueryNum = $(this).text();
                // 重新渲染分页插件
                renderPagination();
                // 渲染列表数据参数
                var queryParams = {
                    query_num: defaultQueryNum,
                    query_begin_line: '1'
                };
                renderListData(queryParams);
            })
        });

        // 更新列表数据
        function updateList(list) {
            var newsResult = $("#news-result").empty();
            $.each(list,function (idx,item) {
                var str = '<li><a class="notice-title" href="'+ base_url +'/category/notice/article?category=' + item.notice_type + '&article_id=' + item.notice_serno + '">' + item.notice_title + '</a><div class="public-date">' + utils.dateStr2DateStr(item.notice_crtdate, "YYYYMMDD", "YYYY-MM-DD") + '</div></li>';
                newsResult.append($(str));
            })
        }
    })
});
