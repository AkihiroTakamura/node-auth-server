var Role = require('../models/role');
var logger = require('../util/logger');
var errorHandler = require('../util/errorhandler');

exports.post = function(req, res) {

  if (!req.body.name) throw new errorHandler.ParameterInvalidException(res.__('validate.require.name'));

  Role.count({name: req.body.name}, function(err, count) {
    if (err) throw new errorHandler.DatabaseQueryException(err);
    if (count > 0) throw new errorHandler.ParameterInvalidException(res.__('validate.exist.already'));

    var role = new Role({
      name: req.body.name
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

    // validate users exist has target role

    role.remove(function(err, role) {
      if (err) throw new errorHandler.DatabaseQueryException(err);
      res.json({
        message: res.__('dsp.success'),
        data: role
      });
    });

  });
}
