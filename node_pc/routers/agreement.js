var express = require('express');
var _ = require('lodash');
var router = express.Router();

var resource = require('../models/resource');

var checkLogin = require('../middlewares/check').checkLogin;

router.get("/agreement1", function(req, res, next) {
    res.render("agreement/agreement1");
})

router.get("/agreement2", function(req, res, next) {
    res.render("agreement/agreement2");
})

router.get("/agreement3", function(req, res, next) {
    res.render("agreement/agreement3");
})

module.exports = router;