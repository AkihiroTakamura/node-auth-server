var User = require('../models/user');
var logger = require('../util/logger');
var errorHandler = require('../util/errorhandler');
var passwordValidate = require('../util/passwordValidate');
var i18n = require('i18n');
var Setting = require('../models/setting');
var History = require('../models/history');

exports.put = function(req, res, next) {

  if (!req.body.username) return next(new errorHandler.ParameterInvalidException(i18n.__('validate.require.name')));
  if (!req.body.password) return next(new errorHandler.ParameterInvalidException(i18n.__('validate.require.password')));
  if (!req.body.newPassword) return next(new errorHandler.ParameterInvalidException(i18n.__('validate.require.newPassword')));
  if (!req.body.newPasswordAgain) return next(new errorHandler.ParameterInvalidException(i18n.__('validate.require.newPasswordAgain')));
  if (req.body.newPassword != req.body.newPasswordAgain)  return next(new errorHandler.ParameterInvalidException(i18n.__('validate.invalid.newPasswordAgain')));
  if (req.body.password == req.body.newPassword)  return next(new errorHandler.ParameterInvalidException(i18n.__('validate.invalid.samePassword')));

  var param = {
    req: req
  }

  Promise.resolve(param)
    .then(getUser)
    .then(verifyPassword)
    .then(passwordValidation)
    .then(saveUser)
    .then(getHistory)
    .then(saveHistory)
    .then(function(param) {
      res.json({
        message: i18n.__('dsp.success'),
        data: param.user
      });
      next();
    })
    .catch(next)
  ;

}

function getUser(param) {
  return new Promise(function(resolve, reject) {
    User.findOne({username: param.req.body.username})
      .populate('roles')
      .exec(function(err, user) {
        if (err) return reject(err);
        if (!user) return reject(new errorHandler.ParameterInvalidException(i18n.__('validate.notfound.user')));

        if (user.is('admin')) return reject(new errorHandler.ParameterInvalidException(i18n.__('validate.password.adminChange')));

        param.user = user;
        resolve(param);
      }
    );
  });
}

function verifyPassword(param) {
  return new Promise(function(resolve, reject) {
    param.user.verifyPassword(param.req.body.password, function(err, isMatch) {
      if (err) return reject(err);
      if (!isMatch) return reject(new errorHandler.ParameterInvalidException(i18n.__('validate.invalid.password')));

      resolve(param);
    });
  });
}

function passwordValidation(param) {
  return new Promise(function(resolve, reject) {
      passwordValidate.isValid(param.req.body.username, param.req.body.newPassword, 'passwordChange', function(err) {
        if (err) return reject(new errorHandler.ParameterInvalidException(err.message));

        resolve(param);
      });
  });
}

function saveUser(param) {
  return new Promise(function(resolve, reject) {
    param.user.password = param.req.body.newPassword;

    param.user.save(function(err) {
      if (err) return reject(new errorHandler.DatabaseQueryException(err));
      resolve(param);
    });
  });
}

function getHistory(param) {
  return new Promise(function(resolve, reject) {
    History.findOne({username: param.req.body.username}, function(err, history) {
      if (err) return reject(err);

      if (!history || (history instanceof Array && history.length == 0)) {
        param.history = undefined;
      } else {
        param.history = history;
      }

      resolve(param);
    });
  });
}

function saveHistory(param) {
  return new Promise(function(resolve, reject) {
    if (!param.history) {
      var history = new History({
        username: param.req.body.username,
        passwordHistory: [{
          password: param.user.password,  // save new encrypted password
          createdAt: Date.now()
        }]
      });
      history.save(function(err) {
        if (err) return reject(err);
        param.history = history;
        return resolve(param);
      });
    } else {
      param.history.passwordHistory.push({
        password: param.user.password,  // save new encrypted password
        createdAt: Date.now()
      });
      param.history.save(function(err) {
        if (err) return reject(err);
        param.history = history;
        resolve(param);
      });
    }
  });
}
