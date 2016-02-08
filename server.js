console.log('Starting TripCollab...');

/*
 * Module Imports
 */
var express = require('express');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var path = require('path');

var secret = 's3rv3r secre7'; //TODO: do something about this 'secret' :)
var app = express();
app.use(bodyParser.json());

//MongoDB Connection
var connectionString;
if (app.get('env') === 'production') {
  connectionString = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
  process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
  process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
  process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
  process.env.OPENSHIFT_APP_NAME;
} else {
  connectionString = 'localhost:27017/tripcollab_local';
}

mongoose.connect('mongodb://' + connectionString);

var storeOptions = {
  mongooseConnection: mongoose.connection,
  autoRemove: 'native',  //Remove expired sessions from the session store
  ttl: 60 * 60, //1 hour for sessions to expire, sessions expiration is refreshed for every user interaction with server.
  collection: 'sessions' //Name of the collection to use
};

var sessionOptions = {
  secret: secret,
  store: new MongoStore(storeOptions),
  name: 'id',
  resave: false,
  saveUninitialized: false,
  cookie: {
    path: '/',      //TODO: Change cookie path to be restrictive, only directories that require the cookie
    maxAge: null,   //TODO: set max age on cookie since there is no browser session
    httpOnly: true  //Help prevent XSS attacks
  }
};

if (app.get('env') === 'production') {
  sessionOptions.cookie.secure = true;
}

app.use(session(sessionOptions));

//Reject all non-secure requests
if (app.get('env') === 'production') {
  app.use(function(req, res, next) {
    if(!req.secure) {
      return res.sendStatus(400);
    }
    next();
  });
}

const PORT= process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 8080;
const IP = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";

console.log('Using NODE_ENV=' + app.get('env'));

//TODO: Requre all routes without specifying each one manually
require(path.resolve('app/routes/authentication.server.route.js'))(app);
require(path.resolve('app/routes/users.server.route.js'))(app);

var server = app.listen(PORT, IP, function() {
  var port = server.address().port;

  console.log('TripCollab started at port %s', port);
});
