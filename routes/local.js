var express = require('express');
var router = express.Router();

var authController    = require('../controllers/auth');
var userController    = require('../controllers/user');
var roleController    = require('../controllers/role');
var clientController  = require('../controllers/client');

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

module.exports = router;
