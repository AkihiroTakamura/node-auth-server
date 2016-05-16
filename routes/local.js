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

var authController    = require('../controllers/auth');
var userController    = require('../controllers/user');
var roleController    = require('../controllers/role');
var clientController  = require('../controllers/client');
var settingController  = require('../controllers/setting');
var localeController  = require('../controllers/locale');
var profileController   = require('../controllers/profile');

router.route('/users')
  .post(authController.isSessionAuthenticated, userController.post)
  .put(authController.isSessionAuthenticated, userController.put)
  .delete(authController.isSessionAuthenticated, userController.delete)
  .get(authController.isSessionAuthenticated, userController.get);

router.route('/roles')
  .post(authController.isSessionAuthenticated, roleController.post)
  .put(authController.isSessionAuthenticated, roleController.put)
  .delete(authController.isSessionAuthenticated, roleController.delete)
  .get(authController.isSessionAuthenticated, roleController.get);

router.route('/clients')
  .post(authController.isSessionAuthenticated, clientController.post)
  .put(authController.isSessionAuthenticated, clientController.put)
  .delete(authController.isSessionAuthenticated, clientController.delete)
  .get(authController.isSessionAuthenticated, clientController.get);

router.route('/setting')
  .put(authController.isSessionAuthenticated, settingController.put)
  .get(authController.isSessionAuthenticated, settingController.get);

router.route('/i18n')
  .get(localeController.get);

router.route('/profile/upload')
  .post(authController.isSessionAuthenticated, upload.single('file'), profileController.upload);

router.route('/profile/avator/:username')
  .get(profileController.avator);

module.exports = router;
