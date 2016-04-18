var Setting = require('../models/setting');
var logger = require('../util/logger');
var errorHandler = require('../util/errorhandler');
var validator = require('validator');

exports.put = function(req, res, next) {

  if (!req.body._id) return next(new errorHandler.ParameterInvalidException(res.__('validate.require._id')));

  if (req.body.minLength && !validator.isInt(req.body.minLength))
    return next(new errorHandler.ParameterInvalidException(res.__('validate.validate.type.int') + res.__('dsp.control.setting.password.minLength.title')));
  if (req.body.maxLength && !validator.isInt(req.body.maxLength))
    return next(new errorHandler.ParameterInvalidException(res.__('validate.validate.type.int') + res.__('dsp.control.setting.password.maxLength.title')));
  if (req.body.lockoutCount && !validator.isInt(req.body.lockoutCount))
    return next(new errorHandler.ParameterInvalidException(res.__('validate.validate.type.int') + res.__('dsp.control.setting.password.lockoutCount.title')));
  if (req.body.lockoutReleaseInterval && !validator.isInt(req.body.lockoutCount))
    return next(new errorHandler.ParameterInvalidException(res.__('validate.validate.type.int') + res.__('dsp.control.setting.password.lockoutReleaseInterval.title')));
  if (req.body.reuseExpireCount && !validator.isInt(req.body.reuseExpireCount))
    return next(new errorHandler.ParameterInvalidException(res.__('validate.validate.type.int') + res.__('dsp.control.setting.password.reuseExpireCount.title')));
  if (req.body.expireDateCount && !validator.isInt(req.body.expireDateCount))
    return next(new errorHandler.ParameterInvalidException(res.__('validate.validate.type.int') + res.__('dsp.control.setting.password.expireDateCount.title')));

  Setting.findById(req.body._id, function(err, setting) {
    if (err) return next(new errorHandler.DatabaseQueryException(err));
    if (!setting) return next(new errorHandler.ParameterInvalidException(res.__('validate.notfound.setting')));

    if (req.body.minLength && req.body.maxLength) {
      if (parseInt(req.body.minLength) >= parseInt(req.body.maxLength))
        return next(new errorHandler.ParameterInvalidException(res.__('validate.invalid.compare')));
    } else {
      if (req.body.minLength && parseInt(req.body.minLength) >= setting.password.maxLength)
        return next(new errorHandler.ParameterInvalidException(res.__('validate.invalid.compare')));
      if (req.body.maxLength && parseInt(req.body.maxLength) < setting.password.minLength)
        return next(new errorHandler.ParameterInvalidException(res.__('validate.invalid.compare')));
    }

    if (req.body.minLength) setting.password.minLength = req.body.minLength;
    if (req.body.maxLength) setting.password.maxLength = req.body.maxLength;
    setting.password.enabledLockout = (req.body.enabledLockout && req.body.enabledLockout == 'on') ? true : false;
    if (req.body.lockoutCount) setting.password.lockoutCount = req.body.lockoutCount;
    setting.password.enabledLockoutRelease = (req.body.enabledLockoutRelease && req.body.enabledLockoutRelease == 'on') ? true : false;
    if (req.body.lockoutReleaseInterval) setting.password.lockoutReleaseInterval = req.body.lockoutReleaseInterval;
    setting.password.mustIncludeUpperCase = (req.body.mustIncludeUpperCase && req.body.mustIncludeUpperCase == 'on') ? true : false;
    setting.password.mustIncludeLowerCase = (req.body.mustIncludeLowerCase && req.body.mustIncludeLowerCase == 'on') ? true : false;
    setting.password.mustIncludeSymbolCase = (req.body.mustIncludeSymbolCase && req.body.mustIncludeSymbolCase == 'on') ? true : false;
    setting.password.mustIncludeNumberCase = (req.body.mustIncludeNumberCase && req.body.mustIncludeNumberCase == 'on') ? true : false;
    setting.password.mustExcludeId = (req.body.mustExcludeId && req.body.mustExcludeId == 'on') ? true : false;
    setting.password.disabledReuse = (req.body.disabledReuse && req.body.disabledReuse == 'on') ? true : false;
    if (req.body.reuseExpireCount) setting.password.reuseExpireCount = req.body.reuseExpireCount;
    if (req.body.expireDateCount) setting.password.expireDateCount = req.body.expireDateCount;
    setting.password.disabledMultipleUpdateSameday = (req.body.disabledMultipleUpdateSameday && req.body.disabledMultipleUpdateSameday == 'on') ? true : false;

    setting.save(function(err) {
      if (err) return next(new errorHandler.DatabaseQueryException(err));
      res.json({
        message: res.__('dsp.success'),
        data: setting
      });
    });

  });

}

exports.get = function(req, res, next) {

  Setting
    .find()
    .exec(function(err, settings) {
      if (err) return next(new errorHandler.DatabaseQueryException(err));
      res.json(settings);
    })
  ;
}

