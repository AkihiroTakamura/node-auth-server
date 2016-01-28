var logger = require('../util/logger');
var passport = require('passport');
var config = require('config');
var User = require('../models/user');
var Role = require('../models/role');

exports.index = function(req, res) {
  Promise.resolve()
    .then(isExistRole)
    .then(addDefaultRole)
    .then(isExistUser)
    .then(addDefaultUser)
    .then(function() {
      res.render('index', {user: req.user, error: req.flash('error')});
    })
    .catch(function(err) {
      if (err) req.flash('error', err.message);
      res.render('index', {user: req.user, error: req.flash('error')});
    })
  ;
}

exports.loginForm = function(req, res) {
  res.render('login', {error: req.flash('error')});
}

exports.login = passport.authenticate('local', {
  successReturnToOrRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
});

exports.logout = function(req, res) {
  req.logout();
  if (req.query.next) {
    res.redirect(req.query.next);
  } else {
    res.redirect('/');
  }
}

exports.profile = function(req, res) {
  res.render('profile', {user: req.user});
}

function isExistRole() {
  return new Promise(function(resolve, reject) {
    Role.count({}, function(err, count) {
      if (err) reject(err);
      if (count > 0) reject();
      resolve();
    });
  });
}

function addDefaultRole() {
  return new Promise(function(resolve, reject) {
    var role = new Role({
      name: "admin"
    });
    role.save(function(err) {
      if (err) reject(err);
      resolve();
    })
  });
}

function isExistUser() {
  return new Promise(function(resolve, reject) {
    User.count({}, function(err, count) {
      if (err) reject(err);
      if (count > 0) reject();
      resolve();
    });
  });
}

function addDefaultUser() {
  return new Promise(function(resolve, reject) {
    Role.findOne({name: 'admin'}, function(err, role) {
      if (err) reject(err);
      if (!role) reject(new Error('admin role not found'));

      var user = new User({
        username: config.application.init.admin.username,
        password: config.application.init.admin.password,
        roles: [role._id]
      });

      user.save(function(err) {
        if (err) reject(err);
        resolve();
      });

    });

  });
}

