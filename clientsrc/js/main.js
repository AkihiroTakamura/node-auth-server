// =======================
// get instance we need
// =======================
$ = jQuery = require('jquery');
window.Tether = require('tether');
var bootstrap = require('bootstrap-sass');
var bootstrapSwitch = require('bootstrap-switch');
var domready = require('domready');
var noty = require('noty');
$.noty.defaults.layout = 'topRight';
$.noty.defaults.timeout = 3000;

// =======================
// css
// =======================
var cssify = require('cssify');
cssify.byUrl('//maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css');
var styleNode = require('../../public/css/style.css');

// =======================
// library
// =======================
var config = require('config');
var error = require('./error');
var navbar = require('./lib/navbar');
var menu = require('./lib/menu');
var changePassword = require('./lib/changePassword');
var i18n = require('./i18n');

// =======================
// jQuery setting
// =======================
$.ajaxSetup({
  error: function(xhr) {
    if (xhr.status == 401) {
      throw new error.UnAuthorizedException();
    }
  }
})

// =======================
// global error catch handler
// =======================
window.onerror = function(msg, file, line, column, err){
  switch(err.name) {
    case 'unauthorizederror':
      location.href = '/login';
      break;
    default:
      break;
  }

}

// =======================
// entry point
// =======================
domready(function() {
  $("body").fadeIn(config.get('Client.fadeInterval'), function() {

    Promise.resolve()
      .then(i18n.init)
      .then(function() {
        return new Promise(function(resolve, reject) {
          if ($('body').find('nav').length != 0) {
            Promise.resolve()
              .then(navbar.init)
              .then(resolve)
            ;
            return;
          }
          resolve();
        });
      })
      .then(function() {
        return new Promise(function(resolve, reject) {
          if ($('body').find('#template-menu').length != 0) {
            Promise.resolve()
              .then(menu.show)
              .then(resolve)
            ;
            return;
          }
          resolve();
        });
      })
      .then(function() {
        return new Promise(function(resolve, reject) {
          if ($('body').find('#template-changePassword-modal').length != 0) {
            Promise.resolve()
              .then(changePassword.init)
              .then(resolve)
            ;
            return;
          }
          resolve();
        });
      })
    ;

  });
})
