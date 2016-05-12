var errorHandler = require('../util/errorhandler');
var logger = require('../util/logger');
var i18n = require('i18n');
var passport = require('passport');
var BearerStrategy = require('passport-http-bearer').Strategy;
var User = require('../models/user');
var Token = require('../models/token');

// =======================
// Bearer Auth
// =======================
passport.use(new BearerStrategy(
  function(accesstoken, callback) {
    Token.findOne({accesstoken: accesstoken}, function(err, token) {
      if (err) return callback(new errorHandler.DatabaseQueryException(" error : bearer passport : [", err ,"]"));

      if (!token) {
        logger.system.info(" token not found from database : accesstoken: [", accesstoken ,"]");
        return callback(null, false);
      }

      // validate token expired
      if (!token.active) {
        logger.system.info(" token inActive : accesstoken: [", accesstoken ,"]");
        return callback(null, false);
      }

      User.findOne({ _id: token.userId}, function (err, user) {
        if (err) return callback(new errorHandler.DatabaseQueryException(" error : bearer passport : user find : [", err ,"]"));

        if (!user) {
          logger.system.info(" user not found by accesstoken : accesstoken: [", accesstoken ,"]");
          return callback(null, false);
        }

        callback(null, user, {scope: token.scope});
      });
    });
  }
));


// Bearer Authenticate
// this function ignore scope
exports.isBearerAuthentiacted = function(req, res, callback) {
  passport.authenticate('bearer', {session: false}, function(err, user, info) {
    if (err) return callback(err);
    if (!user) return callback(new errorHandler.AuthenticationException(i18n.__('validate.invalid.accesstoken')));

    // set info to request object
    req.info = info;

    req.logIn(user, function(err) {
      if (err) return callback(err);
      return callback();
    });

  })(req, res, callback);
}
