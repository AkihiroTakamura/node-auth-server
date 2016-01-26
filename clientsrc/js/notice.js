var $ = require('jquery');
var noty = require('noty');

module.exports = {
  success: success,
  error: error,
  alert: alert,
  warning: warning,
  information: information,
  notification: notification
}

function success(message) {
  return new Promise(function(resolve, reject) {
    noty({
      text: message,
      type: 'success'
    });
    resolve();
  });
}

function error(message) {
  return new Promise(function(resolve, reject) {
    noty({
      text: message,
      type: 'error'
    });
    resolve();
  });
}

function alert(message) {
  return new Promise(function(resolve, reject) {
    noty({
      text: message,
      type: 'alert'
    });
    resolve();
  });
}

function warning(message) {
  return new Promise(function(resolve, reject) {
    noty({
      text: message,
      type: 'warning'
    });
    resolve();
  });
}

function information(message) {
  return new Promise(function(resolve, reject) {
    noty({
      text: message,
      type: 'information'
    });
    resolve();
  });
}

function notification(message) {
  return new Promise(function(resolve, reject) {
    noty({
      text: message,
      type: 'notification'
    });
    resolve();
  });
}
