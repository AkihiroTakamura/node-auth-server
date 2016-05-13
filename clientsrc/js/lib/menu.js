var $ = require('jquery');
var config = require('config');
var error = require('../error');
var user = require("./user");
var role = require("./role");
var client = require("./client");
var setting = require("./setting");
var page = require('page');

var $dom = $('#template-menu');

module.exports = {
  show: show,
  hide: hide
}

function show() {
  return new Promise(function(resolve, reject) {
    Promise.resolve()
      .then(eventBind)
      .then(function() {
        $dom.fadeIn(config.get('Client.fadeInterval'), resolve);
      })
      .then(resolve);
  });
}

function hide() {
  return new Promise(function(resolve, reject) {
    Promise.resolve()
      .then(eventUnBind)
      .then(function() {
        $dom.fadeOut(config.get('Client.fadeInterval'), resolve);
      })
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
  page.redirect('/' + $(this).data('kind'));
}
