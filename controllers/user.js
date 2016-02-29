var User = require('../models/user');
var logger = require('../util/logger');
var errorHandler = require('../util/errorhandler');

exports.post = function(req, res) {

  if (!req.body.username) throw new errorHandler.ParameterInvalidException(res.__('validate.require.name'));
  if (!req.body.password) throw new errorHandler.ParameterInvalidException(res.__('validate.require.password'));

  User.count({username: req.body.username}, function(err, count) {
    if (err) throw new errorHandler.DatabaseQueryException(err);
    if (count > 0) throw new errorHandler.ParameterInvalidException(res.__('validate.exist.already'));

    var user = new User({
      username: req.body.username,
      password: req.body.password,
      roles: req.body.roles
    });

    user.save(function(err) {
      if (err) throw new errorHandler.DatabaseQueryException(err);

      res.json({
        message: res.__('dsp.success'),
        data: user
      });
    });
  });

}

exports.put = function(req, res) {

  if (!req.body._id) throw new errorHandler.ParameterInvalidException(res.__('validate.require._id'));

  User.findById(req.body._id, 'id username', function(err, user) {
    if (err) throw new errorHandler.DatabaseQueryException(err);
    if (!user) throw new errorHandler.ParameterInvalidException(res.__('validate.notfound.user'));

    if (req.body.password) {
      user.password = req.body.password;
    }
    user.roles = req.body.roles;

    user.save(function(err) {
      if (err) throw new errorHandler.DatabaseQueryException(err);

      res.json({
        message: res.__('dsp.success'),
        data: user
      });
    });
  });

}

exports.get = function(req, res) {

  var whereoption = req.user.is('admin') ? {} : {username: req.user.username};

  User.find(
    whereoption,
    {username: 1, roles: 2, clients: 3, tokens: 4}
  )
  .populate('roles')
  .populate('clients')
  .populate('tokens')
  .exec(function(err, users) {
    if (err) throw new errorHandler.DatabaseQueryException(err);
    res.json(users);
  });

}

exports.delete = function(req, res) {
  User.findById(req.body._id, 'id username', function(err, user) {
    if (err) throw new errorHandler.DatabaseQueryException(err);

    // validate for do not delete myself
    if (user && req.user.id && user._id == req.user.id) {
      throw new errorHandler.ParameterInvalidException(res.__('validate.cantdeleteme'));
    }

    // validate role
    if (!req.user.is('admin')) throw new errorHandler.ParameterInvalidException(res.__('validate.permission.nothave'));

    user.remove(function(err, user) {
      if (err) throw new errorHandler.DatabaseQueryException(err);

      res.json({
        message: res.__('dsp.success'),
        data: user
      });
    });


  });
}
