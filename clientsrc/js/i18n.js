var $ = require('jquery');
var error = require('./error');
var localKey = 'i18n';

module.exports = {
  init: init,
  get: get
}

// set locale data to param.i18n
function init() {
  return new Promise(function(resolve, reject) {

    Promise.resolve({})
      .then(geti18n)
      .then(setLocaleToStorage)
      .then(resolve)
      .catch(reject)
    ;

// commented out because localStrage don't refresh when locale json changed..
    // if (isExistLocal()) {
    //   Promise.resolve({})
    //     .then(getLocaleFromStorage)
    //     .then(resolve)
    //     .catch(reject)
    //   ;
    // } else {
    //   Promise.resolve({})
    //     .then(geti18n)
    //     .then(setLocaleToStorage)
    //     .then(resolve)
    //     .catch(reject)
    //   ;
    // }

  });
}

function get(keyword) {
  if (!canLocalStorage) return 'local storage can not use';
  if (!localStorage.getItem(localKey)) return 'i18n have to execute init method';

  var locale = JSON.parse(localStorage.getItem(localKey));
  return keywordSearch(locale, keyword.split('.'));
}

function keywordSearch(object, keywords) {
    if (object[keywords[0]] == undefined) return keywords[0];
    if (keywords.length === 1) return object[keywords[0]];
    return keywordSearch(object[keywords[0]], keywords.slice(1));
}

function canLocalStorage() {
  if ((!'localStorage' in window) || (window.localStorage == null)) return false;
  return true;
}

function isExistLocal() {
  if (!canLocalStorage()) return false;
  if (!localStorage.getItem(localKey)) return false;
  return true;
}

function geti18n(param) {
  return new Promise(function(resolve, reject) {

    $.ajax({
      type: 'get',
      url: '/local/api/i18n',
      success: function(json) {
        param.i18n = json;
        resolve(param)
      },
      error: function(xhr) {
        if (xhr.status == 401) {
          throw new error.UnAuthorizedException();
        }
        return reject(new error.AjaxException(xhr));
      }
    });

  });
}

function setLocaleToStorage(param) {
  return new Promise(function(resolve, reject) {
    if (!param || !param.i18n) return reject(param);
    if (!canLocalStorage()) return reject(param);

    localStorage.setItem(localKey, JSON.stringify(param.i18n));
    resolve(param);
  });
}

function getLocaleFromStorage(param) {
  return new Promise(function(resolve, reject) {
    param.i18n = JSON.parse(localStorage.getItem(localKey));
    resolve(param);
  });
}
