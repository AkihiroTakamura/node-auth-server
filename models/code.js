var mongoose = require('mongoose');

var CodeSchema = new mongoose.Schema({
  value: {type: String, required: true},
  redirectUri: {type: String, required: true},
  userId: {type: String, required: true},
  clientId: {type: String, required: true}
});

//TODO: encrypt value(authorization code)

module.exports = mongoose.model('Code', CodeSchema);
