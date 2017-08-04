/**
    通用转发接口
**/
var express = require('express');
var router = express.Router();

var _ = require('lodash');
var Promise = require("bluebird");
var request = require('request');
var resource = require('../models/resource');
// var constant = require('config-lite').constant;

/**
 * 同花顺公共转发请求方法
 * 返回promise 
 */
var convertBaseUrl = init_config.convertBaseUrl;//"http://101.37.36.226:9801/api";
// 路由转发
// 同花顺转发请求
function routeInterface(routeInterface) {
    return router.post(routeInterface, function (req, res, next) {
        var params = req.query;
        var allUrl = convertBaseUrl + routeInterface + '/' + params.interface;
        console.log('=====TTTTTTTTTTTTTTTTT', allUrl);
        request(allUrl, {},
            function (error, response, result) {
                if (!error && response.statusCode == 200) {
                    console.log(result);
                    res.json(result)
                } else if (error) {
                    res.json({
                        respHead: {
                            head_rtn_code: 'ERR000',
                            head_rtn_desc: error
                        }
                    })
                }
            })
    });
}
routeInterface('/Fund');
routeInterface('/fund');
routeInterface('/Chart');
routeInterface('/Manager');
// router.post('/Fund', function (req, res, next) {
//     var params = req.query;
//     console.log('=====TTTTTTTTTTTTTTTTT', params);
//     return new Promise(function (resolve, reject) {
//         request("http://101.37.36.226:9801/api/Fund/interduce/000216", {},
//             function (error, response, result) {
//                 if (!error && response.statusCode == 200) {
//                     resolve(
//                         res.json(response)
//                     )
//                 } else if (error) {
//                     reject(
//                         res.json({
//                             respHead: {
//                                 head_rtn_code: 'ERR000',
//                                 head_rtn_desc: error
//                             }
//                         })
//                     );
//                 }
//             })
//     })
// });

//短信验证码
router.post("/getCode", function (req, res, next) {
    var params = req.body;
    var requestParams = _.assign({
        head_tran_code: "P00002",
    }, params);
    resource.post(requestParams, req.session.keys).then(function (data) {
        res.json(data);
    }, function (error) {
        res.json({
            respHead: {
                head_rtn_code: 'ERR000',
                head_rtn_desc: error
            }
        });
    });
});
//短信验证码S
router.post("/getCodeS", function (req, res, next) {
    var params = req.body;
    var requestParams = _.assign({
        head_tran_code: "P00002S",
    }, params);
    resource.post(requestParams, req.session.keys).then(function (data) {
        res.json(data);
    }, function (error) {
        res.json({
            respHead: {
                head_rtn_code: 'ERR000',
                head_rtn_desc: error
            }
        });
    });
});

//获取图形验证码
router.post("/getImgCode", function (req, res, next) {
    var params = req.body;
    var requestParams = _.assign({
        head_tran_code: "P00003",
    }, params);
    resource.post(requestParams, req.session.keys).then(function (data) {
        res.json(data);
    }, function (error) {
        res.json({
            respHead: {
                head_rtn_code: 'ERR000',
                head_rtn_desc: error
            }
        });
    });
});

//获取邮箱验证码
router.post("/getEmailCode", function (req, res, next) {
    var params = req.body;
    var requestParams = _.assign({
        head_tran_code: "P00004",
    }, params);
    resource.post(requestParams, req.session.keys).then(function (data) {
        res.json(data);
    }, function (error) {
        res.json({
            respHead: {
                head_rtn_code: 'ERR000',
                head_rtn_desc: error
            }
        });
    });
});

//获取token
router.post("/getToke", function (req, res, next) {
    resource.post({
        head_tran_code: "P00001"
    }, req.session.keys).then(function (data) {
        res.json(data);
    }, function (error) {
        res.json({
            respHead: {
                head_rtn_code: 'ERR000',
                head_rtn_desc: error
            }
        });
    })
})

//获取随机数
router.post("/getRandom", function (req, res, next) {
    resource.post({
        head_tran_code: "P00005",
        channel_type: req.body.channel_type || "00"
    }, req.session.keys).then(function (data) {
        res.json(data);
    }, function (error) {
        res.json({
            respHead: {
                head_rtn_code: 'ERR000',
                head_rtn_desc: error
            }
        });
    })
})

//获取pc控件参数
router.post("/getPgeRZ", function (req, res, next) {
    resource.post({
        head_tran_code: "GetPgeRZ",
    }, req.session.keys).then(function (data) {
        res.json(data);
    }, function (error) {
        res.json({
            respHead: {
                head_rtn_code: 'ERR000',
                head_rtn_desc: error
            }
        });
    })
})
//获取提示信息
router.post("/riskWarnDetail", function (req, res, next) {
    resource.post({
        head_tran_code: "P00008",
        warn_code: req.body.warn_code
    }, req.session.keys).then(function (data) {
        res.json(data);
    }, function (error) {
        res.json({
            respHead: {
                head_rtn_code: 'ERR000',
                head_rtn_desc: error
            }
        });
    })
})

//获取公告信息
router.post("/getNotices", function (req, res, next) {
    console.log("session 控制弹框:", req.session.noticeshowed);
    if (req.session.noticeshowed) {
        return res.json({
            respHead: {
                head_rtn_code: 'ERR000',
                head_rtn_desc: "error"
            }
        });
    }
    resource.post({
        head_tran_code: "S40001",
        notice_type: "00",
        query_begin_line: "1",
        query_num: "1"
    }, req.session.keys).then(function (data) {
        var list = data.respBody.list || [];
        if (list.length > 0 && list[0].notice_serno) {
            resource.post({
                head_tran_code: "S40002",
                notice_serno: list[0].notice_serno
            }, req.session.keys).then(function (noticesDetail) {
                req.session.noticeshowed = true;
                console.log("session 控制弹框:", req.session.noticeshowed)
                res.json(noticesDetail);
            }, function (error) {
                res.json({
                    respHead: {
                        head_rtn_code: 'ERR000',
                        head_rtn_desc: error
                    }
                });
            })
        } else {
            req.session.noticeshowed = true;
            res.json({
                respHead: {
                    head_rtn_code: 'ERR000'
                }
            });
        }
    }, function (error) {
        res.json({
            respHead: {
                head_rtn_code: 'ERR000',
                head_rtn_desc: error
            }
        });
    })
})


// 搜索基金
router.post("/queryFund", function (req, res, next) {
    resource.post({
        head_tran_code: "F30017",
        code_or_name: req.body['code_or_name']
    }, req.session.keys).then(function (data) {
        res.json(data);
    }, function (error) {
        res.json({
            respHead: {
                head_rtn_code: 'ERR000',
                head_rtn_desc: error
            }
        });
    })
});
//产品名称下拉查询
router.post("/fundNameList", function (req, res, next) {
    resource.post({
        head_tran_code: "F30009",
        baby_code: req.body.baby_code ? req.body.baby_code : global.runtime_config.baby_code,
        query_type: req.body.query_type,
    }, req.session.keys).then(function (data) {
        res.json(data);
    }, function (error) {
        res.json({
            respHead: {
                head_rtn_code: 'ERR000',
                head_rtn_desc: error
            }
        });
    });
})

//h5转发
router.post("/wapApi/*", function (req, res, next) {
    var uri = req.path.replace("/wapApi", "");
    var url = init_config.httpUrl + uri;
    resource.syncReq(url, "POST", req.body, { sessionid: req.headers.sessionid }).then(function (data) {
        res.json(data);
    }, function (error) {
        if (error == "401") {
            return res.status(error).end();
        };
        res.json({
            respHead: {
                head_rtn_code: 'ERR000',
                head_rtn_desc: error
            }
        });
    });
});
//h5 同花顺转发
router.get("/thsApi/*", function (req, res, next) {
    var uri = req.path.replace("/thsApi", "");
    var url = convertBaseUrl + uri;
    request(url, null, function (error, response, result) {
        if (!error && response.statusCode == 200) {
            res.send(result);
        } else if (error) {
            res.json({
                respHead: {
                    head_rtn_code: 'ERR000',
                    head_rtn_desc: error
                }
            })
        }
    })
});

router.get("/thspdf/*", function(req, resp, next){
    var uri = req.path.replace("/thspdf", "");
    var url = "http://basic.10jqka.com.cn/api/pdf" + uri;
    console.log(url);
    request(url).pipe(resp);
})

module.exports = router;
