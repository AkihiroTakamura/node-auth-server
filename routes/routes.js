var express = require('express');
var router = express.Router();

var siteController    = require('../controllers/site');
var authController    = require('../controllers/auth');
var changePasswordController    = require('../controllers/changePassword');
var profileController   = require('../controllers/profile');

router.route('/')
  .get(siteController.index);

router.route('/login')
  .get(siteController.loginForm)
  .post(siteController.login);

router.route('/logout')
  .get(siteController.logout);

router.route('/user')
  .get(siteController.index);
router.route('/role')
  .get(siteController.index);
router.route('/client')
  .get(siteController.index);
router.route('/setting')
  .get(siteController.index);
router.route('/profile')
  .get(siteController.index);

router.route('/changePassword')
  .put(changePasswordController.put)

router.route('/profile/avator/:username')
  .get(profileController.avator);

module.exports = router;
