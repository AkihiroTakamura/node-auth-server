var $ = require('jquery');

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
    if (window.confirm('are you sure?')) {
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
