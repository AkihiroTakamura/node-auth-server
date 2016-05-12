var mongoose = require('mongoose');

var TokenSchema = new mongoose.Schema({
  accesstoken: {type: String, required: true},
  refreshtoken: {type: String, required: true},
  userId: {type: String, required: true},
  clientId: {type: String, required: true},
  expirationDate: {type: Date, required: true},
  scope: {type: String, required: false},
  active: {type: Boolean, get: function(value) {
    if (!value || this.expirationDate < new Date()) {
      return false;
    } else {
      return value;
    }
  }, default: true },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

module.exports = mongoose.model('Token', TokenSchema);
