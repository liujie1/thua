/*
   描述: 简易表格生成
*/
define(['jquery'], function ($) {
    $.fn.table = function (options) {
        var _default = {
            even: true,
            data: [],
            screenIteratees: [],
            columns: [
                { field: "", title: "" }
            ]
        }
        var _screen = {
            data: [],
            iteratees: [],
            status: "none"
        }

        $.extend(_default, options);

        var table = $(this);

        var _fn = {
            init: function () {
                var thead = _fn.createThead(_default.columns);
                table.append(thead).append(_fn.createTbody());
                _fn.updateData(_default.data);
            },
            getArrIndex: function (arr, sortStr) {
                sortStr = String(sortStr);//将参数处理下，避免有数字等其他类型。
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i] == sortStr) {
                        return i;
                    }
                } return -1;
            },
            asc: function (element, column) {
                $(element).parents("tr").find("th").removeClass("downed uped");
                $(element).addClass("uped");
                $(element).removeClass("downed");
                var iterEl = $(element).parents("tr").find(".uped,.downed");
                var iteratees = [];
                _.forEach(iterEl, function (el, index) {
                    var index = $(el).data("index");
                    iteratees.push(_default.columns[index].field);
                });
                console.log("筛选条件", iteratees);
                _screen.iteratees = iteratees;
                if(_.isFunction(column.screenFn)){
                    return column.screenFn(iteratees[0], "asc");
                }
                _screen.status = "asc";
                var ascData = _.sortByOrder(_screen.data, iteratees, "asc");
                _fn.updateData(ascData, true);
            },
            desc: function (element, column) {
                $(element).parents("tr").find("th").removeClass("downed uped");
                $(element).addClass("downed");
                $(element).removeClass("uped");
                var iterEl = $(element).parents("tr").find(".uped,.downed");
                var iteratees = [];
                _.forEach(iterEl, function (el, index) {
                    var index = $(el).data("index");
                    iteratees.push(_default.columns[index].field);
                });
                if(_.isFunction(column.screenFn)){
                    return column.screenFn(iteratees[0], "desc");
                }
                console.log("筛选条件", iteratees);
                _screen.iteratees = iteratees;
                var descData = _.sortByOrder(_screen.data, iteratees, "desc");
                _screen.status = "desc";
                _fn.updateData(descData, true);
            },
            reset: function (element, column) {
                $(element).parents("tr").find("th").removeClass("downed uped");
                var iterEl = $(element).parents("tr").find(".uped,.downed");
                var iteratees = [];
                _.forEach(iterEl, function (el, index) {
                    var index = $(el).data("index");
                    iteratees.push(_default.columns[index].field);
                });
                console.log("筛选条件", iteratees);
                _screen.iteratees = iteratees;
                _screen.status = "none";
                _fn.updateData(_default.data);

            },
            createThead: function (columns) {
                var thead = $("<thead class='table-thead'></thead>");
                var tr = $("<tr></tr>");
                $.each(columns, function (index, column) {
                    var td = null;
                    td = $('<th data-index="' + index + '" class="' + (column.className || '') + '"></th>');

                    if (column && column.title) {
                        td.text(column.title);
                        tr.append(td);
                    }
                    if (column.screen || _.isFunction(column.screenFn)) {
                        var up = $("<i class='table-up'/>");
                        var down = $("<i class='table-down'/>");
                        td.addClass("table-screen");
                        td.append(up).append(down);
                        td.click(function () {
                            if ($(this).hasClass("downed")) {
                                _fn.asc(this, column);
                            } else if ($(this).hasClass("uped")) {
                                _fn.reset(this, column);
                            } else {
                                _fn.desc(this, column);
                            }
                        });
                    }
                });
                thead.append(tr);
                return thead;
            },
            updateData: function (data, isScreen) {
                var tbody = table.find("tbody");
                _screen.data = data;
                if (!isScreen) {
                    // table.find("thead th").removeClass("downed uped");
                    _default.data = data;
                }
                if (_screen.status == "asc" && !isScreen) {
                    data = _.sortByOrder(data, _screen.iteratees, "asc");
                }
                if (_screen.status == "desc" && !isScreen) {
                    data = _.sortByOrder(data, _screen.iteratees, "desc");
                }
                console.log(data);
                tbody.removeAttr("style");
                tbody.empty();
                if (!data || data.length <= 0) {
                    return _fn.showMsg("暂无数据");
                }
                $.each(data, function (i, item) {
                    var tr = $("<tr></tr>");

                    if (_default.even) {
                        if ((i + 1) % 2 == 0) {
                            tr.addClass("even");
                        } else {
                            tr.addClass("odd");
                        }
                    }
                    $.each(_default.columns, function (index, column) {
                        if (column.className) {
                            td = $('<td class=' + column.className + '></td>');
                        } else {
                            td = $("<td></td>");
                        }

                        if (column.width) {
                            td.css('width', column.width);
                        }

                        if (column.field == "index" && !item[column.field]) {
                            console.log(index);
                            td.text(i + 1);
                        } else {
                            td.text(item[column.field]);
                        }
                        if ($.isFunction(column.render)) {
                            var res = column.render(td, item, item[column.field]);
                            if (res) {
                                td.html(res);
                            }
                        }
                        tr.append(td);
                    });
                    tbody.append(tr)
                })
            },
            loading: function () {
                var tbody = table.find("tbody");
                tbody.css({ position: "relative", height: "200px", display: "table" });
                var loading = $('<div class="content"><img src="' + base_url + '/images/theme/' + img_theme_finder + '/loading.gif"></img></div>');
                tbody.empty();
                loading.css({
                    position: "absolute",
                    width: "1130px",
                    "text-align": "center",
                    "padding-top": "70px"
                })
                tbody.append(loading);
            },
            showMsg: function (msg) {
                var tbody = table.find("tbody");
                tbody.css({ position: "relative", height: "200px", display: "table" });
                tbody.empty();
                var text = $("<p>" + msg + "</p>");
                text.css({
                    position: "absolute",
                    width: "1130px",
                    "text-align": "center",
                    "line-height": "40px",
                    "padding-top": "40px"
                })
                tbody.append(text);
            },
            createTbody: function () {
                var tbody = $("<tbody></tbody>");
                return tbody;
            }
        }

        _fn.init();
        return {
            updateData: _fn.updateData,
            loading: _fn.loading,
            showMsg: _fn.showMsg
        }
    }
});
