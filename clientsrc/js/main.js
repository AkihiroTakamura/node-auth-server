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
var page = require('page');

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
var i18n = require('./i18n');
var router = require('./router');

// =======================
// Controller
// =======================
var navbar = require('./lib/navbar');

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
      .then(router.init)
      .then(navbar.init)
    ;

  });
})
