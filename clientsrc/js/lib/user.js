var $ = require('jquery');
var config = require('config');
var error = require('../error');
var notice = require('../notice');
var confirm = require('../confirm');
var i18n = require('../i18n');
var $dom = $('#template-user');

module.exports = {
  show: show,
  hide: hide
}

function show() {
  return new Promise(function(resolve, reject) {
    Promise.resolve({})
      .then(setUserTable)
      .then(refreshUserList)
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

    $dom.find('#template-token-modal').on('hide.bs.modal', function(e) {
      $dom.find('[data-toggle="popover"]').popover('hide');
    });

    $dom.on('click', '.btn-user-post', function(e) {
      var param = {
        data: $dom.find('.template-user-form').serialize()
      };
      Promise.resolve(param)
        .then(postUser)
        .then(function(param) {
          notice.success('user added!!');
          return param;
        })
        .then(hideModal)
        .then(refreshUserList)
        .catch(showModalMessage)
      ;
    });

    $dom.on('click', '.btn-user-put', function(e) {
      var param = {
        data: $dom.find('.template-user-form').serialize()
      }
      Promise.resolve(param)
        .then(putUser)
        .then(function() {
          notice.success('user updated!!');
          return param;
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
        .then(function(param) {
          Promise.resolve(param)
            .then(deleteUsers)
            .then(refreshUserList)
            .catch(error.show)
          ;
        })
        .catch(function() {
          // cancel
        });
    });

    // check token button click event
    $dom.on('click', '.btn-token', function(e) {
      var data = JSON.parse($(e.target).closest('tr').attr('data-json'));
      Promise.resolve({tokens: data.tokens})
        .then(initTokenModal)
        .then(showTokenModal)
      ;
    });

    resolve();
  });
}

function eventUnBind() {
  return new Promise(function(resolve, reject) {
    $dom.off('click', '.btn-user-add');
    $dom.find('#template-user-modal').off('show.bs.modal');
    $dom.find('#template-user-modal').off('hidden.bs.modal');
    $dom.find('#template-token-modal').off('hide.bs.modal');
    $dom.off('click', '.btn-user-post')
    $dom.off('click', '.btn-user-put');
    $dom.off('click', '.btn-edit');
    $dom.off('click', '.btn-delete');
    $dom.off('click', '.btn-token');
    resolve();
  });
}

function setUserTable(param) {
  return new Promise(function(resolve, reject) {

    var table = $('<table></table>');

    table
      .addClass('table table-striped table-bordered table-hover')
      .append(
        $('<thead></thead>')
          .append(
            $('<tr></tr>')
              .append($('<th></th>').text('id').hide())
              .append($('<th></th>').text('username'))
              .append($('<th></th>').text('fullName'))
              .append($('<th></th>').text('roles'))
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

    resolve(param);
  });

}

function setUserTableRow(param) {
  return new Promise(function(resolve, reject) {
    var $tbody = $dom.find('.userlist').find('tbody');

    $tbody
      .empty();

    $.each(param.users, function(index, user) {
      var row = $('<tr></tr>');

      row
        .attr('data-json', JSON.stringify(user))
        .append($('<td></td>').text(user._id).hide())
        .append($('<td></td>').text(user.username))
        .append($('<td></td>').text(user.fullName))
        .append($('<td></td>').text(user.roles.map(function(elem){ return elem.name}).join(',')))
        .append($('<td></td>').append([
          $('<button></button>')
            .addClass('btn btn-primary btn-edit')
            .text('edit'),
          $('<span></span>').html('&nbsp'),
          $('<button></button>')
            .addClass('btn btn-primary btn-delete')
            .text('delete'),
          $('<span></span>').html('&nbsp'),
          $('<button></button>')
            .addClass('btn btn-primary btn-token')
            .text('check token')
        ]))
      ;

      $tbody
        .append(row);

    });

    resolve(param);

  });
}


function getUsers(param) {
  return new Promise(function(resolve, reject) {
    $.ajax({
      type: 'get',
      url: '/local/api/users',
      success: function(json) {
        param.users = json;
        resolve(param);
      },
      error: function(xhr) {
        if (xhr.status == 401) {
          throw new error.UnAuthorizedException();
        }
        reject(new error.AjaxException(xhr));
      }
    });
  });
}

function getRoles(param) {
  return new Promise(function(resolve, reject) {
    $.ajax({
      type: 'get',
      url: '/local/api/roles',
      success: function(json) {
        param.roles = json;
        resolve(param);
      },
      error: function(xhr) {
        if (xhr.status == 401) {
          throw new error.UnAuthorizedException();
        }
        reject(new error.AjaxException(xhr));
      }
    });
  });
}

function postUser(param) {
  return new Promise(function(resolve, reject) {
    $.ajax({
      type: 'post',
      url: '/local/api/users',
      data: param.data,
      success: function() {
        resolve(param);
      },
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

function putUser(param) {
  return new Promise(function(resolve, reject) {
    $.ajax({
      type: 'put',
      url: '/local/api/users',
      data: param.data,
      success: function() {
        resolve(param);
      },
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
      $modal.find('[name=fullName]').val(param.data.fullName);
      $modal.find('[name=email]').val(param.data.email);
      $modal.find('[name=phone]').val(param.data.phone);
      $.each($modal.find('[name=roles]').find('option'), function(index, option) {
        $.each(param.data.roles, function(index2, role) {
          if ($(option).val() == role._id) {
            $(option).attr('selected', 'selected');
          }
        });
      });

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

    var $roles = $modal.find('[name=roles]');

    Promise.resolve(param)
      .then(getRoles)
      .then(function(param) {
        $roles.empty();
        $.each(param.roles, function(index, role) {
          var option = $('<option></option>');
          option
            .attr('value', role._id)
            .addClass('list-group-item')
            .text(role.name)
          ;
          $roles.append(option);
        });
        return param;
      })
      .then(function(param) {
        resolve(param);
      })
    ;
  });
}

function showTokenModal(param) {
  return new Promise(function(resolve, reject) {
    var $modal = $dom.find('#template-token-modal');
    $modal.modal({});
    resolve(param);
  });
}

function initTokenModal(param) {
  return new Promise(function(resolve, reject) {
    var $modal = $dom.find('#template-token-modal');
    $modal.find('.alert').remove();
    $modal.find('.modal-body').empty();

    Promise.resolve(param)
      .then(function(param) {
        var $list = $('<div></div>')
        $list.addClass('list-group');

        $.each(param.tokens, function(index, token) {
          var $head = $('<a></a>');
          $head
            .addClass('list-group-item active')
            .text('id:' + token._id)
          ;
          $list.append($head);

          var $detail = $('<a></a>');
          $detail
            .addClass('list-group-item text ellipsis');

          $detail.text('scope: ' + token.scope);
          $list.append($detail.clone());
          $detail.text('expirationDate: ' + token.expirationDate);
          $list.append($detail.clone());
          $detail
            .text('accesstoken: ' + token.accesstoken)
            .attr('tabindex', '0')
            .attr('data-toggle', 'popover')
            .attr('title', 'accesstoken')
            .attr('data-content', token.accesstoken)
          ;
          $list.append($detail.clone());
          $detail
            .text('refreshtoken: ' + token.refreshtoken)
            .attr('tabindex', '0')
            .attr('data-toggle', 'popover')
            .attr('title', 'refreshtoken')
            .attr('data-content', token.refreshtoken)
          ;
          $list.append($detail.clone());

        });

        $modal.find('.modal-body').append($list);
        $modal.find('[data-toggle="popover"]').popover();
      })
      .then(function() {
        resolve(param);
      })
    ;
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


function refreshUserList(param) {
  return new Promise(function(resolve, reject) {
    Promise.resolve(param)
      .then(getUsers)
      .then(setUserTableRow)
      .then(resolve)
      .catch(reject)
    ;
  });
}


