var express = require('express');
var router = express.Router();

var userController    = require('../controllers/user');
var authController    = require('../controllers/auth');
var clientController   = require('../controllers/client');
var oauth2Controller   = require('../controllers/oauth2');

router.route('/users')
  .post(authController.isBearerAuthentiacted, userController.post)
  .get(authController.isBearerAuthentiacted, userController.get);

router.route('/clients')
  .post(authController.isBearerAuthentiacted, clientController.post)
  .put(authController.isBearerAuthentiacted, clientController.put)
  .delete(authController.isBearerAuthentiacted, clientController.delete)
  .get(authController.isBearerAuthentiacted, clientController.get);

// http://localhost:8080/api/oauth2/authorize?client_id=clientid&response_type=code&redirect_uri=http://localhost:8080&scope=read write
router.route('/oauth2/authorize')
  //.user authentication is done inside oauth2Controller
  .get(oauth2Controller.authorization)
  .post(oauth2Controller.decision);

router.route('/oauth2/token')
  .post(authController.isClientPasswordAuthenticated, oauth2Controller.token);

module.exports = router;
