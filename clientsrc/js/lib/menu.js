var $ = require('jquery');
var config = require('../config');
var user = require("./user");
var role = require("./role");
var client = require("./client");

var $dom = $('#template-menu');

module.exports = {
  init: init,
  show: show,
  hide: hide,
  destroy: destroy
}

function init() {
  return new Promise(function(resolve, reject) {
    Promise.resolve()
      .then(eventBind)
      .then(show)
      .then(resolve);
  });
}

function show() {
  return new Promise(function(resolve, reject) {
    $dom.fadeIn(config.fadeInterval, resolve);
  });
}

function hide() {
  return new Promise(function(resolve, reject) {
    $dom.fadeOut(config.fadeInterval, resolve);
  });
}

function destroy() {
  return new Promise(function(resolve, reject) {
    Promise.resolve()
      .then(hide)
      .then(eventUnbind)
      .then(resolve);
  });
}

function eventBind() {
  return new Promise(function(resolve, reject) {
    $dom.on('click', '.btn-start', onClickStart);

    resolve();
  });
}

function eventUnBind() {
  return new Promise(function(resolve, reject) {
    $dom.off('click', '.btn-start');

    resolve();
  });
}

function onClickStart(event) {
  switch($(this).data('kind')) {
    case 'user':
      hide()
        .then(user.init);
      break;
    case 'role':
      hide()
        .then(role.init);
      break;
    case 'client':
      hide()
        .then(client.init);
      break;
    default:
      break;
  }
}


