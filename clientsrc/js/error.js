var $ = require('jquery');
var config = require('./config');
var notice = require('./notice');

// =======================
// Custom Exception
// =======================
var AjaxValidateException = function(xhr) {
  this.name = 'ajaxvalidateexception';
  this.xhr = xhr;

  if (xhr && xhr.responseJSON) {
    var json = xhr.responseJSON;
    this.json = json;

    if (json.errmsg) this.message = json.errmsg;
    if (json.message) this.message = json.message;
  }
}
AjaxValidateException.prototype = new Error();
AjaxValidateException.prototype.constructor = AjaxValidateException;

var AjaxException = function(xhr) {
  this.name = 'ajaxexception';
  this.xhr = xhr;

  if (xhr && xhr.responseJSON) {
    var json = xhr.responseJSON;
    this.json = json;

    if (json.errmsg) this.message = json.errmsg;
    if (json.message) this.message = json.message;
    return;
  }

  if (xhr.state && (xhr.state() == 'rejected')) {
    this.message = 'failed connect server'
    return;
  }

}
AjaxException.prototype = new Error();
AjaxException.prototype.constructor = AjaxException;


var UnAuthorizedException = function(message) {
  this.name = 'unauthorizederror';
  this.message = message;
}
UnAuthorizedException.prototype = new Error();
UnAuthorizedException.prototype.constructor = UnAuthorizedException;

// =======================
// Error handling
// =======================
function show(err) {
  return new Promise(function(resolve, reject) {
    if (err instanceof AjaxValidateException) {
      return notice.warning(err.message);
    };
    if (err instanceof AjaxException) {
      return notice.error(err.message);
    };
    if (err instanceof Error){
      return notice.error(err.message);
    };
  });
}

module.exports = {
  UnAuthorizedException: UnAuthorizedException,
  AjaxValidateException: AjaxValidateException,
  AjaxException: AjaxException,
  show: show
}
