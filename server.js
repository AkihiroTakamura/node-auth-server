// =======================
// get instance we need
// =======================
var express           = require('express');
var app               = express();
var router            = express.Router();
var bodyParser        = require('body-parser');
var mongoose          = require('mongoose');
var passport          = require('passport');
var ejs                = require('ejs');
var session            = require('express-session');
var config             = require('config');

var userController    = require('./controllers/user');
var authController    = require('./controllers/auth');
var clientController   = require('./controllers/client');
var oauth2Controller   = require('./controllers/oauth2');

// =======================
// configuration
// =======================
var port = process.env.PORT || config.server.port || 8080;

// connect db
mongoose.connect(config.database.mongo);

app.use(bodyParser.urlencoded({
  extended: true
}));

app.set('view engine', 'ejs');

app.use(session({
  secret: config.session.secret,
  saveUninitialized: true,
  resave: true
}));

app.use(passport.initialize());

// =======================
// routes
// =======================
router.route('/users')
  .post(userController.postUsers)
  .get(authController.isAuthentiacted, userController.getUsers);

router.route('/clients')
  .post(authController.isAuthentiacted, clientController.postClients)
  .get(authController.isAuthentiacted, clientController.getClients);

// http://localhost:8080/api/oauth2/authorize?client_id=clientid&response_type=code&redirect_uri=http://localhost:8080
router.route('/oauth2/authorize')
  .get(authController.isAuthentiacted, oauth2Controller.authorization)
  .post(authController.isAuthentiacted, oauth2Controller.decision);

router.route('/oauth2/token')
  .post(authController.isClientAuthenticated, oauth2Controller.token);

app.use('/api', router);

// =======================
// start the server
// =======================
app.listen(port);
console.log('application started. port:' + port);

