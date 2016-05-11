var express = require('express');
var router = express.Router();

var userController    = require('../controllers/user');
var authController    = require('../controllers/auth');
var bearerAuthController    = require('../controllers/bearer-auth');
var clientController   = require('../controllers/client');
var roleController   = require('../controllers/role');
var profileController   = require('../controllers/profile');
var oauth2Controller   = require('../controllers/oauth2');
var settingController  = require('../controllers/setting');

// =======================
// OAuth2.0
// =======================
// oauth2.0 authorization end point
router.route('/oauth2/authorize')
  //.user authentication is done inside oauth2Controller
  .get(oauth2Controller.authorization)
  .post(oauth2Controller.decision);

// echange authorization code to access token
// accept grant_type: code, password, client_credentials
router.route('/oauth2/token')
  .post(
    authController.isClientAuthenticated,
    oauth2Controller.token
  );

// =======================
// Bearer API
// =======================
router.route('/profile')
  .get(bearerAuthController.hasScopeIdAndRole, profileController.get);

// =======================
// Client Password API
// =======================
router.route('/users')
  .post(authController.isClientPasswordAuthenticated, userController.post)
  .put(authController.isClientPasswordAuthenticated, userController.put)
  .delete(authController.isClientPasswordAuthenticated, userController.delete)
  .get(authController.isClientPasswordAuthenticated, userController.get);

router.route('/roles')
  .post(authController.isClientPasswordAuthenticated, roleController.post)
  .put(authController.isClientPasswordAuthenticated, roleController.put)
  .delete(authController.isClientPasswordAuthenticated, roleController.delete)
  .get(authController.isClientPasswordAuthenticated, roleController.get);

router.route('/clients')
  .post(authController.isClientPasswordAuthenticated, clientController.post)
  .put(authController.isClientPasswordAuthenticated, clientController.put)
  .delete(authController.isClientPasswordAuthenticated, clientController.delete)
  .get(authController.isClientPasswordAuthenticated, clientController.get);

router.route('/setting')
  .put(authController.isSessionAuthenticated, settingController.put)
  .get(authController.isSessionAuthenticated, settingController.get);


module.exports = router;
