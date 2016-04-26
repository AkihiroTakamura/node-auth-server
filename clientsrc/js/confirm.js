var $ = require('jquery');
var i18n = require('./i18n');

module.exports = {
  alert: alert,
  confirm: confirm,
  dialog: dialog
}

function alert(param) {
  return new Promise(function(resolve, reject) {
    alert('not implement');
    resolve(param);
  });
}

function confirm(param) {
  return new Promise(function(resolve, reject) {
    if (window.confirm(i18n.get('dsp.confirm.execute'))) {
      resolve(param);
    } else {
      reject();
    }
  });
}

function dialog(param) {
  return new Promise(function(resolve, reject) {
    alert('not implement');
    resolve(param);
  });
}
