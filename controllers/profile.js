var User = require('../models/user');
var logger = require('../util/logger');

exports.get = function(req, res) {

  if (!req.user) return res.status(401).json({message: i18n.__('dsp.notlogined')});

  var whereoption =  {username: req.user.username};

  User.findOne(
    whereoption,
    {_id: 1, username: 2, roles: 3}
  )
  .populate('roles')
  .exec(function(err, users) {
      if (err) return res.status(500).send(err);
      res.json(users);
  });

}
