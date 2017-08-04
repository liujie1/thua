require(['../../commonConfig'], function () {
    require(['jquery', 'area', 'message_zh'], function ($, area, validate) {
        area.init_area();
        var form = validate.initForm($("#userInfoForm"));
        var message = $("#userInfoForm").formMsg();

        // alert(user);
        
        // 返显下拉框
        if (user.cust_profession) {
            $("#cust_profession").find('option[value="' + user.cust_profession + '"]').prop("selected", 'selected');
        }

        if (user.cust_income) {
            $("#cust_income").find('option[value="' + user.cust_income + '"]').prop("selected", 'selected');
        }

        if (user.cust_property) {
            $("#cust_property").find('option[value="' + user.cust_property + '"]').prop("selected", 'selected');
        }

        if (user.cust_debt) {
            $("#cust_debt").find('option[value="' + user.cust_debt + '"]').prop("selected", 'selected');
        }

        if (user.cust_investhistory) {
            $("#cust_investhistory").find('option[value="' + user.cust_investhistory + '"]').prop("selected", 'selected');
        }

        if (user.cust_creditrecord) {
            $("#cust_creditrecord").find('option[value="' + user.cust_creditrecord + '"]').prop("selected", 'selected');
        }

        if (user.cust_riskpreference) {
            $("#cust_riskpreference").find('option[value="' + user.cust_riskpreference + '"]').prop("selected", 'selected');
        }

        if (user.regist_address) {
            var arr = user.regist_address.split('|');
            $("#s_province").find('option[value="' + arr[0] + '"]').prop("selected", 'selected').trigger("change");
            $("#s_city").find('option[value="' + arr[1] + '"]').prop("selected", 'selected');
            $("#s_address").html(arr[2]);
        }

    })
});
