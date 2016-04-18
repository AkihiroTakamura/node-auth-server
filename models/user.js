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
  passwordInvalidCount: {
    type: Number,
    required: false,
    default: 0
  },
  isLock: {
    type: Boolean,
    required: true,
    default: false
  },
  lastLockoutDate: {
    type: Date,
    required: false
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

      // release lockout status
      user.isLock = false;
      user.passwordInvalidCount = 0;
      user.lastLockoutDate = undefined;

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
  var user = this;

  bcrypt.compare(password, this.password, function(err, isMatch) {
    if (err) return callback(err);

    if (isMatch) {
      // when password valid
      // release lockout status
      user.isLock = false;
      user.passwordInvalidCount = 0;
      user.lastLockoutDate = undefined;
      user.save(function(usererr) {
        if (usererr) return next(new errorHandler.DatabaseQueryException(err));
        return callback(null, true);
      });
    } else {
      // when password invalid
      Setting
        .find()
        .exec(function(err, settings) {
          if (err) return next(new errorHandler.DatabaseQueryException(err));

          user.passwordInvalidCount += 1;
          if (user.passwordInvalidCount >= settings[0].password.lockoutCount) {
            user.isLock = true;
            user.lastLockoutDate = Date.now();
          }

          user.save(function(usererr) {
            if (usererr) return next(new errorHandler.DatabaseQueryException(err));
            return callback(null, false);
          })
        }
      );

    }

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
