var express = require('express');
var router = express.Router();

var authController    = require('../controllers/auth');
var userController    = require('../controllers/user');
var roleController    = require('../controllers/role');

router.route('/users')
  .post(authController.isSessionAuthenticated, userController.postUser)
  .put(authController.isSessionAuthenticated, userController.putUser)
  .delete(authController.isSessionAuthenticated, userController.deleteUser)
  .get(authController.isSessionAuthenticated, userController.getUsers);

router.route('/roles')
  .get(authController.isSessionAuthenticated, roleController.getRoles);

module.exports = router;
