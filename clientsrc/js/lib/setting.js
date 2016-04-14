var $ = require('jquery');
var config = require('../config');
var error = require('../error');
var notice = require('../notice');
var confirm = require('../confirm');
var $dom = $('#template-setting');

module.exports = {
  init: init,
  show: show,
  hide: hide,
  destroy: destroy
}

function init() {
  return new Promise(function(resolve, reject) {
    Promise.resolve()
      .then(styleSetup)
      .then(getData)
      .then(setForm)
      .then(show)
      .then(eventBind)
      .then(resolve)
      .catch(reject)
    ;
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
    $dom.on('change', 'input', onChange);
    $dom.on('switchChange.bootstrapSwitch', onChange);

    resolve();
  });
}

function eventUnBind() {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}

function onChange(e) {
  var data = $dom.find('form').serialize();
  Promise.resolve(data)
    .then(putData)
    .then(function() {
      return notice.success('setting updated!!');
    })
    .catch(function(err) {
      if (err.message)
        notice.error(err.message);
      else {
        notice.error(err);
      }
    })
  ;

}

function styleSetup() {
  return new Promise(function(resolve, reject) {
    $dom.find('.collapse').collapse();
    $dom.find('[type="checkbox"]').bootstrapSwitch();
    resolve();
  });
}

function setForm(json) {
  return new Promise(function(resolve, reject) {

    if (!json || !json instanceof Array || !json[0] || !json[0].password)
      reject(new error.UnexpectedDataException('unexpected json->' + json));

    $dom.find('#input-id').val(json[0]['_id']);

    Object.keys(json[0].password).forEach(function(key) {
      var value = json[0].password[key];

      if (typeof value == 'boolean') {
        //$dom.find('#input-' + key).prop('checked', true);
        if (value) {
          $dom.find('#input-' + key).bootstrapSwitch('state', true, true);
        } else {
          $dom.find('#input-' + key).bootstrapSwitch('state', false, false);
        }
      } else {
        $dom.find('#input-' + key).val(value);
      }

    });

    resolve();
  });

}

function getData() {
  return new Promise(function(resolve, reject) {
    $.ajax({
      type: 'get',
      url: '/local/api/setting',
      success: resolve,
      error: function(xhr) {
        if (xhr.status == 401) {
          throw new error.UnAuthorizedException();
        }
        reject(new error.AjaxException(xhr));
      }
    });
  });
}

function putData(data) {
  return new Promise(function(resolve, reject) {
    $.ajax({
      type: 'put',
      url: '/local/api/setting',
      data: data,
      success: resolve,
      error: function(xhr) {
        if (xhr.status == 401) {
          throw new error.UnAuthorizedException();
        }
        if (xhr.status == 400) {
          reject(new error.AjaxValidateException(xhr));
        }
        reject(new error.AjaxException(xhr));
      }
    });
  });
}
