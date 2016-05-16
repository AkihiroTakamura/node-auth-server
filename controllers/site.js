var logger = require('../util/logger');
var passport = require('passport');
var config = require('config');
var User = require('../models/user');
var Role = require('../models/role');
var Setting = require('../models/setting');

exports.index = function(req, res) {
  Promise.resolve()
    .then(function(resolve, reject) {
      Promise.resolve()
        .then(isExistSetting)
        .then(addDefaultSetting)
        .then(resolve)
        .catch(reject)
    })
    .then(function(resolve, reject) {
      Promise.resolve()
        .then(isExistRole)
        .then(addDefaultRole)
        .then(resolve)
        .catch(reject)
    })
    .then(function(resolve, reject) {
      Promise.resolve()
      .then(isExistUser)
      .then(addDefaultUser)
      .then(resolve)
      .catch(reject)
    })
    .then(function() {
      res.render('index', {user: req.user, config: config, error: req.flash('error')});
    })
    .catch(function(err) {
      if (err) req.flash('error', err.message);
      res.render('index', {user: req.user, config: config, error: req.flash('error')});
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
      name: config.application.init.admin.role,
      fullName: config.application.init.admin.roleFullName
    });
    role.save(function(err) {
      if (err) reject(err);
      logger.system.info("inserted default role.");
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
    Role.findOne({name: config.application.init.admin.role}, function(err, role) {
      if (err) reject(err);
      if (!role) reject(new Error('admin role not found'));

      var user = new User({
        username: config.application.init.admin.username,
        password: config.application.init.admin.password,
        fullName: config.application.init.admin.fullName,
        roles: [role._id]
      });

      user.save(function(err) {
        if (err) reject(err);
        logger.system.info("inserted default user.");
        resolve();
      });

    });

  });
}

function isExistSetting() {
  return new Promise(function(resolve, reject) {
    Setting.count({}, function(err, count) {
      if (err) reject(err);
      if (count > 0) reject();
      resolve();
    });
  });
}

function addDefaultSetting() {
  return new Promise(function(resolve, reject) {

    var setting = new Setting({
    });

    setting.save(function(err) {
      if (err) reject(err);
      logger.system.info("inserted default setting.");
      resolve();
    });

  });
}

