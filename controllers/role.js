var Role = require('../models/role');
var logger = require('../util/logger');

exports.getRoles = function(req, res) {
  Role.find({},{})
    .exec(function(err, roles) {
        if (err) return res.status(500).send(err);
        res.json(roles);
    })
  ;
}
