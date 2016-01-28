var User = require('../models/user');
var logger = require('../util/logger');

exports.post = function(req, res) {

  if (!req.body.username) {
    return res.status(400).send({message: 'username required'});
  }
  if (!req.body.password) {
    return res.status(400).send({message: 'password required'});
  }

  User.count({username: req.body.username}, function(err, count) {
    if (err) return res.status(500).send(err);

    if (count > 0) return res.status(400).send({message: 'user already exists'});

    var user = new User({
      username: req.body.username,
      password: req.body.password,
      roles: req.body.roles
    });

    user.save(function(err) {
      if (err) return res.status(500).send(err);

      res.json({
        message: 'new user added',
        data: user
      });
    });
  });

}

exports.put = function(req, res) {

  if (!req.body._id) {
    return res.status(400).send({message: '_id required'});
  }

  User.findById(req.body._id, 'id username', function(err, user) {
    if (err) return res.status(500).send(err);

    if (!user) return res.status(400).send({message: 'user not found'});

    if (req.body.password) {
      user.password = req.body.password;
    }
    user.roles = req.body.roles;

    user.save(function(err) {
      if (err) return res.status(500).send(err);

      res.json({
        message: 'user updated',
        data: user
      });
    });
  });

}

exports.get = function(req, res) {

  var whereoption = req.user.is('admin') ? {} : {username: req.user.username};

  User.find(
    whereoption,
    {username: 1, roles: 2}
  )
  .populate('roles')
  .exec(function(err, users) {
      if (err) return res.status(500).send(err);
      res.json(users);
  });

}

exports.delete = function(req, res) {
  User.findById(req.body._id, 'id username', function(err, user) {
    if (err) return res.status(500).send(err);

    // validate for do not delete myself
    if (user && req.user.id && user._id == req.user.id) {
      return res.status(400).send({message: 'do not delete myself'});
    }

    // validate role
    if (!req.user.is('admin')) return res.status(400).send({message: 'you do not have a permission'});

    user.remove(function(err, user) {
      if (err) return res.status(500).send(err);

      res.json({
        message: 'user deleted.',
        data: user
      });
    });


  });
}
