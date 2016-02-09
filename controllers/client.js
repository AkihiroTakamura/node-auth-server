var Client = require('../models/client');
var User = require('../models/user');
var logger = require('../util/logger');
var uid = require('../util/uid').uid;

exports.post = function(req, res) {

  if (!req.body.name) return res.status(400).send({message: res.__('validate.require.name')});
  if (!req.body.id) return res.status(400).send({message: res.__('validate.require.id')});
  if (!req.body.domain) return res.status(400).send({message: res.__('validate.require.domain')});

  Client.count({id: req.body.id}, function(err, count) {
    if (err) return res.status(500).send(err);
    if (count > 0) return res.status(400).send({message: res.__('validate.exist.already')});

    var client = new Client();

    client.id = req.body.id;
    client.secret = uid(32);
    client.name = req.body.name;
    client.userId = req.user._id;
    client.domain = req.body.domain;
    client.user = req.user._id;

    client.save(function(err) {
      if (err) return res.status(500).send(err);

      User.findOne(
        {_id: req.user._id}
      )
      .populate('clients')
      .exec(function(err, user) {
        if (err) return res.status(500).send(err);

          if (user.clients && user.clients instanceof Array) {
            user.clients.push(client._id);
          } else {
            user.clients = [client._id];
          };

          user.save(function(err) {
            if (err) return res.status(500).send(err);
            res.json({
              message: res.__('dsp.success'),
              data: client
            });
          });

      });

    });

  });

}

exports.put = function(req, res) {

  if (!req.body._id) return res.status(400).send({message: res.__('validate.require._id')});
  if (!req.body.id) return res.status(400).send({message: res.__('validate.require.id')});
  if (!req.body.domain) return res.status(400).send({message: res.__('validate.require.domain')});

  Client.findById(req.body._id, function(err, client) {
    if (err) return res.status(500).send(err);
    if (!client) return res.status(400).send({message: res.__('validate.notfound.client')});

    Client.count({id: req.body.id}, function(err, count) {
      if (err) return res.status(500).send(err);
      if (req.body.id != client.id && count > 0) {
        return res.status(400).send({message: res.__('validate.exist.already')});
      }

      if (req.body.id) {
        client.id = req.body.id;
      }
      if (req.body.domain) {
        client.domain = req.body.domain;
      }

      client.save(function(err) {
        if (err) return res.status(500).send(err);
        res.json({
          message: res.__('dsp.success'),
          data: client
        });
      });

    });

  });

}

exports.get = function(req, res) {

  var whereoption = req.user.is('admin') ? {} : {userId: req.user.id};

  Client
    .find(whereoption)
    .populate({
      path: 'user',
      select: '-password -clients -roles'
    })
    .exec(function(err, clients) {
      if (err) res.status(500).send(err);
      res.json(clients);
    })
  ;
}

exports.delete = function(req, res) {
  Client.findById(req.body._id, function(err, client) {
    if (err) return res.status(500).send(err);

    User.findOne(
      {_id: req.user._id}
    )
    .populate('clients')
    .exec(function(err, user) {
      if (err) return res.status(500).send(err);

        if (user.clients && user.clients instanceof Array) {
          var target = client._id;
          user.clients = user.clients.filter(function(v) {
            return v._id.id != target.id;
          });
        };

        user.save(function(err) {
          if (err) return res.status(500).send(err);

          client.remove(function(err, client) {
            if (err) return res.status(500).send(err);

            res.json({
              message: res.__('dsp.success'),
              data: client
            });
          });

        });

    });

  });
}

