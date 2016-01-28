var mongoose = require('mongoose');

var RoleSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true
  }
});

module.exports = mongoose.model('Role', RoleSchema);
