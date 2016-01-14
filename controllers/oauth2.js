var oauth2orize = require('oauth2orize');
var server = oauth2orize.createServer();

var User = require('../models/user');
var Client = require('../models/client');
var Token = require('../models/token');
var Code = require('../models/code');

var uid = require('../util/uid').uid;

// Register serialiazation function
server.serializeClient(function(client, callback) {
  return callback(null, client._id);
});

// Register deserialization function
server.deserializeClient(function(id, callback) {
  Client.findOne({_id: id}, function (err, client) {
    if (err) return callback(err);

    return callback(null, client);
  });
});

// Register authorization code grant flow
server.grant(oauth2orize.grant.code(function(client, redirectUri, user, ares, callback) {
  var code = new Code({
    value: uid(16),
    clientId: client._id,
    redirectUri: redirectUri,
    userId: user._id
  });

  code.save(function(err) {
    if (err) return callback(err);

    callback(null, code.value);
  });
}));

// Exchange authorization codes for access token
server.exchange(oauth2orize.exchange.code(function(client, code, redirectUri, callback) {
  Code.findOne({value: code}, function (err, authCode) {
    if (err) return callback(err);

    // validation
    if (authCode === undefined || authCode === null) return callback(null, false);

    if (client._id.toString() !== authCode.clientId) return callback(null, false);

    if (redirectUri !== authCode.redirectUri) return callback(null, false);

    // Delete auth code now thai is has been used
    authCode.remove(function(err) {
      if (err) return callback(err);

      // create and send AccessToken
      var token = new Token({
        value: uid(256),
        clientId: authCode.clientId,
        userId: authCode.userId
      });

      token.save(function(err) {
        if (err) return callback(err);
        callback(null, token);
      });

    });

  });

}));

// User authorization endpoint
exports.authorization = [
  server.authorization(function(clientId, redirectUri, callback) {
    Client.findOne({id: clientId}, function(err, client) {
      if (err) return callback(err);
      return callback(null, client, redirectUri);
    });
  }),
  function(req, res) {
    res.render('dialog', {
      transactionID: req.oauth2.transactionID,
      user: req.user,
      client: req.oauth2.client
    });
  }
]

// User decision endpoint
exports.decision = [
  server.decision()
]

// Application client token exchange endpoint
exports.token = [
  server.token(),
  server.errorHandler()
]

