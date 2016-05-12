var Role = require('../models/role');
var logger = require('../util/logger');
var config = require('config');
var errorHandler = require('../util/errorhandler');

exports.post = function(req, res, next) {

  if (!req.user.is(config.application.init.admin.role)) return next(new errorHandler.PermissionDeniedException(res.__('validate.permission.nothave')));
  if (!req.body.name) return next(new errorHandler.ParameterInvalidException(res.__('validate.require.name')));
  if (!req.body.fullName) return next(new errorHandler.ParameterInvalidException(res.__('validate.require.fullName')));

  Role.count({name: req.body.name}, function(err, count) {
    if (err) return next(new errorHandler.DatabaseQueryException(err));
    if (count > 0) return next(new errorHandler.ParameterInvalidException(res.__('validate.exist.already')));

    var role = new Role({
      name: req.body.name,
      fullName: req.body.fullName
    });

    role.save(function(err) {
      if (err) return next(new errorHandler.DatabaseQueryException(err));
      res.json({
        message: res.__('dsp.success'),
        data: role
      });
    });

  });

}

exports.put = function(req, res, next) {

  if (!req.user.is(config.application.init.admin.role)) return next(new errorHandler.PermissionDeniedException(res.__('validate.permission.nothave')));
  if (!req.body._id) return next(new errorHandler.ParameterInvalidException(res.__('validate.require._id')));
  if (!req.body.name) return next(new errorHandler.ParameterInvalidException(res.__('validate.require.name')));
  if (!req.body.fullName) return next(new errorHandler.ParameterInvalidException(res.__('validate.require.fullName')));

  Role.findById(req.body._id, function(err, role) {
    if (err) return next(new errorHandler.DatabaseQueryException(err));
    if (!role) return next(new errorHandler.ParameterInvalidException(res.__('validate.notfound.role')));

    Role.count({id: req.body.name}, function(err, count) {
      if (err) return next(new errorHandler.DatabaseQueryException(err));
      if (req.body.name != role.name && count > 0) {
        return next(new errorHandler.ParameterInvalidException(res.__('validate.exist.already')));
      }

      role.name = req.body.name;
      role.fullName = req.body.fullName;

      role.save(function(err) {
        if (err) return next(new errorHandler.DatabaseQueryException(err));
        res.json({
          message: res.__('dsp.success'),
          data: role
        });
      });

    });

  });

}


exports.get = function(req, res, next) {
  if (!req.user.is(config.application.init.admin.role)) return next(new errorHandler.PermissionDeniedException(res.__('validate.permission.nothave')));

  Role.find({},{})
    .exec(function(err, roles) {
      if (err) return next(new errorHandler.DatabaseQueryException(err));
      res.json(roles);
    })
  ;
}

exports.delete = function(req, res, next) {
  if (!req.user.is(config.application.init.admin.role)) return next(new errorHandler.PermissionDeniedException(res.__('validate.permission.nothave')));

  Role.findById(req.body._id, 'id name', function(err, role) {
    if (err) return next(new errorHandler.DatabaseQueryException(err));

    // validate role
    if (!req.role.is(config.application.init.admin.role)) return next(new errorHandler.ParameterInvalidException(res.__('validate.permission.nothave')));

    //TODO: validate users exist has target role

    role.remove(function(err, role) {
      if (err) return next(new errorHandler.DatabaseQueryException(err));
      res.json({
        message: res.__('dsp.success'),
        data: role
      });
    });

  });
}
