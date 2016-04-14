var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Setting = require('./setting');
var moment = require('moment');

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
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: false
  },
  phone: {
    type: String,
    required: false
  },
  passwordExpiredDate: {
    type: Date,
    required: false,
    default: Date.now()
  },
  isLock: {
    type: Boolean,
    required: true,
    default: false
  },
  roles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role'
  }],
  clients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  }],
  tokens: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Token'
  }]
});

// Execute before each user.save() call
UserSchema.pre('save', function(callback) {
  var user = this;

  // if the password hasn't changed -> break
  if (!user.isModified('password')) return callback();

  Setting
    .find()
    .exec(function(err, settings) {
      if (err) return next(new errorHandler.DatabaseQueryException(err));

      var setting = settings[0];

      // set password expired date
      user.passwordExpiredDate = moment(Date.now()).add(setting.password.expireDateCount, 'days').format();

      // cancel lock status
      user.isLock = false;

      // password encrypt
      bcrypt.genSalt(5, function(err, salt) {
        if (err) return callback(err);

        bcrypt.hash(user.password, salt, null, function(err, hash) {
          if (err) return callback(err);
          user.password = hash;
          callback();
        });
      });

    })
  ;


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
