var express = require('express');
var router = express.Router();

var userController    = require('../controllers/user');
var authController    = require('../controllers/auth');
var clientController   = require('../controllers/client');
var oauth2Controller   = require('../controllers/oauth2');

router.route('/users')
  .post(userController.postUser)
  .get(authController.isBearerAuthentiacted, userController.getUsers);

router.route('/clients')
  .post(clientController.postClients)
  .get(authController.isBearerAuthentiacted, clientController.getClients);

// http://localhost:8080/api/oauth2/authorize?client_id=clientid&response_type=code&redirect_uri=http://localhost:8080&scope=read write
router.route('/oauth2/authorize')
  //.ユーザ認証はoauth2Controller内で実施する
  .get(oauth2Controller.authorization)
  .post(oauth2Controller.decision);

router.route('/oauth2/token')
  .post(authController.isClientAuthenticated, oauth2Controller.token);

module.exports = router;
