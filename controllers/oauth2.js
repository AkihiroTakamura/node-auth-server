var errorHandler = require('../util/errorhandler');
var logger = require('../util/logger');
var i18n = require('i18n');
var passport = require('passport');
var url = require('url');
var oauth2orize = require('oauth2orize');
var server = oauth2orize.createServer();

var Client = require('../models/client');
var Token = require('../models/token');
var Code = require('../models/code');
var User = require('../models/user');
var Role = require('../models/role');

var uid = require('../util/uid').uid;
var config = require('config');

// =======================
// Registers
// =======================
// Register serialiazation function
server.serializeClient(function(client, callback) {
  return callback(null, client._id);
});

// Register deserialization function
server.deserializeClient(function(id, callback) {
  Client.findOne({_id: id}, function (err, client) {
    if (err) return callback(new errorHandler.DatabaseQueryException(" error : deserializeClient : client find : [", err ,"]"));
    return callback(null, client);
  });
});

// Register authorization code grant flow
server.grant(oauth2orize.grant.code({
  scopeSeparator: [' ', ',']
},
function(client, redirectUri, user, ares, req, callback) {
  var code = new Code({
    code: uid(16),
    clientId: client._id,
    redirectUri: redirectUri,
    userId: user._id,
    scope: req.scope
  });

  logger.system.info("* Get grant code client[", client ,"] code[", code.code ,"] ares[", ares ,"] user[", user ,"]");

  code.save(function(err) {
    if (err) return callback(new errorHandler.DatabaseQueryException(err));
    callback(null, code.code);
  });
}));

// Exchange authorization codes for access token
server.exchange(oauth2orize.exchange.code(function(client, code, redirectUri, callback) {
  logger.system.info("* Exchange access token client[", client ,"] code[", code ,"] redirectUri[", redirectUri,"]");

  Code.findOne({code: code}, function (err, authCode) {
    if (err) return callback(new errorHandler.DatabaseQueryException(err));

    // validation
    if (authCode === undefined || authCode === null) return callback(null, false);

    // Delete auth code now thai is has been used
    authCode.remove(function(err) {
      if (err) return callback(err);

      issueToken({
        clientId: authCode.clientId,
        userId: authCode.userId,
        scope: authCode.scope
      }, function(err, accesstoken, extra_info, token) {
        if (err) return callback(err);
        callback(null, accesstoken, extra_info);
      });

    });

  });

}));

// Exchange refresh token for access token
server.exchange(oauth2orize.exchange.refreshToken(function(client, refreshtoken, scope, callback) {
  logger.system.info("* Exchange refresh token");

  Token.findOne({refreshtoken: refreshtoken}, function (err, token) {
    if (err) return callback(new errorHandler.DatabaseQueryException(err));

    logger.system.info("- refresh token valid");

    // access token update
    token.accesstoken = uid(256);
    token.expirationDate = new Date(new Date().getTime() + (config.token.expiresIn * 1000));

    token.save(function(err) {
      if (err) return callback(new errorHandler.DatabaseQueryException(err));
      logger.system.info("- token refreshed");

      var extra_info = {
        refresh_token: token.refreshtoken,
        client_id: token.clientId,
        user_id: token.userId,
        expiration_date: token.expirationDate,
        scope: token.scope,
        expires_in: config.token.expiresIn
      };

      callback(null, token.accesstoken, extra_info);
    });

  });

}));

// Exchange username/password to access token
// Premise: oauth client authorization / username/password authorization is finished
server.exchange(oauth2orize.exchange.password(function(client, username, password, scope, callback) {
  logger.system.info("* Exchange password-token");
  logger.system.debug('client:', client);
  logger.system.debug('username:', username);
  logger.system.debug('password:', password);
  logger.system.debug('scope:', scope);

  User.findOne({username: username}, function(err, user) {
    if (err) return callback(new errorHandler.DatabaseQueryException(err));
    if (!user) return callback(new Error('user is not found. username: ', username));

    user.verifyPassword(password, function(err, isMatch) {
      if (err) return callback(new errorHandler.DatabaseQueryException(" error : user verifyPassword : [", err ,"]"));

      if (!isMatch) {
        logger.system.info(" password verify failed : password: [", password ,"]");
        return callback(new Error('password is invalid'));
      }

      issueToken({
        clientId: client._id,
        userId: user._id,
        scope: scope
      }, function(err, accesstoken, extra_info, token) {
        if (err) return callback(err);
        callback(null, token);
      });

    });

  });

}));

// Exchange clientid/secret to access token
server.exchange(oauth2orize.exchange.clientCredentials(function(client, scope, callback) {
  logger.system.info("* Exchange client_credentials");
  logger.system.debug('client:', client);
  logger.system.debug('scope:', scope);

  if (!client) return callback(new Error('client is not found.'));

  issueToken({
    clientId: client._id,
    userId: client.userId,  // when client credentials -> role devendent with user who client owner
    scope: scope
  }, function(err, accesstoken, extra_info, token) {
    if (err) return callback(err);
    callback(null, token);
  });

}));


function issueToken(option, callback) {
  logger.system.debug("- issue token option:", option);

  Token.findOne(
    {
      clientId: option.clientId,
      userId: option.userId,
      scope: option.scope
    }, function (err, token) {
      if (err) return callback(new errorHandler.DatabaseQueryException(err));

      // if exist same token -> turn use token
      if (token) {
        token.accesstoken = uid(256);
        token.expirationDate = new Date(new Date().getTime() + (config.token.expiresIn * 1000));
        logger.system.info("* Turn use access token accesstoken[", token.accesstoken ,"] scope[", token.scope,"]");

        token.save(function(err) {
          if (err) return callback(new errorHandler.DatabaseQueryException(err));
          var extra_info = {
            refresh_token: token.refreshtoken,
            client_id: token.clientId,
            user_id: token.userId,
            expiration_date: token.expirationDate,
            scope: token.scope,
            expires_in: config.token.expiresIn
          };
          return callback(null, token.accesstoken, extra_info, token);
        });
      } else {
        // create and send AccessToken
        var token = new Token({
          accesstoken: uid(256),
          refreshtoken: uid(256),
          clientId: option.clientId,
          userId: option.userId,
          expirationDate: new Date(new Date().getTime() + (config.token.expiresIn * 1000)),
          scope: option.scope,
          user: option.userId
        });

        logger.system.info("* Create access token accesstoken[", token.accesstoken ,"] scope[", token.scope,"]");

        token.save(function(err) {
          if (err) return callback(new errorHandler.DatabaseQueryException(err));

          var extra_info = {
            refresh_token: token.refreshtoken,
            client_id: token.clientId,
            user_id: token.userId,
            expiration_date: token.expirationDate,
            scope: token.scope,
            expires_in: config.token.expiresIn
          };

          // relation token to User
          User.findById(option.userId, function(err, user) {
            if (err) return callback(new errorHandler.DatabaseQueryException(err));

            user.tokens.push(token);
            user.save(function(err) {
              if (err) return callback(new errorHandler.DatabaseQueryException(err));

              callback(null, token.accesstoken, extra_info, token);
            });
          });
        });
      };
  });
}

// =======================
// Endpoints
// =======================
// User authorization endpoint
exports.authorization = [
  //  user authorization
  function(req, res, next) {
    passport.authenticate('local', {session: true}, function(err, user, info) {
      if (err) return next(err);

      // not logined, but go next
      return next();
    })(req, res, next);
  },
  server.authorization(
    // authorization validate
    function (clientId, redirectUri, scope, type, done) {
      Client.findOne({id: clientId}, function(err, client) {
        if (err) return done(new errorHandler.DatabaseQueryException(err));
        if (!client) {
          logger.system.info(i18n.__('validate.oauth.notfound.client', clientId));
          return done(null, false);
        }

        //TODO: add scope validation

        // validate redirectUri -> only host name
        var match = false;
        var uri = url.parse(redirectUri || '');
        if (uri.hostname == client.domain || (uri.protocol == client.domain && uri.protocol != 'http' && uri.protocol != 'https')) {
          match = true;
        }
        if (match && redirectUri && redirectUri.length > 0) {
          return done(null, client, redirectUri);
        } else {
          logger.system.info(i18n.__('validate.oauth.notfound.redirecturi', redirectUri));
          return done(null, false);
        }
      });
    },
    // authorization immediate
    function(client, user, scope, type, req, done) {
      logger.system.debug('client: ', client);
      logger.system.debug('user: ', user);
      logger.system.debug('scope: ', scope);
      logger.system.debug('type: ', type);
      logger.system.debug('req: ', req);

      // not login -> go to dialog
      if (!user) return done(null, false);

      // scope is diffrent from issued token and request scope -> go to dialog
      // client is different from issued token and request client -> go to dialog
      // token is expired -> go to dialog
      var allowed = false;
      for (var i = 0; i < user.tokens.length; i++) {
        if (user.tokens[i].scope == scope &&
            user.tokens[i].clientId == client._id &&
            user.tokens[i].active
        ) {
          allowed = true;
          break;
        }
      }
      if (!allowed) return done(null, false);

      // already access allowed -> skip dialog (immediate mode)
      return done(null, true);

    }
  ),
  //TODO: immediate ok でもrenderしちゃってる
  function(req, res) {

      res.render('dialog', {
        transaction_id: req.oauth2.transactionID,
        currentURL: req.originalUrl,
        response_type: req.query.response_type,
        errors: req.flash('error'),
        scope: req.oauth2.req.scope,
        client: req.oauth2.client,
        user: req.user
      });
  }
];

// User decision endpoint
exports.decision = [
  function(req, res, callback) {

    // when logined -> go next
    if (req.user) return callback();

    // when not logined ->  id/pass authorization
    passport.authenticate('local', {session: true}, function(err, user, info) {
      if (err) return callback(err);

      if (!user) {
        req.flash('info', info);
        req.flash('error', info.message);
        res.redirect(req.body['auth_url']);
        return;
      }

      // when valid ->  login by myself.
      // for receive user object to server.dicision method
      req.logIn(user, function(err) {
        if (err) return callback(err);
        return callback();
      });

    })(req, res, callback);

  },
  server.decision(function(req, callback) {
    callback(null, {scope: req.oauth2.req.scope});
  })
]

// Application client token exchange endpoint
exports.token = [
  server.token(),
  server.errorHandler()
]

