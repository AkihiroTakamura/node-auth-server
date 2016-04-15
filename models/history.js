var mongoose = require('mongoose');

var HistorySchema = new mongoose.Schema({
  username: {type: String, required: true},
  passwordHistory: [{
    password: {
      type: String
    },
    createdAt: {
      type: Date
    }
  }]

});

module.exports = mongoose.model('History', HistorySchema);
