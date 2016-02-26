var logger = require('../util/logger');
var i18n = require('i18n');
var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var LocalStrategy = require('passport-local').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
var ClientPasswordStarategy = require('passport-oauth2-client-password').Strategy;
var User = require('../models/user');
var Client = require('../models/client');
var Token = require('../models/token');

// =======================
// User Authentification(Basic)
// no use now
// =======================
passport.use(new BasicStrategy(
  function(username, password, callback) {
    User.findOne({username: username}, function(err, user) {
      if (err) {
        logger.error.error(" error : user find : [", err ,"]");
        return callback(err);
      }

      if (!user) {
        logger.system.info(" can't find user from database : username: [", username ,"]");
        return callback(null, false, {message: i18n.__('validate.notfound.user')});
      }

      user.verifyPassword(password, function(err, isMatch) {
        if (err) {
          logger.error.error(" error : user verifyPassword : [", err ,"]");
          return callback(err);
        }

        if (!isMatch) {
          logger.system.info(" password verify failed : password: [", password ,"]");
          return callback(null, false, {message: i18n.__('validate.invalid.password')});
        }

        return callback(null, user);
      });
    });
  }
));

// =======================
// User Authentification(Local)
// =======================
passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
  },
  function(username, password, callback) {
    User.findOne({username: username}, function(err, user) {
      if (err) {
        logger.error.error(" error : user find : [", err ,"]");
        return callback(err);
      }

      if (!user) {
        logger.system.info(" can't find user from database : username: [", username ,"]");
        return callback(null, false, {message: i18n.__('validate.notfound.user')});
      }

      user.verifyPassword(password, function(err, isMatch) {
        if (err) {
          logger.error.error(" error : user verifyPassword : [", err ,"]");
          return callback(err);
        }

        if (!isMatch) {
          logger.system.info(" password verify failed : password: [", password ,"]");
          return callback(null, false, {message: i18n.__('validate.invalid.password')});
        }

        //TODO: Add other checks
        return callback(null, user);
      });
    });
  }
));

// =======================
// Oauth2 Basic Authentification
// =======================
passport.use('client-basic', new BasicStrategy(
  function(clientId, clientSecret, callback) {
    Client.findOne({id: clientId}, function(err, client) {
      if (err) {
        logger.error.error(" error : client-basic : [", err ,"]");
        return callback(err);
      }

      if (!client || client.secret !== clientSecret) {
        logger.system.info(" client_id and client_secret verify failed : client_id: [", clientId ,"] client_secret: [", clientSecret ,"]");
        return callback(null, false);
      }

      return callback(null, client);
    });
  }
));

// =======================
// Oauth2 Client-Password Authentification
// =======================
passport.use('client-password', new ClientPasswordStarategy(
  function(clientId, clientSecret, callback) {
    Client.findOne({id: clientId}, function(err, client) {
      if (err) {
        logger.error.error(" error : client-password : [", err ,"]");
        return callback(err);
      }

      if (!client || client.secret !== clientSecret) {
        logger.system.info(" client_id and client_secret verify failed : client_id: [", clientId ,"] client_secret: [", clientSecret ,"]");
        return callback(null, false);
      }

      return callback(null, client);
    });
  }
));

// =======================
// Oauth2 Code Flow
// =======================
passport.use(new BearerStrategy(
  function(accesstoken, callback) {
    Token.findOne({accesstoken: accesstoken}, function(err, token) {
      if (err) {
        logger.error.error(" error : bearer passport : [", err ,"]");
        return callback(err);
      }

      if (!token) {
        logger.system.info(" token not found from database : accesstoken: [", accesstoken ,"]");
        return callback(null, false);
      }

      // validate token expired
      if (!token.active) {
        logger.system.info(" token inActive : accesstoken: [", accesstoken ,"]");
        return callback(null, false);
      }

      User.findOne({ _id: token.userId}, function (err, user) {
        if (err) {
          logger.error.error(" error : bearer passport : user find : [", err ,"]");
          return callback(err);
        }

        if (!user) {
          logger.system.info(" user not found by accesstoken : accesstoken: [", accesstoken ,"]");
          return callback(null, false);
        }

        //TODO: set scope
        callback(null, user, {scope: '*'});
      });
    });
  }
));

passport.serializeUser(function(user, callback) {
  callback(null, user.id);
});

passport.deserializeUser(function(id, callback) {
  User.findOne({_id: id})
    .populate('roles')
    .populate('tokens')
    .exec(function(err, user) {
      if (err) return callback(err);
      if (!user || user == null) return callback(new Error(i18n.__('exception.deserialize.user')));

      user.password = undefined;
      callback(null, user);
  });
});

exports.isUserAuthentiacted = passport.authenticate('local', {session: true});
exports.isClientAuthenticated = passport.authenticate('client-basic', {session: false});
exports.isClientPasswordAuthenticated = passport.authenticate(['client-password'], {session: false});

exports.isSessionAuthenticated = function(req, res, callback) {
  if (!req.user) return res.status(401).json({message: i18n.__('dsp.notlogined')});
  callback();
}

exports.isBearerAuthentiacted = function(req, res, callback) {
  passport.authenticate('bearer', {session: false}, function(err, user, info) {
    if (err) return callback(err);

    if (!user) return res.status(401).json({message: i18n.__('validate.invalid.accesstoken')})

    req.logIn(user, function(err) {
      if (err) return callback(err);
      return callback();
    });

  })(req, res, callback);
}
