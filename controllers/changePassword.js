var User = require('../models/user');
var logger = require('../util/logger');
var errorHandler = require('../util/errorhandler');
var passwordValidate = require('../util/passwordValidate');
var i18n = require('i18n');
var Setting = require('../models/setting');

exports.put = function(req, res, next) {

  if (!req.body.username) return next(new errorHandler.ParameterInvalidException(i18n.__('validate.require.name')));
  if (!req.body.password) return next(new errorHandler.ParameterInvalidException(i18n.__('validate.require.password')));
  if (!req.body.newPassword) return next(new errorHandler.ParameterInvalidException(i18n.__('validate.require.newPassword')));
  if (!req.body.newPasswordAgain) return next(new errorHandler.ParameterInvalidException(i18n.__('validate.require.newPasswordAgain')));
  if (req.body.newPassword != req.body.newPasswordAgain)  return next(new errorHandler.ParameterInvalidException(i18n.__('validate.invalid.newPasswordAgain')));
  if (req.body.password == req.body.newPassword)  return next(new errorHandler.ParameterInvalidException(i18n.__('validate.invalid.samePassword')));

  User.findOne({username: req.body.username}, function(err, user) {
    if (err) return next(new errorHandler.DatabaseQueryException(err));
    if (!user) return next(new errorHandler.ParameterInvalidException(i18n.__('validate.notfound.user')));

    user.verifyPassword(req.body.password, function(err, isMatch) {
      if (err) return next(new errorHandler.DatabaseQueryException(" error : user verifyPassword : [", err ,"]"));
      if (!isMatch) return next(new errorHandler.ParameterInvalidException(i18n.__('validate.invalid.password')));

      passwordValidate.isValid(req.body.username, req.body.newPassword, 'passwordChange', function(err) {
        if (err) return next(new errorHandler.ParameterInvalidException(err.message));

        user.password = req.body.newPassword;

        user.save(function(err) {
          if (err) return next(new errorHandler.DatabaseQueryException(err));

          res.json({
            message: i18n.__('dsp.success'),
            data: user
          });
        });

      });

    });

  });

}
