/**
 * Created by fusy on 2017/1/6.
 */
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var fs = require('fs');

var app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//解决跨域问题
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    if(req.method=="OPTIONS") res.sendStatus(200);/*让options请求快速返回*/
    else  next();
});

router.post("/mockData/*", function (req, res, next) {
	console.log("============请求参数==============");
	console.log(req.body);
	console.log(req.params);
	console.log("============ end ==============");
	var head_trans_code = req.body.reqHead.head_tran_code;
    fs.readFile((__dirname + '/mockData/' + head_trans_code + ".json"), function (err, data) {
        var parseData = JSON.parse(data);
        // console.log(parseData);
        res.json(parseData);
    });
});
app.use('/', router);
app.listen(30003, function () {
    console.log('listening on port 30003');
});