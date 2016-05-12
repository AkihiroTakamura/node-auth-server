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
  .get(bearerAuthController.isBearerAuthentiacted, profileController.get);

// =======================
// Client Password API
// =======================
router.route('/users')
  .post(bearerAuthController.isBearerAuthentiacted, userController.post)
  .put(bearerAuthController.isBearerAuthentiacted, userController.put)
  .delete(bearerAuthController.isBearerAuthentiacted, userController.delete)
  .get(bearerAuthController.isBearerAuthentiacted, userController.get);

router.route('/roles')
  .post(bearerAuthController.isBearerAuthentiacted, roleController.post)
  .put(bearerAuthController.isBearerAuthentiacted, roleController.put)
  .delete(bearerAuthController.isBearerAuthentiacted, roleController.delete)
  .get(bearerAuthController.isBearerAuthentiacted, roleController.get);

router.route('/clients')
  .post(bearerAuthController.isBearerAuthentiacted, clientController.post)
  .put(bearerAuthController.isBearerAuthentiacted, clientController.put)
  .delete(bearerAuthController.isBearerAuthentiacted, clientController.delete)
  .get(bearerAuthController.isBearerAuthentiacted, clientController.get);

router.route('/setting')
  .put(bearerAuthController.isBearerAuthentiacted, settingController.put)
  .get(bearerAuthController.isBearerAuthentiacted, settingController.get);


module.exports = router;
