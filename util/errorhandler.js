var logger = require('./logger');

var AuthenticationException = function(message) {
  this.name = 'authenticationException';
  this.message = message;
}
AuthenticationException.prototype = new Error();
AuthenticationException.prototype.constructor = AuthenticationException;

var PermissionDeniedException = function(message) {
  this.name = 'permissionDeniedException';
  this.message = message;
}
PermissionDeniedException.prototype = new Error();
PermissionDeniedException.prototype.constructor = PermissionDeniedException;

var UnAuthorizedException = function(message) {
  this.name = 'unauthorizederror';
  this.message = message;
}
UnAuthorizedException.prototype = new Error();
UnAuthorizedException.prototype.constructor = UnAuthorizedException;

var DatabaseQueryException = function(message) {
  this.name = 'databaseQueryException';
  this.message = message;
}
DatabaseQueryException.prototype = new Error();
DatabaseQueryException.prototype.constructor = DatabaseQueryException;

var ParameterInvalidException = function(message) {
  this.name = 'parameterInvalidException';
  this.message = message;
}
ParameterInvalidException.prototype = new Error();
ParameterInvalidException.prototype.constructor = ParameterInvalidException;

function doError(err, req, res, next) {
  return new Promise(function(resolve, reject) {

    if (process.env.NODE_ENV !== 'development') {
      return res.status(500).send('something wrong');
    }

    var message = {
      name: err.name,
      message: err.message
    };

    if (err instanceof AuthenticationException) {
      logger.error.debug(message);
      return res.status(401).send(message);
    };
    if (err instanceof PermissionDeniedException) {
      logger.error.debug(message);
      return res.status(401).send(message);
    };
    if (err instanceof UnAuthorizedException) {
      logger.error.debug(message);
      return res.status(401).send(message);
    };
    if (err instanceof ParameterInvalidException) {
      logger.error.debug(message);
      return res.status(400).send(message);
    }
    if (err instanceof DatabaseQueryException) {
      logger.error.error(message);
      return res.status(500).send(err);
    };
    if (err instanceof Error){
      logger.error.error(message);
      logger.error.error(err);
      if (process.env.NODE_ENV === 'development') return res.status(500).send(err);
      return res.status(500).send('something wrong');
    };
    resolve();
  });
}

module.exports = {
  AuthenticationException: AuthenticationException,
  PermissionDeniedException: PermissionDeniedException,
  UnAuthorizedException: UnAuthorizedException,
  DatabaseQueryException:DatabaseQueryException,
  ParameterInvalidException:ParameterInvalidException,
  doError: doError
}
