var $ = require('jquery');
var config = require('../config');
var error = require('../error');
var notice = require('../notice');
var confirm = require('../confirm');
var $dom = $('#template-client');

module.exports = {
  init: init,
  show: show,
  hide: hide,
  destroy: destroy
}

function init() {
  return new Promise(function(resolve, reject) {
    Promise.resolve()
      .then(setTable)
      .then(refreshList)
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
    $dom.on('click', '.btn-client-add', function(e) {
      Promise.resolve()
        .then(initModal)
        .then(showModal)
      ;
    });

    $dom.find('#template-client-modal').on('show.bs.modal', function(e) {
    });

    $dom.find('#template-client-modal').on('hidden.bs.modal', function(e) {
    });

    $dom.on('click', '.btn-client-post', function(e) {
      var data = $dom.find('.template-client-form').serialize();
      Promise.resolve(data)
        .then(postData)
        .then(function() {
          return notice.success('client added!!');
        })
        .then(hideModal)
        .then(refreshList)
        .catch(showModalMessage)
      ;
    });

    $dom.on('click', '.btn-client-put', function(e) {
      var data = $dom.find('.template-client-form').serialize();
      Promise.resolve(data)
        .then(putData)
        .then(function() {
          return notice.success('client updated!!');
        })
        .then(hideModal)
        .then(refreshList)
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
            .then(deleteData)
            .then(refreshList)
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
    $dom.off('click', '.btn-client-add');
    resolve();
  });
}

function setTable() {
  return new Promise(function(resolve, reject) {

    var table = $('<table></table>');

    table
      .addClass('table table-striped table-bordered table-hover')
      .append(
        $('<thead></thead>')
          .append(
            $('<tr></tr>')
              .append($('<th></th>').text('userId'))
              .append($('<th></th>').text('application name'))
              .append($('<th></th>').text('application id'))
              .append($('<th></th>').text('application secret'))
              .append($('<th></th>').text('domain'))
              .append($('<th></th>').text('action'))
          )
      )
      .append(
        $('<tbody></tbody>')
      )
    ;

    $dom.find('.clientlist')
      .empty()
      .append(table);

    resolve();
  });

}

function setTableRow(json) {
  return new Promise(function(resolve, reject) {
    var $tbody = $dom.find('.clientlist').find('tbody');

    $tbody
      .empty();

    $.each(json, function(index, client) {
      var row = $('<tr></tr>');

      row
        .attr('data-json', JSON.stringify(client))
        .append($('<td></td>').text(client.user.username))
        .append($('<td></td>').text(client.name))
        .append($('<td></td>').text(client.id))
        .append($('<td></td>').text(client.secret))
        .append($('<td></td>').text(client.domain))
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

function getData() {
  return new Promise(function(resolve, reject) {
    $.ajax({
      type: 'get',
      url: '/local/api/clients',
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

function postData(data) {
  return new Promise(function(resolve, reject) {
    $.ajax({
      type: 'post',
      url: '/local/api/clients',
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

function putData(data) {
  return new Promise(function(resolve, reject) {
    $.ajax({
      type: 'put',
      url: '/local/api/clients',
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

function deleteData(param) {
  return new Promise(function(resolve, reject) {
    $.ajax({
      type: 'delete',
      url: '/local/api/clients',
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
    var $modal = $dom.find('#template-client-modal');
    if (param && param.data && param.data._id) {
      // put mode
      $modal.find('.btn-client-put').show();
      $modal.find('.btn-client-post').hide();
      $modal.find('[name=_id]').val(param.data._id);
      $modal.find('[name=id]').val(param.data.id);
      $modal.find('[name=domain]').val(param.data.domain);
      $modal.find('[name=name]').prop('disabled', true).val(param.data.name);

    } else {
      // post mode
      $modal.find('.btn-client-put').hide();
      $modal.find('.btn-client-post').show();
      $modal.find('[name=name]').prop('disabled', false);
    }

    $modal.modal({});
    resolve(param);
  });
}

function initModal(param) {
  return new Promise(function(resolve, reject) {
    var $modal = $dom.find('#template-client-modal');
    $modal.find('input').val('');
    $modal.find('.alert').remove();

    resolve(param);
  });
}

function hideModal(param) {
  return new Promise(function(resolve, reject) {
    var $modal = $dom.find('#template-client-modal');
    $modal.modal('hide');
    resolve(param);
  });
}

function showModalMessage(err) {
  return new Promise(function(resolve, reject) {
    var $modal = $dom.find('#template-client-modal');
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


function refreshList() {
  return new Promise(function(resolve, reject) {
    Promise.resolve()
      .then(getData)
      .then(setTableRow)
      .then(resolve)
      .catch(reject)
    ;
  });
}

