var passport = require('passport');
var url = require('url');
var oauth2orize = require('oauth2orize');
var server = oauth2orize.createServer();

var Client = require('../models/client');
var Token = require('../models/token');
var Code = require('../models/code');

var uid = require('../util/uid').uid;
var config = require('config');

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
server.grant(oauth2orize.grant.code({
  scopeSeparator: [' ', ',']
},
function(client, redirectUri, user, ares, callback) {
  var code = new Code({
    code: uid(16),
    clientId: client._id,
    redirectUri: redirectUri,
    userId: user._id,
    scope: ares.scope
  });
  code.save(function(err) {
    if (err) return callback(err);

    callback(null, code.code);
  });
}));

// Exchange authorization codes for access token
server.exchange(oauth2orize.exchange.code(function(client, code, redirectUri, callback) {
  Code.findOne({code: code}, function (err, authCode) {
    if (err) return callback(err);

    // validation
    if (authCode === undefined || authCode === null) return callback(null, false);

    if (client._id.toString() !== authCode.clientId) return callback(null, false);

    // Delete auth code now thai is has been used
    authCode.remove(function(err) {
      if (err) return callback(err);

      // create and send AccessToken
      var token = new Token({
        accesstoken: uid(256),
        clientId: authCode.clientId,
        userId: authCode.userId,
        expirationDate: new Date(new Date().getTime() + (config.token.expiresIn * 1000)),
        scope: authCode.scope
      });

      token.save(function(err) {
        if (err) return callback(err);
        callback(null, token, {expires_in: config.token.expiresIn});
      });

    });

  });

}));

// User authorization endpoint
exports.authorization = [
  // OAuth Client認証 -> clietid, redirectUriのチェック
  server.authorization(function(clientId, redirectUri, callback) {
    Client.findOne({id: clientId}, function(err, client) {
      if (err) return callback(err);

      if (!client) return callback(new Error("There is no client with the client_id you supplied"));

      // validate redirectUri -> only host name
      var match = false;
      var uri = url.parse(redirectUri || '');
      if (uri.host == client.domain || (uri.protocol == client.domain && uri.protocol != 'http' && uri.protocol != 'https')) {
        match = true;
      }
      if (match && redirectUri && redirectUri.length > 0) {
        return callback(null, client, redirectUri);
      } else {
        return callback(new Error("You must supply a redirect_uri that is a domain or url scheme owned by your client app."));
      }

    });
  }),
  function(req, res, next) {
    // ユーザ認証、セッションある場合req.userにセットされる
    // ここではユーザ未認証でもそのまま進める
    passport.authenticate('local', {session: true}, function(err, user, info) {
      return next();
    })(req, res, next);
  },
  function(req, res) {
    res.render('dialog', {
      transaction_id: req.oauth2.transactionID,
      currentURL: req.originalUrl,
      response_type: req.query.response_type,
      errors: req.flash('error'),
      scope: req.oauth2.req.scope,
      client: req.oauth2.client,
      user: req.user,
      map: config.scope.map
    });
  }
]

// User decision endpoint
exports.decision = [
  function(req, res, callback) {
    if (req.user) return callback();

    // 送信されたid/passのvalidateの為、passport.authenticateを実行
    passport.authenticate('local', {session: true}, function(err, user, info) {
      if (err) return callback(err);

      if (!user) {
        req.flash('info', info);
        req.flash('error', 'username or password was incorrect. Try again');
        res.redirect(req.body['auth_url']);
        return;
      }

      // validate ok なら自力でログイン
      // これをしないとserver.dicisionにuser情報が渡らなかった
      req.logIn(user, function(err) {
        if (err) return callback(err);
        return callback();
      });

    })(req, res, callback);

  },
  // passport.authenticate('local', {session: true}),
  server.decision(function(req, callback) {
    callback(null, {scope: req.oauth2.req.scope});
  })
]

// Application client token exchange endpoint
exports.token = [
  server.token(),
  server.errorHandler()
]

