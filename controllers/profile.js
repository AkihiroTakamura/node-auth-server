var User = require('../models/user');
var i18n = require('i18n');
var logger = require('../util/logger');
var errorHandler = require('../util/errorhandler');

exports.get = function(req, res) {

  if (!req.user) throw new errorHandler.UnAuthorizedException(i18n.__('dsp.notlogined'));

  var whereoption =  {username: req.user.username};

  User.findOne(
    whereoption,
    {_id: 1, username: 2, roles: 3}
  )
  .populate('roles')
  .exec(function(err, user) {
      if (err) throw new errorHandler.DatabaseQueryException(err);

      var json = {};
      json.username = user.username;
      json.authorities = [];
      for (var i = 0; i < user.roles.length; i++) {
        json.authorities.push(user.roles[i].name);
      };

      res.json(json);
  });

}
