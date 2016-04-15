var $ = require('jquery');
var config = require('../config');
var error = require('../error');
var user = require("./user");
var role = require("./role");
var client = require("./client");
var setting = require("./setting");
var controllers = [user, role, client, setting];

var $dom = $('#template-menu');

module.exports = {
  show: show,
  hide: hide,
  hideControls: hideControls
}

function show() {
  return new Promise(function(resolve, reject) {
    Promise.resolve()
      .then(hideControls)
      .then(eventBind)
      .then(function() {
        $dom.fadeIn(config.fadeInterval, resolve);
      })
      .then(resolve);
  });
}

function hide() {
  return new Promise(function(resolve, reject) {
    Promise.resolve()
      .then(eventUnBind)
      .then(function() {
        $dom.fadeOut(config.fadeInterval, resolve);
      })
      .then(resolve)
    ;
  });
}

function hideControls() {
  return new Promise(function(resolve, reject) {

    var promises = [];

    controllers.map(function(controller) {
      promises.push(controller.hide());
    });

    Promise.all(promises)
      .then(resolve)
      .catch(reject)
    ;

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
        .then(user.show)
        .catch(error.show)
      ;
      break;
    case 'role':
      hide()
        .then(role.show)
        .catch(error.show)
      ;
      break;
    case 'client':
      hide()
        .then(client.show)
        .catch(error.show)
      ;
      break;
    case 'setting':
      hide()
        .then(setting.show)
        .catch(error.show)
      ;
      break;
    default:
      break;
  }
}


