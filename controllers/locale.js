var logger = require('../util/logger');
var errorHandler = require('../util/errorhandler');
var validator = require('validator');
var i18n = require('i18n');

exports.get = function(req, res, next) {
  res.json(i18n.getCatalog(req));
}

