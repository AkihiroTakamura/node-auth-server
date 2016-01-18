var User = require('../models/user');

exports.postUsers = function(req, res) {
  var user = new User({
    username: req.body.username,
    password: req.body.password
  });

  user.save(function(err) {
    if (err) res.send(err);

    res.json({
      message: 'new user added',
      data: user
    });
  });
}

exports.getUsers = function(req, res) {
  User.find(
    {username: req.user.username},
    function(err, users) {
      if (err) res.send(err);
      res.json(users);
  });
}
