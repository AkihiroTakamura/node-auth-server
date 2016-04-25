var $ = require('jquery');
var config = require('config');
var error = require('../error');
var notice = require('../notice');
var confirm = require('../confirm');
var $dom = $('#template-role');

module.exports = {
  show: show,
  hide: hide
}

function show() {
  return new Promise(function(resolve, reject) {
    Promise.resolve()
      .then(setTable)
      .then(refreshList)
      .then(eventBind)
      .then(function() {
        $dom.fadeIn(config.get('Client.fadeInterval'), resolve);
      })
      .catch(reject)
    ;
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
    $dom.on('click', '.btn-role-add', function(e) {
      Promise.resolve()
        .then(initModal)
        .then(showModal)
      ;
    });

    $dom.find('#template-role-modal').on('show.bs.modal', function(e) {
    });

    $dom.find('#template-role-modal').on('hidden.bs.modal', function(e) {
    });

    $dom.on('click', '.btn-role-post', function(e) {
      var data = $dom.find('.template-role-form').serialize();
      Promise.resolve(data)
        .then(postData)
        .then(function() {
          return notice.success('role added!!');
        })
        .then(hideModal)
        .then(refreshList)
        .catch(showModalMessage)
      ;
    });

    $dom.on('click', '.btn-role-put', function(e) {
      // for getting serialized data, control abled for a moment
      $dom.find('[name=name]').prop('disabled', false);
      var data = $dom.find('.template-role-form').serialize();
      $dom.find('[name=name]').prop('disabled', true);

      Promise.resolve(data)
        .then(putData)
        .then(function() {
          return notice.success('role updated!!');
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
    $dom.off('click', '.btn-role-add');
    $dom.find('#template-role-modal').off('show.bs.modal');
    $dom.find('#template-role-modal').off('hidden.bs.modal');
    $dom.off('click', '.btn-role-post');
    $dom.off('click', '.btn-role-put');
    $dom.off('click', '.btn-edit');
    $dom.off('click', '.btn-delete');
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
              .append($('<th></th>').text('id'))
              .append($('<th></th>').text('name'))
              .append($('<th></th>').text('fullName'))
              .append($('<th></th>').text('action'))
          )
      )
      .append(
        $('<tbody></tbody>')
      )
    ;

    $dom.find('.rolelist')
      .empty()
      .append(table);

    resolve();
  });

}

function setTableRow(json) {
  return new Promise(function(resolve, reject) {
    var $tbody = $dom.find('.rolelist').find('tbody');

    $tbody
      .empty();

    $.each(json, function(index, role) {
      var row = $('<tr></tr>');

      row
        .attr('data-json', JSON.stringify(role))
        .append($('<td></td>').text(role._id))
        .append($('<td></td>').text(role.name))
        .append($('<td></td>').text(role.fullName))
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
      url: '/local/api/roles',
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
      url: '/local/api/roles',
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
      url: '/local/api/roles',
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
      url: '/local/api/roles',
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
    var $modal = $dom.find('#template-role-modal');

    if (param && param.data && param.data._id) {
      // put mode
      $modal.find('.btn-role-put').show();
      $modal.find('.btn-role-post').hide();
      $modal.find('[name=_id]').val(param.data._id);
      $modal.find('[name=name]').prop('disabled', true).val(param.data.name);
      $modal.find('[name=fullName]').val(param.data.fullName);

    } else {
      // post mode
      $modal.find('.btn-user-put').hide();
      $modal.find('.btn-user-post').show();
      $modal.find('[name=name]').prop('disabled', false);
    }

    $modal.modal({});
    resolve(param);
  });
}

function initModal(param) {
  return new Promise(function(resolve, reject) {
    var $modal = $dom.find('#template-role-modal');
    $modal.find('input').val('');
    $modal.find('.alert').remove();

    resolve(param);
  });
}

function hideModal(param) {
  return new Promise(function(resolve, reject) {
    var $modal = $dom.find('#template-role-modal');
    $modal.modal('hide');
    resolve(param);
  });
}

function showModalMessage(err) {
  return new Promise(function(resolve, reject) {
    var $modal = $dom.find('#template-role-modal');
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


