var passport = require('passport');

exports.index = function(req, res) {
  res.render('index', {user: req.user});
}

exports.loginForm = function(req, res) {
  res.render('login', {error: req.flash('error')});
}

exports.login = passport.authenticate('local', {
  successReturnToOrRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
});

exports.logout = function(req, res) {
  req.logout();
  if (req.query.next) {
    res.redirect(req.query.next);
  } else {
    res.redirect('/');
  }
}

exports.profile = function(req, res) {
  res.render('profile', {user: req.user});
}
