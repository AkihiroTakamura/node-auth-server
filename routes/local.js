var express = require('express');
var router = express.Router();

var authController    = require('../controllers/auth');
var userController    = require('../controllers/user');
var roleController    = require('../controllers/role');

router.route('/users')
  .post(authController.isSessionAuthenticated, userController.post)
  .put(authController.isSessionAuthenticated, userController.put)
  .delete(authController.isSessionAuthenticated, userController.delete)
  .get(authController.isSessionAuthenticated, userController.get);

router.route('/roles')
  .post(authController.isSessionAuthenticated, roleController.post)
//  .put(authController.isSessionAuthenticated, roleController.put)
  .delete(authController.isSessionAuthenticated, roleController.delete)
  .get(authController.isSessionAuthenticated, roleController.get);

module.exports = router;
