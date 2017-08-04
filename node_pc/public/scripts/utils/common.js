/*
   描述: loading
*/
define(['jquery', 'httpRequest', 'moment', 'utils', 'dialog'], function ($, httpRequest, moment, utils) {
    var global_dialog = $("#global_dialog");
    if (global_dialog.attr("is-show") == "true") {
        easyDialog.open({
            container: 'global_dialog'
        });
    }
    $(".global_close_dialog_btn").click(function () {
        easyDialog.close();
    });

    // 搜索框
    $(".g-search-btn").click(function (e) {
        search(this);
    });
    $(".g-search-input").keydown(function (e) {
        if (e.keyCode == 13) {
            search(this);
        }
    })
    function search(_this) {
        var inputval = $(".g-search-input").val();
        if (inputval == "" || inputval === $(".g-search-input").attr("placeholder")) {
            return;
        }
        $('.g-search-reasulist ul').empty();
        $('.g-search-reasulist ul').append('<li><span>搜索中...<span></li>');
        var silDiv = $(_this).parents(".g-search-container").find(".g-search-reasulist");
        silDiv.show();
        httpRequest.post("/common/queryFund", { 'code_or_name': inputval }).done(function (data) {
            $('.g-search-reasulist ul').empty();
            if (data.respHead.head_rtn_code == "000000") {
                if (data.respBody.list.length == 0) {
                    $('.g-search-reasulist ul').append("<li><span>暂无数据</span></li>");
                } else {
                    $.each(data.respBody.list, function (i, n) {
                        $('.g-search-reasulist ul').append('<li><a href="' + base_url + '/funds/detail/' + n.fund_code + '">' + n.fund_name + '</a></li>');
                    });
                }
            } else {
                // 搜索失败提示
            }
        });
    }
    $(".g-search-container").click(function (e) {
        e.stopPropagation();
    });
    $(document.body).click(function () {
        var silDiv = $(".g-search-reasulist");
        silDiv.hide();
    });

    $(".global_logout_dialog_btn").click(function () {
        // easyDialog.open({
        //     container: 'logout_dialog'
        // });
    });
    var reg = new RegExp("^(" + base_url + ")(\/account|\/index|\/funds|\/aboutUs|\/trans|\/info|\/bao|\/myAccount)\S*?", "i");
    if (!window.global_notice_dialog_showed && reg.test(window.location.pathname)) {
        httpRequest.post("/common/getNotices").done(function (data) {
            if (data.respHead.head_rtn_code == "000000") {
                window.global_notice_dialog_showed = true;
                var notice = data.respBody;
                $("#noticeModal > .title").text(notice.notice_title);
                $("#noticeModal > .subtitle").text(moment(notice.notice_crtdate, 'YYYYMMDD').format('YYYY-MM-DD'));
                $("#noticeModal > .container").html(notice.notice_content).click(function () {
                    window.href = base_url + '/category/notice/article?category=' + notice.notice_type + '&article_id=' + notice.notice_serno;
                });
                easyDialog.open({
                    container: 'noticeModal'
                });
            }
        })
    }

    $(".javascript_go_back").click(function () {
        if (utils.browser() == "Safari") {
            // window.history.go(-1); return false;
            // event.preventDefault();
            // history.back(1);
            window.location.href = window.document.referrer;
        } else {
            window.history.go(-1);
        }
    });

    //处理placeholder兼容问题脚本
    utils.placeholderable();

    window.ladate_date_start_options = {
        istoday: false,
        choose: function (datas) {
            ladate_date_end_options.min = datas; //开始日选好后，重置结束日的最小日期
            // date_end.start = datas //将结束日的初始值设定为开始日
            // console.log(arguments,datas);
            var max = moment(datas, 'YYYY-MM-DD').add(1, 'M').format('YYYY-MM-DD');
            ladate_date_end_options.max = max;
        },
        oclear: function (c) {
            ladate_date_end_options.max = "";
            ladate_date_end_options.min = "";
            if (!utils.isSupportPlaceholder()) {
                $("input[name='start_date']").attr("value", $("input[name='start_date']").attr("placeholder"));
            }
        }
    };
    window.ladate_date_end_options = {
        istoday: false,
        choose: function (datas) {
            ladate_date_start_options.max = datas; //结束日选好后，重置开始日的最大日期
            var min = moment(datas, 'YYYY-MM-DD').subtract(1, 'M').format('YYYY-MM-DD');
            ladate_date_start_options.min = min;
        },
        oclear: function () {
            ladate_date_start_options.max = "";
            ladate_date_start_options.min = "";
            if (!utils.isSupportPlaceholder()) {
                // console.log($("#date_end").attr("placeholder"));
                // $("#ladate_date_end").attr("value", $("#end_date").attr("placeholder"))
                $("input[name='end_date']").attr("value", $("input[name='end_date']").attr("placeholder"));
            }
        }
    };

});
