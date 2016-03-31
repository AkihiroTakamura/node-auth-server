var Role = require('../models/role');
var logger = require('../util/logger');
var errorHandler = require('../util/errorhandler');

exports.post = function(req, res) {

  if (!req.body.name) throw new errorHandler.ParameterInvalidException(res.__('validate.require.name'));
  if (!req.body.fullName) throw new errorHandler.ParameterInvalidException(res.__('validate.require.fullName'));

  Role.count({name: req.body.name}, function(err, count) {
    if (err) throw new errorHandler.DatabaseQueryException(err);
    if (count > 0) throw new errorHandler.ParameterInvalidException(res.__('validate.exist.already'));

    var role = new Role({
      name: req.body.name,
      fullName: req.body.fullName
    });

    role.save(function(err) {
      if (err) throw new errorHandler.DatabaseQueryException(err);
      res.json({
        message: res.__('dsp.success'),
        data: role
      });
    });

  });

}

exports.put = function(req, res) {

  if (!req.body._id) throw new errorHandler.ParameterInvalidException(res.__('validate.require._id'));
  if (!req.body.name) throw new errorHandler.ParameterInvalidException(res.__('validate.require.name'));
  if (!req.body.fullName) throw new errorHandler.ParameterInvalidException(res.__('validate.require.fullName'));

  Role.findById(req.body._id, function(err, role) {
    if (err) throw new errorHandler.DatabaseQueryException(err);
    if (!role) throw new errorHandler.ParameterInvalidException(res.__('validate.notfound.role'));

    Role.count({id: req.body.name}, function(err, count) {
      if (err) throw new errorHandler.DatabaseQueryException(err);
      if (req.body.name != role.name && count > 0) {
        throw new errorHandler.ParameterInvalidException(res.__('validate.exist.already'));
      }

      role.name = req.body.name;
      role.fullName = req.body.fullName;

      role.save(function(err) {
        if (err) throw new errorHandler.DatabaseQueryException(err);
        res.json({
          message: res.__('dsp.success'),
          data: role
        });
      });

    });

  });

}



exports.get = function(req, res) {
  Role.find({},{})
    .exec(function(err, roles) {
      if (err) throw new errorHandler.DatabaseQueryException(err);
      res.json(roles);
    })
  ;
}

exports.delete = function(req, res) {
  Role.findById(req.body._id, 'id name', function(err, role) {
    if (err) throw new errorHandler.DatabaseQueryException(err);

    // validate role
    if (!req.role.is('admin')) throw new errorHandler.ParameterInvalidException(res.__('validate.permission.nothave'));

    //TODO: validate users exist has target role

    role.remove(function(err, role) {
      if (err) throw new errorHandler.DatabaseQueryException(err);
      res.json({
        message: res.__('dsp.success'),
        data: role
      });
    });

  });
}
