var $ = require('jquery');
var config = require('config');
var main = require('../main');
var menu = require('./menu');
var page = require('page');

var $dom = $('nav');

module.exports = {
  init: init,
  home: home
}

function init() {
  return new Promise(function(resolve, reject) {
    Promise.resolve()
      .then(eventBind)
      .then(resolve)
    ;
  });
}

function eventBind() {
  return new Promise(function(resolve, reject) {
    $dom.on('click', '.nav-link', onNavLink);
    resolve();
  });
}

function eventUnBind() {
  return new Promise(function(resolve, reject) {
    $dom.off('click', '.nav-link');

    resolve();
  });
}

function onNavLink(e) {
  switch($(this).data('href')) {
    case 'home':
      Promise.resolve()
        .then(home);
      break;
    default:
      break;
  }
}

function home() {
  return new Promise(function(resolve, reject) {
    page.redirect('/');
  });
}
