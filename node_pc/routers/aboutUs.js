var express = require('express');
var _ = require('lodash');
var router = express.Router();

var resource = require('../models/resource');

router.get("/", function (req, res, next) {
  res.render("aboutUs/aboutUs");
})

router.get("/article", function (req, res, next) {
  var params = req.query;
  if(params.id){
    res.render("aboutUs/agreement"+params.id);
  }else{
    res.render("aboutUs/agreement1");
  }
});

module.exports = router;