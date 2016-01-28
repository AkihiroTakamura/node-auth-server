var express = require('express');
var router = express.Router();

var siteController    = require('../controllers/site');
var authController    = require('../controllers/auth');

router.route('/')
  .get(siteController.index);

router.route('/login')
  .get(siteController.loginForm)
  .post(siteController.login);

router.route('/logout')
  .get(siteController.logout);

router.route('/profile')
  .get(authController.isUserAuthentiacted, siteController.profile);

module.exports = router;
