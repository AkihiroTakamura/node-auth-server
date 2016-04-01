var Client = require('../models/client');
var User = require('../models/user');
var logger = require('../util/logger');
var uid = require('../util/uid').uid;
var errorHandler = require('../util/errorhandler');

exports.post = function(req, res, next) {

  if (!req.body.name) return next(new errorHandler.ParameterInvalidException(res.__('validate.require.name')));
  if (!req.body.id) return next(new errorHandler.ParameterInvalidException(res.__('validate.require.id')));
  if (!req.body.domain) return next(new errorHandler.ParameterInvalidException(res.__('validate.require.domain')));

  Client.count({id: req.body.id}, function(err, count) {
    if (err) return next(new errorHandler.DatabaseQueryException(err));
    if (count > 0) return next(new errorHandler.ParameterInvalidException(res.__('validate.exist.already')));

    var client = new Client();

    client.id = req.body.id;
    client.secret = uid(32);
    client.name = req.body.name;
    client.userId = req.user._id;
    client.domain = req.body.domain;
    client.user = req.user._id;

    client.save(function(err) {
      if (err) return next(new errorHandler.DatabaseQueryException(err));

      User.findOne(
        {_id: req.user._id}
      )
      .populate('clients')
      .exec(function(err, user) {
        if (err) return next(new errorHandler.DatabaseQueryException(err));

        if (user.clients && user.clients instanceof Array) {
          user.clients.push(client._id);
        } else {
          user.clients = [client._id];
        };

        user.save(function(err) {
          if (err) return next(new errorHandler.DatabaseQueryException(err));
          res.json({
            message: res.__('dsp.success'),
            data: client
          });
        });

      });

    });

  });

}

exports.put = function(req, res, next) {

  if (!req.body._id) return next(new errorHandler.ParameterInvalidException(res.__('validate.require._id')));
  if (!req.body.id) return next(new errorHandler.ParameterInvalidException(res.__('validate.require.id')));
  if (!req.body.domain) return next(new errorHandler.ParameterInvalidException(res.__('validate.require.domain')));

  Client.findById(req.body._id, function(err, client) {
    if (err) return next(new errorHandler.DatabaseQueryException(err));
    if (!client) return next(new errorHandler.ParameterInvalidException(res.__('validate.notfound.client')));

    Client.count({id: req.body.id}, function(err, count) {
      if (err) return next(new errorHandler.DatabaseQueryException(err));
      if (req.body.id != client.id && count > 0) {
        return next(new errorHandler.ParameterInvalidException(res.__('validate.exist.already')));
      }

      if (req.body.id) {
        client.id = req.body.id;
      }
      if (req.body.domain) {
        client.domain = req.body.domain;
      }

      client.save(function(err) {
        if (err) return next(new errorHandler.DatabaseQueryException(err));
        res.json({
          message: res.__('dsp.success'),
          data: client
        });
      });

    });

  });

}

exports.get = function(req, res, next) {

  var whereoption = req.user.is('admin') ? {} : {userId: req.user.id};

  Client
    .find(whereoption)
    .populate({
      path: 'user',
      select: '-password -clients -roles'
    })
    .exec(function(err, clients) {
      if (err) return next(new errorHandler.DatabaseQueryException(err));
      res.json(clients);
    })
  ;
}

exports.delete = function(req, res, next) {
  Client.findById(req.body._id, function(err, client) {
    if (err) return next(new errorHandler.DatabaseQueryException(err));

    User.findOne(
      {_id: req.user._id}
    )
    .populate('clients')
    .exec(function(err, user) {
      if (err) return next(new errorHandler.DatabaseQueryException(err));

      if (user.clients && user.clients instanceof Array) {
        var target = client._id;
        user.clients = user.clients.filter(function(v) {
          return v._id.id != target.id;
        });
      };

      user.save(function(err) {
        if (err) return next(new errorHandler.DatabaseQueryException(err));

        client.remove(function(err, client) {
          if (err) return next(new errorHandler.DatabaseQueryException(err));

          res.json({
            message: res.__('dsp.success'),
            data: client
          });
        });

      });

    });

  });
}

