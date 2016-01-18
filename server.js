// =======================
// get instance we need
// =======================
var express           = require('express');
var app               = express();
var bodyParser        = require('body-parser');
var mongoose          = require('mongoose');
var passport          = require('passport');
var session            = require('express-session');
var config             = require('config');
var flash              = require('connect-flash');

var siteController    = require('./controllers/site');
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

// connect-flash
app.use(flash());

// passport
app.use(passport.initialize());
app.use(passport.session());


// =======================
// routes
// =======================

// root routes
var router = express.Router();

router.route('/')
  .get(siteController.index);

router.route('/login')
  .get(siteController.loginForm)
  .post(siteController.login);

router.route('/logout')
  .get(siteController.logout);

router.route('/profile')
  .get(authController.isUserAuthentiacted, siteController.profile);

app.use('/', router);

// api routes
var apiRouter = express.Router();

apiRouter.route('/users')
  .post(userController.postUsers)
  .get(authController.isBearerAuthentiacted, userController.getUsers);

apiRouter.route('/clients')
  .post(clientController.postClients)
  .get(authController.isBearerAuthentiacted, clientController.getClients);

// http://localhost:8080/api/oauth2/authorize?client_id=clientid&response_type=code&redirect_uri=http://localhost:8080&scope=read write
apiRouter.route('/oauth2/authorize')
  //.ユーザ認証はoauth2Controller内で実施する
  .get(oauth2Controller.authorization)
  .post(oauth2Controller.decision);

apiRouter.route('/oauth2/token')
  .post(authController.isClientAuthenticated, oauth2Controller.token);

app.use('/api', apiRouter);


// =======================
// start the server
// =======================
app.listen(port);
console.log('application started. port:' + port);

