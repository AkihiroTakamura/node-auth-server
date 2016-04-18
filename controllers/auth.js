var errorHandler = require('../util/errorhandler');
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
var passwordValidate = require('../util/passwordValidate');

// =======================
// User Authentification(Basic)
// no use now
// =======================
passport.use(new BasicStrategy(
  function(username, password, callback) {
    User.findOne({username: username}, function(err, user) {
      if (err) return callback(new errorHandler.DatabaseQueryException(" error : user find : [", err ,"]"));

      if (!user) {
        logger.system.info(" can't find user from database : username: [", username ,"]");
        return callback(null, false, {message: i18n.__('validate.notfound.user')});
      }

      passwordValidate.isValid(username, password, 'login', function(err) {
        if (err) return callback(null, false, new errorHandler.ParameterInvalidException(err.message));

        user.verifyPassword(password, function(err, isMatch) {
          if (err) return callback(new errorHandler.DatabaseQueryException(" error : user verifyPassword : [", err ,"]"));

          if (!isMatch) {
            logger.system.info(" password verify failed : password: [", password ,"]");
            return callback(null, false, {message: i18n.__('validate.invalid.password')});
          }

          return callback(null, user);
        });

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
      if (err) return callback(new errorHandler.DatabaseQueryException(" error : user find : [", err ,"]"));

      if (!user) {
        logger.system.info(" can't find user from database : username: [", username ,"]");
        return callback(null, false, {message: i18n.__('validate.notfound.user')});
      }

      passwordValidate.isValid(username, password, 'login', function(err) {
        if (err) return callback(null, false, new errorHandler.ParameterInvalidException(err.message));

        user.verifyPassword(password, function(err, isMatch) {
          if (err) return callback(new errorHandler.DatabaseQueryException(" error : user verifyPassword : [", err ,"]"));

          if (!isMatch) {
            logger.system.info(" password verify failed : password: [", password ,"]");
            return callback(null, false, {message: i18n.__('validate.invalid.password')});
          }

          return callback(null, user);
        });

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
      if (err) return callback(new errorHandler.DatabaseQueryException(" error : client-basic : [", err ,"]"));

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
      if (err) return callback(new errorHandler.DatabaseQueryException(" error : client-password : [", err ,"]"));

      if (!client || client.secret !== clientSecret) {
        logger.system.info(" client_id and client_secret verify failed : client_id: [", clientId ,"] client_secret: [", clientSecret ,"]");
        return callback(null, false);
      }

      return callback(null, client);
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
      if (err) return callback(new errorHandler.DatabaseQueryException(" error : deserializeUser : user find : [", err ,"]"));

      if (!user || user == null) return callback(new Error(i18n.__('exception.deserialize.user')));

      user.password = undefined;
      callback(null, user);
  });
});

exports.isUserAuthentiacted = passport.authenticate('local', {session: true});
exports.isClientAuthenticated = passport.authenticate('client-basic', {session: false});
exports.isClientPasswordAuthenticated = passport.authenticate(['client-password'], {session: false});

exports.isSessionAuthenticated = function(req, res, callback) {
  if (!req.user) {
    callback(new errorHandler.UnAuthorizedException(i18n.__('dsp.notlogined')));
  }
  callback();
}
