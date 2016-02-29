var _ = require('lodash'),
    Promise = require('promise'),
    Itinerary = require('../services/itinerary.server.service.js'),
    Users = require('../services/users.server.service.js');

var exports = module.exports;

function extractTrip(itinerary) {
  //Take only relevant parts of itinerary
  var trip = [];

  for (var i = 0; i < itinerary.trip.length; i++) {
    var activity = {};

    activity.day = itinerary.trip[i].day;
    activity.time = itinerary.trip[i].time;

    if (itinerary.trip[i].location) {
      activity.location = {};
      activity.location.name = itinerary.trip[i].location.name ? itinerary.trip[i].location.name : '';
      activity.location.long = itinerary.trip[i].location.long;
      activity.location.lat = itinerary.trip[i].location.lat;
      activity.location.address = itinerary.trip[i].location.address;
      activity.location.type = itinerary.trip[i].location.type;
    }
    
    trip[i] = activity;
  }

  return trip;
}

function convertTripTimeToMilliseconds(itinerary) {
  _.each(itinerary.trip, function(activity) {
    activity.time = Date.parse(activity.time);
  });
}

//Create an itinerary
exports.createItinerary = function(req, res) {
  var itinerary = req.body.itinerary;

  if (itinerary && itinerary.trip && itinerary.trip.length) {
    var trip = extractTrip(itinerary);

    Itinerary.createItinerary(trip, req.session.user).then(function() {
      res.sendStatus(201);
    }).catch(function(err) {
      console.log(err);
      console.log('Unable to create itinerary');
      res.sendStatus(500);
    });
  } else {
    res.sendStatus(400);
  }
};

//Retrieve a list of itineraries
exports.getItineraryList = function(req, res) {
  var username = req.query.username;
  var pUser;

  if (username) {
    pUser = Users.getUser(username);
  } else {
    pUser = Promise.resolve();
  }

  pUser.then(function(user) {
    if (user === undefined) {
      //No user given, return all itineraries
      return Itinerary.getItineraryList({});
    } else if (user === null) {
      //No user found, return empty itineraries
      return Promise.resolve([]);
    } else {
      //Return itineraries filtered by user
      return Itinerary.getItineraryList({owner: user.id});
    }
  }).then(function(itineraries) {
    //Takes a ISO8601-compliant date string and converts it into milliseconds
    _.each(itineraries, function(itinerary) {
      convertTripTimeToMilliseconds(itinerary.trip);
    });

    res.status(200).json({
      'itineraries': itineraries
    });
  }).catch(function(err) {
    console.log(err);
    console.log('Unable to get itineraries for given user');
    res.sendStatus(500);
  });
}

exports.getItinerary = function(req, res) {
  convertTripTimeToMilliseconds(req.itinerary.trip);
  res.status(200).json({'itinerary': req.itinerary});
}

exports.editItinerary = function(req, res) {
  var itinerary = req.body.itinerary;

  if (itinerary && itinerary.trip && itinerary.trip.length) {
    var trip = extractTrip(itinerary);
    Itinerary.editItinerary(req.itinerary, {trip: trip}).then(function(itinerary) {
      res.status(200).json({'itinerary': itinerary});
    }).catch(function(err) {
      console.log(err);
      console.log('Unable to edit itinerary');

      res.sendStatus(500);
    });
  } else {
    res.sendStatus(400);
  }
}

exports.deleteItinerary = function(req, res) {
  Itinerary.deleteItinerary(req.itinerary).then(function() {
    res.sendStatus(200);
  }).catch(function(err) {
    console.log(err);
    console.log('Unable to delete itinerary');

    res.sendStatus(500);
  });
}

//Retrieve a single itinerary given its id
exports.retrieveItinerary = function(req, res, next, itineraryID) {
  Itinerary.getItinerary(itineraryID).then(function(itinerary) {
    if (itinerary) {
      req.itinerary = itinerary;
      next();
    } else {
      return res.sendStatus(404);
    }
  });
};