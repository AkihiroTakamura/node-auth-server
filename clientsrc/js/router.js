// =======================
// Require
// =======================
var page = require('page');
var config = require('config');
var error = require('./error');
var i18n = require('./i18n');

// =======================
// Controllers
// =======================
var controller = {
  navbar: require('./lib/navbar'),
  menu: require('./lib/menu'),
  profile: require('./lib/profile'),
  user: require("./lib/user"),
  role: require("./lib/role"),
  client: require("./lib/client"),
  setting: require("./lib/setting"),
  changePassword: require('./lib/changePassword')
}

// =======================
// Main
// =======================
module.exports = {
  init: init
}

// Routing Setup
// NOTE: HTML Anchor tag click -> event bind
//             to exclude link from page.js -> add not empty target attfibute like target='_self'
function init() {
  return new Promise(function(resolve, reject) {
    page.base('/');

    page('/', function(ctx) {
      Promise.resolve()
        .then(controller.menu.show)
      ;
    });
    page.exit('/', function(ctx, next) {
      Promise.resolve()
        .then(controller.menu.hide)
        .then(next)
      ;
    });

    page('login', function(ctx) {
      Promise.resolve()
        .then(controller.changePassword.init)
    });
    page.exit('login', function(ctx, next) {
      Promise.resolve()
        .then(controller.changePassword.destroy)
        .then(next)
      ;
    });
    page('api/oauth2/authorize', function(ctx) {
      Promise.resolve()
        .then(controller.changePassword.init)
    });
    page.exit('api/oauth2/authorize', function(ctx, next) {
      Promise.resolve()
        .then(controller.changePassword.destroy)
        .then(next)
      ;
    });

    page('profile', function(ctx) {
      Promise.resolve()
        .then(controller.profile.show)
      ;
    });
    page.exit('profile', function(ctx, next) {
      Promise.resolve()
        .then(controller.profile.hide)
        .then(next)
      ;
    });

    page('user', function(ctx) {
      Promise.resolve()
        .then(controller.user.show)
      ;
    });
    page.exit('user', function(ctx, next) {
      Promise.resolve()
        .then(controller.user.hide)
        .then(next)
      ;
    });

    page('role', function(ctx) {
      Promise.resolve()
        .then(controller.role.show)
      ;
    });
    page.exit('role', function(ctx, next) {
      Promise.resolve()
        .then(controller.role.hide)
        .then(next)
      ;
    });

    page('client', function(ctx) {
      Promise.resolve()
        .then(controller.client.show)
      ;
    });
    page.exit('client', function(ctx, next) {
      Promise.resolve()
        .then(controller.client.hide)
        .then(next)
      ;
    });

    page('setting', function(ctx) {
      Promise.resolve()
        .then(controller.setting.show)
      ;
    });
    page.exit('setting', function(ctx, next) {
      Promise.resolve()
        .then(controller.setting.hide)
        .then(next)
      ;
    });

    page();
    resolve();
  });
}

