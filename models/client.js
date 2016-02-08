var mongoose = require('mongoose');

var ClientSchema = new mongoose.Schema({
  id: {type: String, required: true, unique: true},
  userId: {type: String, required: true},
  secret: {type: String, required: true},
  name: {type: String, required: true},
  domain: {type: String, required: true},
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }

});

module.exports = mongoose.model('Client', ClientSchema);
