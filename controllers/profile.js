var User = require('../models/user');
var i18n = require('i18n');
var logger = require('../util/logger');
var errorHandler = require('../util/errorhandler');
var permission = require('../util/permission');

exports.get = function(req, res, next) {

  if (!req.user) return next(new errorHandler.UnAuthorizedException(i18n.__('dsp.notlogined')));

  var whereoption =  {username: req.user.username};

  User.findOne(
    whereoption
  )
  .populate('roles')
  .exec(function(err, user) {
      if (err) return next(new errorHandler.DatabaseQueryException(err));

      var json = {};

      if (permission.hasScope(req, 'username')) json.username = user.username;
      if (permission.hasScope(req, 'role')) {
        if (user.roles) {
          json.authorities = [];
          for (var i = 0; i < user.roles.length; i++) {
            json.authorities.push(user.roles[i].name);
          };
        }
      }
      if (permission.hasScope(req, 'fullName')) json.fullName = user.fullName;
      if (permission.hasScope(req, 'email')) json.email = user.email;
      if (permission.hasScope(req, 'phone')) json.phone = user.phone;

      res.json(json);
  });

}
