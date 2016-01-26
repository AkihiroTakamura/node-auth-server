var Client = require('../models/client');

exports.postClients = function(req, res) {
  var client = new Client();

  client.name = req.body.name;
  client.id = req.body.id;
  client.secret = req.body.secret;
  client.userId = req.user._id;
  client.domain = req.body.domain;

  // TODO: encrypt password
  client.save(function(err) {
    if (err) res.status(500).send(err);

    res.json({
      message: 'OAuth2 Client added',
      data: client
    });
  });
}

exports.getClients = function(req, res) {
  Client.find(
    {userId: req.user.id},
    function(err, clients) {
      if (err) res.status(500).send(err);
      res.json(clients);
    }
  );
}
