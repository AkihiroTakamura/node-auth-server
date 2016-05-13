var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({
  limits: {
    fieldNameSize: 100, // max filename 100byte
    fileSize: 5242880,  // max filesize 5MB
    files: 1  // max file count
  },
  imMemory: true
});

var siteController    = require('../controllers/site');
var authController    = require('../controllers/auth');
var changePasswordController    = require('../controllers/changePassword');

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

module.exports = router;
