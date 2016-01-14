var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var LocalStrategy = require('passport-local').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
var User = require('../models/user');
var Client = require('../models/client');
var Token = require('../models/token');

// =======================
// User Authentification(Basic)
// =======================
passport.use(new BasicStrategy(
  function(username, password, callback) {
    User.findOne({username: username}, function(err, user) {
      if (err) return callback(err);

      if (!user) return callback(null, false);

      user.verifyPassword(password, function(err, isMatch) {
        if (err) return callback(err);

        if (!isMatch) return callback(null, false);

        return callback(null, user);
      });
    });
  }
));

// =======================
// User Authentification(Local)
// =======================
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'pass'
  },
  function(username, password, callback) {
    User.findOne({username: username}, function(err, user) {
      if (err) return callback(err);

      if (!user) return callback(null, false);

      user.verifyPassword(password, function(err, isMatch) {
        if (err) return callback(err);

        if (!isMatch) return callback(null, false);

        return callback(null, user);
      });
    });
  }
));

// =======================
// Oauth2 Basic Authentification
// =======================
passport.use('client-basic', new BasicStrategy(
  function(username, password, callback) {
    Client.findOne({id: username}, function(err, client) {
      if (err) return callback(err);

      // TODO: encrypt password
      if (!client || client.secret !== password) return callback(null, false);

      return callback(null, client);
    });
  }
));

// =======================
// Oauth2 Code Flow
// =======================
passport.use(new BearerStrategy(
  function(accessToken, callback) {
    Token.findOne({value: accessToken}, function(err, token) {
      if (err) return callback(err);

      if (!token) return callback(null, false);

      User.findOne({ _id: token.userId}, function (err, user) {
        if (err) return callback(err);

        if (!user) return callback(null, false);

        //TODO: set scope
        callback(null, user, {scope: '*'});
      });
    });
  }
));

exports.isAuthentiacted = passport.authenticate(['basic', 'local', 'bearer'], {session: false});
exports.isClientAuthenticated = passport.authenticate('client-basic', {session: false});
exports.isBearerAuthentiacted = passport.authenticate('bearer', {session: false});
