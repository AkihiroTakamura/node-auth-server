var $ = require('jquery');
var config = require('config');
var error = require('../error');

var $dom = $('#template-profile');

module.exports = {
  show: show,
  hide: hide
}

function show() {
  return new Promise(function(resolve, reject) {
    Promise.resolve()
      .then(function() {
        alert('profile desu');
      })
      .then(resolve);
  });
}

function hide() {
  return new Promise(function(resolve, reject) {
    Promise.resolve()
      .then(resolve)
    ;
  });
}
