var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  roles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role'
  }],
  clients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  }]
});

// Execute before each user.save() call
UserSchema.pre('save', function(callback) {
  var user = this;

  // if the password hasn't changed -> break
  if (!user.isModified('password')) return callback();

  // password encrypt
  bcrypt.genSalt(5, function(err, salt) {
    if (err) return callback(err);

    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) return callback(err);
      user.password = hash;
      callback();
    });
  });
});

// validate password
UserSchema.methods.verifyPassword = function(password, callback) {
  bcrypt.compare(password, this.password, function(err, isMatch) {
    if (err) return callback(err);
    callback(null, isMatch);
  });
}

// role check
UserSchema.methods.is = function(rolename) {
  var user = this;
  if (!user.roles || !user.roles.length) return false;

  for (i = 0; i < user.roles.length; i++) {
    if (user.roles[i].name && user.roles[i].name == rolename) return true;
  }
  return false;
}


module.exports = mongoose.model('User', UserSchema);
