// =======================
// get instance we need
// =======================
var express           = require('express');
var app               = express();
var bodyParser        = require('body-parser');
var session            = require('express-session');
var mongoose          = require('mongoose');
var MongoStore         = require('connect-mongo')(session);
var passport          = require('passport');
var config             = require('config');
var flash              = require('connect-flash');
var i18n               = require('i18n');
var path               = require('path');
var logger             = require('./util/logger');
var siteController    = require('./controllers/site');
var userController    = require('./controllers/user');
var authController    = require('./controllers/auth');
var clientController   = require('./controllers/client');
var oauth2Controller   = require('./controllers/oauth2');

// =======================
// configuration
// =======================
// logger set to express
app.use(logger.express);

var port = process.env.PORT || config.server.port || 8080;

// connect db
mongoose.connect(config.database.mongo);

// request parameter parser
app.use(bodyParser.urlencoded({
  extended: true
}));

// static file folder
app.use(express.static('public'));

// html template
app.set('view engine', 'jade');
app.set('views', __dirname + '/views');

// session
app.use(session({
  secret: config.session.secret,
  saveUninitialized: true,
  resave: true,
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: config.session.expiresInDate * 24 * 60 * 60 // session exouration 14days
  })
}));

// connect-flash
app.use(flash());

// passport
app.use(passport.initialize());
app.use(passport.session());

// multi language
i18n.configure({
  locales: ['ja', 'en'],
  defaultLocale: 'ja',
  directory: __dirname + "/locale",
  objectNotation: true
});
app.use(i18n.init);

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
  .post(userController.postUser)
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

// local api routes
var localApiRouter = express.Router();

localApiRouter.route('/users')
  .post(authController.isSessionAuthenticated, userController.postUser)
  .put(authController.isSessionAuthenticated, userController.putUser)
  .delete(authController.isSessionAuthenticated, userController.deleteUser)
//  .get(userController.getUsers);
  .get(authController.isSessionAuthenticated, userController.getUsers);

app.use('/local/api', localApiRouter);

// =======================
// error handler
// =======================
app.use(function(err, req, res, next) {
  logger.system.fatal(err);
  res.status(500).send('something wrong');
});


// =======================
// start the server
// =======================
app.listen(port);
console.log('application started');

