require(['../../commonConfig'], function () {
    require(['jquery',
        'httpRequest',
        'message_zh',
        'utils',
        'loading',
        "simpletooltip",
        'global_dialog_common',
        'modal'
    ], function ($, httpRequest, validate, utils, loading) {
        if ($("#js-input-amount").value == undefined || $("#js-input-amount").value == '0') {
            if (utils.isSupportPlaceholder()) {
                $("#js-input-amount").val("");
            }
            $(".capitalamount").text(is_baby == "00" ? "零元" : "零份");
        } else {
            var j = chineseNumber($("#js-input-amount").value);
            $(".capitalamount").text(j);
        };

        $('a[data-modal]').on('click', function () {
            $(this).modal();
            return false;
        });

        //基金确认弹层
        $("#fund_laybtn").click(function () {
            if (!$("#form").valid()) return;
            var j = chineseNumber($("#js-input-amount").val());
            $("input[name='account1']").val($("#js-input-amount").val())
            $(".pay_money").text($("#js-input-amount").val() + "份")
            $(".big-ch").text(j)
            easyDialog.open({
                container: 'people_info'
            })
        })

        //关闭弹层
        $(".dialog-close-btn").click(function () {
            easyDialog.close();
        });
        $(".tip-close-btn").click(function () {
            $("#select_tip").fadeOut();
        })
        //表单验证
        // validate.initForm($("#form"), "正在交易，请稍后。。。", function(){
        //     if (!$("input[name='fund_code']").val()) { //判断有没有选择基金，如果没有提示用户
        //         $("#select_tip #tip_text").text("请先选择基金产品");
        //         $("#select_tip").fadeIn();
        //         return false;
        //     }
        //     return true;
        // });
        validate.initForm($("#form"), "正在交易，请稍后。。。");
        $("#btn-submit").click(function () {
            console.log($("input[name='fund_code']").val());
            if (!$("input[name='fund_code']").val()) { //判断有没有选择基金，如果没有提示用户
                $("#select_tip #tip_text").text("请先选择基金产品");
                $("#select_tip").fadeIn();
                return false;
            }

            if ($("#form").valid()) {
                // console.log($("#form").valid());
                $("#form").submit();
            }
        });
        validate.initForm($("#fundForm"), "正在交易，请稍后。。。");
        $("#buy_btn").click(function () {
            if ($("#fundForm").valid()) {
                easyDialog.close();
                $("#fundForm").submit();
            }
        })


        $(".quxian-btn").click(function () {
            var value = _.trim($("#js-available-vol").text());
            $("#js-input-amount").val(value)
            $(".capitalamount").text(chineseNumber(value));
        })

        $(".no").click(function () {
            easyDialog.close();
        })
        $('.simpletooltip').simpletooltip({
            themes: {
                pink: {
                    color: 'red',
                    border_color: 'red',
                    background_color: 'pink',
                    border_width: 4
                },
                brazil: {
                    color: 'yellow',
                    background_color: 'green',
                    border_color: 'yellow',
                    border_width: 4
                }
            }
        });

        // if (is_baby == '00') {
        //   var tip1 = $('#take-tip span')[0].innerHTML;
        //   var tip2 = $('#take-tip input')[0].value;
        // }

        // if (bkact_fncacct) {
        //     disposeTranInput(bkact_fncacct);
        // } else {
        //     disposeTranInput(defFncacct);
        // }

        function disposeTranInput(available_vol) {
            var placeholder = "可取现金额为" + utils.currency(available_vol, 2) + "元";
            $("input[name='account']").attr("placeholder", placeholder);
        }

        $('.select-card').on('click', '#card_no', function (event) {
            $(this).find('.select-options').slideToggle(300);
            // event.stopPropagation();
        });
        $('.select-card').on('click', 'li', function (event) {
            var selectVal = $(this).text();
            var _bkact_fncacct = $(this).attr("data-val");
            if(!_bkact_fncacct) return;
            var item = JSON.parse($(this).attr("data-list"));
            $('#card_no .bank-num').text(selectVal);
            $("input[name='bkact_fncacct']").val(_bkact_fncacct);
            disposeTranInput(item.fundlist[0].available_vol);
            $("#select_tip").fadeOut();
            if (is_baby === '01') {
                $('#js-input-amount').attr('account1', item.fundlist[0].available_vol);
            } else {
                $('#js-input-amount').attr('account', item.fundlist[0].available_vol);
            }

            // 设置可取现金额
            if ($("input[name='fund_code']").val()) {
                $("#js-available-vol").text(item.fundlist[0].available_vol);
            }
        });

        $(document.body).click(function (e) {
            var $container = $('#card_no');   // 设置目标区域
            if (!$container.is(e.target) && $container.has(e.target).length === 0) {
                $('.select-options').slideUp(300);
            }
        });

        $('#take_type').change(function () {
            var type = $(this)[0].value;
            if (type == "00") {
                var selfchannel_trsnote = $("#selfchannel_trsnote").val() || "";
                selfchannel_trsnote = selfchannel_trsnote == "undefined" ? "" : selfchannel_trsnote;
                $('#take-tip').html(selfchannel_trsnote);
                $('.agreement').show();
            } else {
                var confirm_date = $("#confirm_date").val() || "";
                confirm_date = confirm_date == "undefined" ? "" : confirm_date;
                $('#take-tip').html(confirm_date);
                $('.agreement').hide();
            }
        })

        httpRequest.post("/common/getRandom", {
            channel_type: "01"
        }).done(function (data) {
            if (data.respHead.head_rtn_code == "000000") {
                random_num = data.respBody.random_num;
                random_uuid = data.respBody.random_uuid;
                $('input[name="random_uuid"]').val(random_uuid);
                $('input[name="random_num"]').val(random_num);
            }
        });

        $(".radio-mode label").on('click', function () {
            var index = $(".radio-mode label").index(this);
            $(".yield-info span").css("display", "none");
            if (index == 0) {
                $(".yield-info1").css("display", "block");
            } else {
                $(".yield-info2").css("display", "block");
            }
        });

        $('.jin-chooselist li').on('click', function (event) {
            if ($(this).hasClass('chooseon')) { return };
            var $this = $(this);
            var fundCode = $(this).data('fund-code');
            $('#js-fund-code').val(fundCode);
            $("input[name='fund_code']").val(fundCode);
            // class 切换
            $(this).addClass("chooseon")
            $(this).siblings().removeClass('chooseon');
            $("#select_tip").fadeOut();
            // 查询限额
            var loaded = loading();
            httpRequest.post("/bao/limitDetails", { fundCode: fundCode }).done(function (data) {
                if (data.respHead.head_rtn_code == "000000") {
                    $('.js-confirm-date').html(data.respBody.confirm_date);

                    httpRequest.post("/bao/queryBabyFundInfo", { fundCode: fundCode }).done(function (_data) {
                        loaded.close();
                        // 清空容器
                        $('#js-card-list').empty();
                        var cardlist = _data.respBody.cardlist;

                        // 判断是否有卡购买基金
                        if (cardlist.length === 0) {
                            $('#js-card-list').append('<span style="margin-top:8px; display: inline-block">您还没购买该产品</span>');
                            $('#js-available-vol').text('0');
                        } else {
                            var dd = $('<dd class="pay-mode" id="card_no"></dd>');
                            var cardNum = cardlist[0].bkact_acctno;
                            if(bkact_fncacct){
                                dd.append('<span class="bank-num" id="showCard">' + cardlist[0].bkinfo_name + ' 尾号（' + cardNum.substr(cardNum.length - 4, 4) + '）</span>');
                            } else {
                                dd.append("<span class='bank-num'>请选择支付方式</span>")
                            }
                            // dd.append('<span class="bank-num" id="showCard">' + cardlist[0].bkinfo_name + ' 尾号（' + cardlist[0].bkact_acctno.substr(-4, 4) + '）</span>')
                            $('#js-card-list').append(dd);
                            // 银行卡多张，渲染下拉三角形
                            if (cardlist.length > 0) {
                                dd.append('<i class="icon-triangle"></i>');
                                var ul = $('<ul class="select-options hide"></ul>');
                                if (cardlist.length > 5) {
                                    ul.addClass('select-min');
                                }
                                for (var i = 0; i < cardlist.length; i++) {
                                    //IE8不支持substr 负数
                                    // var li = $('<li>' + cardlist[i].bkinfo_name + ' 尾号（' + cardlist[i].bkact_acctno.substr(-4, 4) + '）</li>');
                                    var cardNum = cardlist[i].bkact_acctno;
                                    var li = $('<li>' + cardlist[i].bkinfo_name + ' 尾号（' + cardNum.substr(cardNum.length - 4, 4) + '）</li>');
                                    li.attr('data-val', cardlist[i].bkact_fncacct);
                                    li.attr('data-list', JSON.stringify(cardlist[i]));
                                    li.appendTo(ul);
                                }
                                // 更新数据
                                dd.append(ul);//.appendTo('#js-card-list');
                                $('#js-card-list').append(dd);
                            }
                            // 更新默认第一张卡的可取现金额
                            $('#js-available-vol').text(cardlist[0].fundlist[0].available_vol);
                            disposeTranInput(cardlist[0].fundlist[0].available_vol);
                            if (is_baby === '00') {
                                $('#js-input-amount').attr('account', cardlist[0].fundlist[0].available_vol);
                            } else {
                                $('#js-input-amount').attr('account1', cardlist[0].fundlist[0].available_vol);
                            }
                        }
                    });
                } else {
                    loaded.close();
                    $('#js-card-list').html('<span style="margin-top:8px; display: inline-block;">' + data.respHead.head_rtn_desc + '</span>');
                    $('#js-available-vol').text('0');
                    $('js-input-amount').attr('account', 0);
                    disposeTranInput(0);
                }
            });
        });
        $("#js-input-amount").bind("input propertychange", function (e) {
            return Edit1Change();
        });
        function Edit1Change() {
            $(".capitalamount").text(chineseNumber(document.getElementById("js-input-amount").value));
        }
        function chineseNumber(dValue) {
            var maxDec = 2;
            // 验证输入金额数值或数值字符串：
            dValue = dValue.toString().replace(/,/g, "");
            dValue = dValue.replace(/^0+/, ""); // 金额数值转字符、移除逗号、移除前导零
            if (dValue == "") {
                return is_baby == "00" ? '零元' : '零份';
            } // （错误：金额为空！）
            else if (isNaN(dValue)) { //// IE8,9 value 值是 plachold属性值中文显示。所以注掉错误 直接显示0元
                return is_baby == "00" ? '零元' : '零份';//"错误：金额不是合法的数值！";
            }
            var minus = ""; // 负数的符号“-”的大写：“负”字。可自定义字符，如“（负）”。
            var CN_SYMBOL = ""; // 币种名称（如“人民币”，默认空）
            if (dValue.length > 1) {
                if (dValue.indexOf('-') == 0) {
                    dValue = dValue.replace("-", "");
                    minus = "负";
                } // 处理负数符号“-”
                if (dValue.indexOf('+') == 0) {
                    dValue = dValue.replace("+", "");
                } // 处理前导正数符号“+”（无实际意义）
            }
            // 变量定义：
            var vInt = "";
            var vDec = ""; // 字符串：金额的整数部分、小数部分
            var resAIW; // 字符串：要输出的结果
            var parts; // 数组（整数部分.小数部分），length=1时则仅为整数。
            var digits, radices, bigRadices, decimals; // 数组：数字（0~9——零~玖）；基（十进制记数系统中每个数字位的基是10——拾,佰,仟）；大基（万,亿,兆,京,垓,杼,穰,沟,涧,正）；辅币（元以下，角/分/厘/毫/丝）。
            var zeroCount; // 零计数
            var i, p, d; // 循环因子；前一位数字；当前位数字。
            var quotient, modulus; // 整数部分计算用：商数、模数。
            // 金额数值转换为字符，分割整数部分和小数部分：整数、小数分开来搞（小数部分有可能四舍五入后对整数部分有进位）。
            var NoneDecLen = (typeof (maxDec) == "undefined" || maxDec == null || Number(maxDec) < 0 || Number(maxDec) > 5); // 是否未指定有效小数位（true/false）
            parts = dValue.split('.'); // 数组赋值：（整数部分.小数部分），Array的length=1则仅为整数。
            if (parts.length > 1) {
                vInt = parts[0];
                vDec = parts[1]; // 变量赋值：金额的整数部分、小数部分
                if (NoneDecLen) {
                    maxDec = vDec.length > 5 ? 5 : vDec.length;
                } // 未指定有效小数位参数值时，自动取实际小数位长但不超5。
                var rDec = Number("0." + vDec);
                rDec *= Math.pow(10, maxDec);
                rDec = Math.round(Math.abs(rDec));
                rDec /= Math.pow(10, maxDec); // 小数四舍五入
                var aIntDec = rDec.toString().split('.');
                if (Number(aIntDec[0]) == 1) {
                    vInt = (Number(vInt) + 1).toString();
                } // 小数部分四舍五入后有可能向整数部分的个位进位（值1）
                if (aIntDec.length > 1) {
                    vDec = aIntDec[1];
                } else {
                    vDec = "";
                }
            } else {
                vInt = dValue;
                vDec = "";
                if (NoneDecLen) {
                    maxDec = 0;
                }
            }
            if (vInt.length > 44) {
                return "错误：数值过大！整数位长【" + vInt.length.toString() + "】超过了上限！";
            }
            // 准备各字符数组 Prepare the characters corresponding to the digits:
            digits = new Array("零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"); // 零~玖
            radices = new Array("", "拾", "佰", "仟"); // 拾,佰,仟
            bigRadices = new Array("", "万", "亿", "兆", "京", "垓", "秭", "穰", "沟", "涧", "正"); // 万,亿,兆,京,垓,杼,穰,沟,涧,正
            decimals = new Array("角", "分", "厘", "毫", "丝"); // 角/分/厘/毫/丝
            resAIW = ""; // 开始处理
            // 处理整数部分（如果有）
            if (Number(vInt) > 0) {
                zeroCount = 0;
                for (i = 0; i < vInt.length; i++) {
                    p = vInt.length - i - 1;
                    d = vInt.substr(i, 1);
                    quotient = p / 4;
                    modulus = p % 4;
                    if (d == "0") {
                        zeroCount++;
                    } else {
                        if (zeroCount > 0) {
                            resAIW += digits[0];
                        }
                        zeroCount = 0;
                        resAIW += digits[Number(d)] + radices[modulus];
                    }
                    if (modulus == 0 && zeroCount < 4) {
                        resAIW += bigRadices[quotient];
                    }
                }
                if (is_baby == "00") {
                    resAIW += '元';
                }
            }

            if (is_baby == "01" && vDec > 0) {
                if (resAIW === '') {
                    resAIW += '零点';
                } else {
                    resAIW += '点';
                }
            }

            // 处理小数部分（如果有）
            for (i = 0; i < vDec.length; i++) {
                d = vDec.substr(i, 1);
                if (d != "0" && is_baby == "00") {
                    resAIW += digits[Number(d)] + decimals[i];
                } else {
                    resAIW += digits[Number(d)];
                }
            }
            // 处理结果
            if (resAIW == "") {
                resAIW = "零";
            } // 零元
            if (vDec == "") {
                resAIW;
            } // ...元整
            resAIW = CN_SYMBOL + minus + resAIW; // 人民币/负......元角分/整
            resAIW += (is_baby == "00" ? '' : '份');
            return resAIW;
        }
    })
});
