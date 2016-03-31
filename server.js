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
var socket_io = require('socket.io');

var Itinerary = require(path.resolve('app/services/itinerary.server.service.js'));

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
  app.enable('trust proxy');  //Trust Openshift proxy
  
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
require(path.resolve('app/routes/itinerary.server.route.js'))(app);

var server = app.listen(PORT, IP, function() {
  var port = server.address().port;

  console.log('TripCollab started at port %s', port);
});

//Sockets
//TODO:
//Authenticate sockets and sessions?
//Race conditions?
//Data verification?

var io = socket_io(server);

//Edit Namespace
io.of('/edit').on('connection', function(socket) {
  //Join Itinerary Room
  socket.on('join itinerary', function(data) {
    var itineraryID = data.itineraryID;

    socket.join(itineraryID);
  });

  //Leave Itinerary Room
  socket.on('leave itinerary', function(data) {
    var itineraryID = data.itineraryID;

    socket.leave(itineraryID);
  });

  //Add activity to itinerary
  socket.on('add activity', function(data) {
    var itineraryID = data.itineraryID;
    var activity = data.activity;

    Itinerary.getItinerary(itineraryID).then(function(itinerary) {
      var trip = itinerary.trip;
      trip.push(activity);

      var itineraryInfo = {
        name: itinerary.name, 
        published: itinerary.published, 
        tags: itinerary.tags,
        trip: trip,
        sharedWith: itinerary.sharedWith
      };

      return Itinerary.editItinerary(itinerary, itineraryInfo);
    }).then(function(itinerary) {
      socket.to(itineraryID).emit('add activity', data);
    }).catch(function(err) {
      console.log(err);
      socket.to(socket.id).emit('add activity err', err);
    });
  });

  //Delete activity to itinerary
  socket.on('delete activity', function(data) {
    var itineraryID = data.itineraryID;
    var locationName = data.locationName;

    Itinerary.getItinerary(itineraryID).then(function(itinerary) {
      var trip = itinerary.trip;
      //What if two activities have the same location?
      //We only use location name to uniquely identify activities for the purposes of the demo
      var indexToRemove = trip.findIndex(function(element, index, array) {
        return element.location.name == locationName;
      });
      console.log("The index to remove");
      console.log(indexToRemove);
      trip.splice(indexToRemove, 1);

      var itineraryInfo = {
        name: itinerary.name, 
        published: itinerary.published, 
        tags: itinerary.tags,
        trip: trip,
        sharedWith: itinerary.sharedWith
      };

      return Itinerary.editItinerary(itinerary, itineraryInfo);
    }).then(function(itinerary) {
      console.log('activity deleted');
      socket.to(itineraryID).emit('delete activity', data);
    }).catch(function(err) {
      console.log(err);
      socket.to(socket.id).emit('delete activity err', err);
    });
  });

});