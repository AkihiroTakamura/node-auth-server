var logger = require('../util/logger');
var errorHandler = require('../util/errorhandler');
var i18n = require('i18n');
var User = require('../models/user');
var Setting = require('../models/setting');
var validator = require('validator');
var moment = require('moment');

exports.isValid = function(username, password, mode, next) {
  var param = {
    username: username,
    password: password,
    mode: mode,
    next: next
  }

  Promise.resolve(param)
    .then(getSetting)
    .then(getUser)
    .then(validate)
    .then(function() {
      return next();
    })
    .catch(function(err) {
      return next(err);
    })
  ;

};

function getSetting(param) {
  return new Promise(function(resolve, reject) {
    Setting.find().exec(function(err, settings) {
      if (err) return reject(err);

      param.setting = settings[0];
      resolve(param);
    });
  });
}

function getUser(param) {
  return new Promise(function(resolve, reject) {
    User.findOne({username: param.username}, function(err, user) {
      if (err) return reject(err);
      if (!user) return reject(new errorHandler.ParameterInvalidException(i18n.__('validate.notfound.user')));

      param.user = user;
      resolve(param);
    });
  });
}

function validate(param) {
  return new Promise(function(resolve, reject) {
    switch(param.mode) {
      case 'login':
        Promise.resolve(param)
          .then(validateExpired)
          .then(validateLock)
          .then(resolve)
          .catch(reject)
        ;
        break;
      case 'passwordChange':
        Promise.resolve(param)
          .then(validateLength)
          .then(validateUpperCase)
          .then(validateLowerCase)
          .then(validateSymbolCase)
          .then(validateNumberCase)
          .then(validateExludeId)
          .then(validateReuse)
          .then(validateMultipleUpdateSameday)
          .then(resolve)
          .catch(reject)
        ;
        break;
      default:
        return reject(new errorHandler.ParameterInvalidException('mode is invalid'));
    }

  });
}


function validateLength(param) {
  return new Promise(function(resolve, reject) {
    if (param.password.length < param.setting.password.minLength)
      return reject(new errorHandler.ParameterInvalidException(i18n.__('validate.password.minLength')));
    if (param.password.length > param.setting.password.maxLength)
      return reject(new errorHandler.ParameterInvalidException(i18n.__('validate.password.maxLength')));
    resolve(param);
  });
}

function validateUpperCase(param) {
  return new Promise(function(resolve, reject) {
    if (!param.setting.password.mustIncludeUpperCase) return resolve(param);

    if (!validator.matches(param.password, /[A-Z]/))
      return reject(new errorHandler.ParameterInvalidException(i18n.__('validate.password.mustIncludeUpperCase')));

    resolve(param);
  });
}

function validateLowerCase(param) {
  return new Promise(function(resolve, reject) {
    if (!param.setting.password.mustIncludeLowerCase) return resolve(param);

    if (!validator.matches(param.password, /[a-z]/))
      return reject(new errorHandler.ParameterInvalidException(i18n.__('validate.password.mustIncludeLowerCase')));

    resolve(param);
  });
}

function validateSymbolCase(param) {
  return new Promise(function(resolve, reject) {
    if (!param.setting.password.mustIncludeSymbolCase) return resolve(param);

    if (!validator.matches(param.password, /[\x21-\x2f\x3a-\x40\x5b-\x60\x7b-\x7e]/))
      return reject(new errorHandler.ParameterInvalidException(i18n.__('validate.password.mustIncludeSymbolCase')));

    resolve(param);
  });
}

function validateNumberCase(param) {
  return new Promise(function(resolve, reject) {
    if (!param.setting.password.mustIncludeNumberCase) return resolve(param);

    if (!validator.matches(param.password, /[0-9]/))
      return reject(new errorHandler.ParameterInvalidException(i18n.__('validate.password.mustIncludeNumberCase')));

    resolve(param);
  });
}

function validateExludeId(param) {
  return new Promise(function(resolve, reject) {
    if (!param.setting.password.mustExcludeId) return resolve(param);

    if (validator.contains(param.password, param.username))
      return reject(new errorHandler.ParameterInvalidException(i18n.__('validate.password.mustExcludeId')));

    resolve(param);
  });
}

function validateReuse(param) {
  return new Promise(function(resolve, reject) {
    if (!param.setting.password.disabledReuse) return resolve(param);

    //TODO: implement reuse validate
    resolve(param);
  });
}

function validateMultipleUpdateSameday(param) {
  return new Promise(function(resolve, reject) {
    if (!param.setting.password.disabledMultipleUpdateSameday) return resolve(param);

    //TODO: implement update sameday validate
    resolve(param);
  });
}

function validateExpired(param) {
  return new Promise(function(resolve, reject) {
    if (param.setting.password.expireDateCount < 0) return resolve(param);

    if (moment(param.user.passwordExpiredDate).isBefore(moment.now, 'day'))
      return reject(new errorHandler.ParameterInvalidException(i18n.__('validate.password.expired')));

    resolve(param);
  });
}

function validateLock(param) {
  return new Promise(function(resolve, reject) {
    if (param.user.isLock)
      return reject(new errorHandler.ParameterInvalidException(i18n.__('validate.password.lock')));

    resolve(param);
  });
}

