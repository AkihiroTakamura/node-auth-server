var mongoose = require('mongoose');

var TokenSchema = new mongoose.Schema({
  accesstoken: {type: String, required: true},
  userId: {type: String, required: true},
  clientId: {type: String, required: true},
  expirationDate: {type: Date, required: true},
  scope: {type: String, required: false}
});

module.exports = mongoose.model('Token', TokenSchema);
