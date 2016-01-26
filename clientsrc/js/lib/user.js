var $ = require('jquery');
var config = require('../config');
var error = require('../error');
var notice = require('../notice');
var confirm = require('../confirm');
var $dom = $('#template-user');

module.exports = {
  init: init,
  show: show,
  hide: hide,
  destroy: destroy
}

function init() {
  return new Promise(function(resolve, reject) {
    Promise.resolve()
      .then(setUserTable)
      .then(refreshUserList)
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
    $dom.on('click', '.btn-user-add', function(e) {
      Promise.resolve()
        .then(initModal)
        .then(showModal)
      ;
    });

    $dom.find('#template-user-modal').on('show.bs.modal', function(e) {
    });

    $dom.find('#template-user-modal').on('hidden.bs.modal', function(e) {
    });

    $dom.on('click', '.btn-user-post', function(e) {
      var data = $dom.find('.template-user-form').serialize();
      Promise.resolve(data)
        .then(postUser)
        .then(function() {
          return notice.success('user added!!');
        })
        .then(hideModal)
        .then(refreshUserList)
        .catch(showModalMessage)
      ;
    });

    $dom.on('click', '.btn-user-put', function(e) {
      var data = $dom.find('.template-user-form').serialize();
      Promise.resolve(data)
        .then(putUser)
        .then(function() {
          return notice.success('user updated!!');
        })
        .then(hideModal)
        .then(refreshUserList)
        .catch(showModalMessage)
      ;
    });


    $dom.on('click', '.btn-edit', function(e) {
      var data = JSON.parse($(e.target).closest('tr').attr('data-json'));
      Promise.resolve({data: data})
        .then(initModal)
        .then(showModal)
      ;
    });

    $dom.on('click', '.btn-delete', function(e) {
      var data = JSON.parse($(e.target).closest('tr').attr('data-json'));
      Promise.resolve({data: data})
        .then(confirm.confirm)
        .then(function(data) {
          Promise.resolve(data)
            .then(deleteUsers)
            .then(refreshUserList)
            .catch(error.show)
          ;
        })
        .catch(function() {
          // cancel
        });
    });

    resolve();
  });
}

function eventUnBind() {
  return new Promise(function(resolve, reject) {
    $dom.off('click', '.btn-user-add');
    resolve();
  });
}

function setUserTable() {
  return new Promise(function(resolve, reject) {

    var table = $('<table></table>');

    table
      .addClass('table table-striped table-bordered table-hover')
      .append(
        $('<thead></thead>')
          .append(
            $('<tr></tr>')
              .append($('<th></th>').text('id'))
              .append($('<th></th>').text('username'))
              .append($('<th></th>').text('action'))
          )
      )
      .append(
        $('<tbody></tbody>')
      )
    ;

    $dom.find('.userlist')
      .empty()
      .append(table);

    resolve();
  });

}

function setUserTableRow(json) {
  return new Promise(function(resolve, reject) {
    var $tbody = $dom.find('.userlist').find('tbody');

    $tbody
      .empty();

    $.each(json, function(index, user) {
      var row = $('<tr></tr>');

      row
        .attr('data-json', JSON.stringify(user))
        .append($('<td></td>').text(user._id))
        .append($('<td></td>').text(user.username))
        .append($('<td></td>').append([
          $('<button></button>')
            .addClass('btn btn-primary btn-edit')
            .text('edit'),
          $('<span></span>').html('&nbsp'),
          $('<button></button>')
            .addClass('btn btn-primary btn-delete')
            .text('delete')
        ]))
      ;

      $tbody
        .append(row);

    });

    resolve();

  });
}


function getUsers() {
  return new Promise(function(resolve, reject) {
    $.ajax({
      type: 'get',
      url: '/local/api/users',
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

function postUser(data) {
  return new Promise(function(resolve, reject) {
    $.ajax({
      type: 'post',
      url: '/local/api/users',
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

function putUser(data) {
  return new Promise(function(resolve, reject) {
    $.ajax({
      type: 'put',
      url: '/local/api/users',
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

function deleteUsers(param) {
  return new Promise(function(resolve, reject) {
    $.ajax({
      type: 'delete',
      url: '/local/api/users',
      data: param.data,
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


function showModal(param) {
  return new Promise(function(resolve, reject) {
    var $modal = $dom.find('#template-user-modal');
    if (param && param.data && param.data.username) {
      // put mode
      $modal.find('.btn-user-put').show();
      $modal.find('.btn-user-post').hide();
      $modal.find('[name=_id]').val(param.data._id);
      $modal.find('[name=username]').prop('disabled', true).val(param.data.username);
    } else {
      // post mode
      $modal.find('.btn-user-put').hide();
      $modal.find('.btn-user-post').show();
      $modal.find('[name=username]').prop('disabled', false);
    }

    $modal.modal({});
    resolve(param);
  });
}

function initModal(param) {
  return new Promise(function(resolve, reject) {
    var $modal = $dom.find('#template-user-modal');
    $modal.find('input').val('');
    $modal.find('.alert').remove();
    resolve(param);
  });
}

function hideModal(param) {
  return new Promise(function(resolve, reject) {
    var $modal = $dom.find('#template-user-modal');
    $modal.modal('hide');
    resolve(param);
  });
}

function showModalMessage(err) {
  return new Promise(function(resolve, reject) {
    var $modal = $dom.find('#template-user-modal');
    $modal.find('.alert').remove();

    var $alert = $('<div></div>');
    $alert
      .addClass('alert alert-warning')
      .attr('role', 'alert')
      .text(err.message)
    ;

    $modal.find('.modal-body').prepend($alert);

    resolve();
  });
}


function refreshUserList() {
  return new Promise(function(resolve, reject) {
    Promise.resolve()
      .then(getUsers)
      .then(setUserTableRow)
      .then(resolve)
      .catch(reject)
    ;
  });
}


