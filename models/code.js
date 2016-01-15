var mongoose = require('mongoose');

var CodeSchema = new mongoose.Schema({
  code: {type: String, required: true},
  clientId: {type: String, required: true},
  userId: {type: String, required: true},
  scope: {type: String, required: false}
});

module.exports = mongoose.model('Code', CodeSchema);
