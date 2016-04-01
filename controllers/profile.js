var User = require('../models/user');
var i18n = require('i18n');
var logger = require('../util/logger');
var errorHandler = require('../util/errorhandler');

exports.get = function(req, res, next) {

  if (!req.user) return next(new errorHandler.UnAuthorizedException(i18n.__('dsp.notlogined')));

  // define select columns from user
  var columns = {};
  var columns_id = 0;
  columns._id = ++columns_id;
  columns.username = ++columns_id;
  columns.roles = ++columns_id;
  columns.fullName = ++columns_id;
  if (hasScope(req.info.scope, 'email')) columns.email = ++columns_id;
  if (hasScope(req.info.scope, 'phone')) columns.phone = ++columns_id;

  var whereoption =  {username: req.user.username};

  User.findOne(
    whereoption,
    columns
  )
  .populate('roles')
  .exec(function(err, user) {
      if (err) return next(new errorHandler.DatabaseQueryException(err));

      var json = {};
      json.username = user.username;
      json.authorities = [];
      for (var i = 0; i < user.roles.length; i++) {
        json.authorities.push(user.roles[i].name);
      };
      json.userinfo = user;

      res.json(json);
  });

}


// find scope from scope string(expect comma separated)
function hasScope(scope, target) {
  if (!scope || !target) return false;

  var scopeArray = scope.split(',');

  for (var i = 0; i < scopeArray.length; i++) {
    if (scopeArray[i] == target) return true;
  }
  return false;
}

