// =======================
// get instance we need
// =======================
var express           = require('express');
var app               = express();
var router            = express.Router();
var bodyParser        = require('body-parser');
var mongoose          = require('mongoose');
var passport          = require('passport');
var session            = require('express-session');
var config             = require('config');
var flash              = require('connect-flash');

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

// request parameter parser
app.use(bodyParser.urlencoded({
  extended: true
}));

// html template
app.set('view engine', 'jade');
app.set('views', __dirname + '/views');

// session
app.use(session({
  secret: config.session.secret,
  saveUninitialized: true,
  resave: true
}));

// passport
app.use(passport.initialize());
app.use(passport.session());

// connect-flash
app.use(flash());

// =======================
// routes
// =======================
router.route('/users')
  .post(userController.postUsers)
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

app.use('/api', router);

// =======================
// start the server
// =======================
app.listen(port);
console.log('application started. port:' + port);

