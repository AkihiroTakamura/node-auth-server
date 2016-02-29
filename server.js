// =======================
// get instance we need
// =======================
var express           = require('express');
var app               = express();
var bodyParser        = require('body-parser');
var session            = require('express-session');
var errorHandler       = require('./util/errorhandler');
var mongoose          = require('mongoose');
var MongoStore         = require('connect-mongo')(session);
var passport          = require('passport');
var config             = require('config');
var flash              = require('connect-flash');
var i18n               = require('i18n');
var path               = require('path');
var logger             = require('./util/logger');

var routes             = require('./routes/routes');
var routes_api         = require('./routes/api');
var routes_local       = require('./routes/local');

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
app.use('/', routes);
app.use('/api', routes_api);
app.use('/local/api', routes_local);

// =======================
// error handler
// =======================
app.use(function(err, req, res, next) {
  return errorHandler.doError(err, req, res, next);
});

// =======================
// start the server
// =======================
app.listen(port);
console.log('application started');

