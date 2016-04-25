var $ = require('jquery');
var config = require('config');
var error = require('../error');
var notice = require('../notice');
var confirm = require('../confirm');
var $dom = $('#template-changePassword-modal');

module.exports = {
  init: init,
  destroy: destroy
}

function init() {
  return new Promise(function(resolve, reject) {
    Promise.resolve()
      .then(eventBind)
      .then(resolve)
      .catch(reject)
    ;
  });
}

function destroy() {
  return new Promise(function(resolve, reject) {
    Promise.resolve()
      .then(eventUnbind)
      .then(resolve);
  });
}

function eventBind() {
  return new Promise(function(resolve, reject) {
    $('body').on('click', '.btn-changePassword', function(e) {
      Promise.resolve()
        .then(initModal)
        .then(showModal)
      ;
    });

    $dom.on('show.bs.modal', function(e) {
    });

    $dom.on('hidden.bs.modal', function(e) {
    });

    $dom.on('click', '.btn-changePassword-post', function(e) {
      var data = $dom.find('.template-changePassword-form').serialize();
      Promise.resolve(data)
        .then(postData)
        .then(function() {
          return notice.success('password changed!!');
        })
        .then(hideModal)
        .catch(showModalMessage)
      ;
    });

    resolve();
  });
}

function eventUnBind() {
  return new Promise(function(resolve, reject) {
    $('body').off('click', '.btn-changePassword');
    $dom.off('show.bs.modal');
    $dom.off('hidden.bs.modal');
    $dom.off('click', '.btn-changePassword-post');
    resolve();
  });
}

function postData(data) {
  return new Promise(function(resolve, reject) {
    $.ajax({
      type: 'put',
      url: '/changePassword',
      data: data,
      success: resolve,
      error: function(xhr) {
        if (xhr.status == 400) {
          reject(new error.AjaxValidateException(xhr));
        }
        reject(new error.AjaxException(xhr));
      }
    });
  });
}

function showModal(param) {
  return new Promise(function(resolve, reject) {
    var $modal = $dom;
    $modal.modal({});
    resolve(param);
  });
}

function initModal(param) {
  return new Promise(function(resolve, reject) {
    var $modal = $dom
    $modal.find('input').val('');
    $modal.find('.alert').remove();
    resolve(param);
  });
}

function hideModal(param) {
  return new Promise(function(resolve, reject) {
    var $modal = $dom;
    $modal.modal('hide');
    resolve(param);
  });
}

function showModalMessage(err) {
  return new Promise(function(resolve, reject) {
    var $modal = $dom
    $modal.find('.alert').remove();

    var $alert = $('<div></div>');
    $alert
      .addClass('alert alert-warning')
      .attr('client', 'alert')
      .text(err.message)
    ;

    $modal.find('.modal-body').prepend($alert);

    resolve();
  });
}
