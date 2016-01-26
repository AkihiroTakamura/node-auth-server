var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var LocalStrategy = require('passport-local').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
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
    usernameField: 'username',
    passwordField: 'password'
  },
  function(username, password, callback) {
    User.findOne({username: username}, function(err, user) {
      if (err) return callback(err);

      if (!user) return callback(null, false, {message: 'user not found'});

      user.verifyPassword(password, function(err, isMatch) {
        if (err) return callback(err);

        if (!isMatch) return callback(null, false, {message: 'invalid password'});

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
  function(username, password, callback) {
    Client.findOne({id: username}, function(err, client) {
      if (err) return callback(err);

      if (!client || client.secret !== password) return callback(null, false);

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
      if (err) return callback(err);

      if (!token) return callback(null, false);

      // validate token expired
      if (!token.active) return callback(null, false);

      User.findOne({ _id: token.userId}, function (err, user) {
        if (err) return callback(err);

        if (!user) return callback(null, false);

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
  User.findById(id, function(err, user) {
    user.password = undefined;
    callback(err, err ? null : user);
  });
});

exports.isUserAuthentiacted = passport.authenticate('local', {session: true});
exports.isClientAuthenticated = passport.authenticate('client-basic', {session: false});

exports.isSessionAuthenticated = function(req, res, callback) {
  if (!req.user) return res.status(401).json({message: 'not logined'});
  callback();
}

exports.isBearerAuthentiacted = function(req, res, callback) {
  passport.authenticate('bearer', {session: false}, function(err, user, info) {
    if (err) return callback(err);

    if (!user) return res.status(401).json({message: "Access token invalid or expired"})

    req.logIn(user, function(err) {
      if (err) return callback(err);
      return callback();
    });

  })(req, res, callback);
}
