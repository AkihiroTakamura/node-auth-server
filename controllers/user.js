var User = require('../models/user');
var logger = require('../util/logger');
var errorHandler = require('../util/errorhandler');

exports.post = function(req, res, next) {

  if (!req.body.username) return next(new errorHandler.ParameterInvalidException(res.__('validate.require.name')));
  if (!req.body.fullName) return next(new errorHandler.ParameterInvalidException(res.__('validate.require.fullName')));
  if (!req.body.password) return next(new errorHandler.ParameterInvalidException(res.__('validate.require.password')));

  User.count({username: req.body.username}, function(err, count) {
    if (err) return next(new errorHandler.DatabaseQueryException(err));
    if (count > 0) return next(new errorHandler.ParameterInvalidException(res.__('validate.exist.already')));

    var user = new User({
      username: req.body.username,
      password: req.body.password,
      roles: req.body.roles,
      fullName: req.body.fullName,
      email: req.body.email,
      phone: req.body.phone
    });

    user.save(function(err) {
      if (err) return next(new errorHandler.DatabaseQueryException(err));

      res.json({
        message: res.__('dsp.success'),
        data: user
      });
    });
  });

}

exports.put = function(req, res, next) {

  if (!req.body._id) return next(new errorHandler.ParameterInvalidException(res.__('validate.require._id')));

  User.findById(req.body._id, 'id username', function(err, user) {
    if (err) return next(new errorHandler.DatabaseQueryException(err));
    if (!user) return next(new errorHandler.ParameterInvalidException(res.__('validate.notfound.user')));

    if (req.body.fullName) user.fullName = req.body.fullName;
    if (req.body.password) user.password = req.body.password;
    if (req.body.email) user.email = req.body.email;
    if (req.body.phone) user.phone = req.body.phone;

    user.roles = req.body.roles;

    user.save(function(err) {
      if (err) return next(new errorHandler.DatabaseQueryException(err));

      res.json({
        message: res.__('dsp.success'),
        data: user
      });
    });
  });

}

exports.get = function(req, res, next) {

  var whereoption = req.user.is('admin') ? {} : {username: req.user.username};

  User.find(
    whereoption
  )
  .populate('roles')
  .populate('clients')
  .populate('tokens')
  .exec(function(err, users) {
    if (err) return next(new errorHandler.DatabaseQueryException(err));
    res.json(users);
  });

}

exports.delete = function(req, res, next) {
  User.findById(req.body._id, 'id username', function(err, user) {
    if (err) return next(new errorHandler.DatabaseQueryException(err));

    // validate for do not delete myself
    if (user && req.user.id && user._id == req.user.id) {
      return next(new errorHandler.ParameterInvalidException(res.__('validate.cantdeleteme')));
    }

    // validate role
    if (!req.user.is('admin')) return next(new errorHandler.ParameterInvalidException(res.__('validate.permission.nothave')));

    user.remove(function(err, user) {
      if (err) return next(new errorHandler.DatabaseQueryException(err));

      res.json({
        message: res.__('dsp.success'),
        data: user
      });
    });


  });
}
