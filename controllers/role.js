var Role = require('../models/role');
var logger = require('../util/logger');

exports.post = function(req, res) {

  if (!req.body.name) {
    return res.status(400).send({message: 'name required'});
  }

  Role.count({name: req.body.name}, function(err, count) {
    if (err) return res.status(500).send(err);

    if (count > 0) return res.status(400).send({message: 'role already exists'});

    var role = new Role({
      name: req.body.name
    });

    role.save(function(err) {
      if (err) return res.status(500).send(err);
      res.json({
        message: 'new role added',
        data: role
      });
    });

  });

}

exports.get = function(req, res) {
  Role.find({},{})
    .exec(function(err, roles) {
        if (err) return res.status(500).send(err);
        res.json(roles);
    })
  ;
}

exports.delete = function(req, res) {
  Role.findById(req.body._id, 'id name', function(err, role) {
    if (err) return res.status(500).send(err);

    // validate role
    if (!req.role.is('admin')) return res.status(400).send({message: 'you do not have a permission'});

    // validate users exist has target role

    role.remove(function(err, role) {
      if (err) return res.status(500).send(err);
      res.json({
        message: 'role deleted.',
        data: role
      });
    });

  });
}
