var _ = require('lodash'),
    Promise = require('promise'),
    Itinerary = require('../services/itinerary.server.service.js'),
    Users = require('../services/users.server.service.js');

var exports = module.exports;

//Create an itinerary
exports.createItinerary = function(req, res) {
  var itinerary = req.body.itinerary;

  if (itinerary && itinerary.trip && itinerary.trip.length) {
    var trip = [];

    for (var i = 0; i < itinerary.trip.length; i++) {
      var activity = {};

      activity.time = itinerary.trip[i].time;
      activity.location = {};

      if (itinerary.trip[i].location) {
        activity.location.name = itinerary.trip[i].location.name ? itinerary.trip[i].location.name : '';
        activity.location.long = itinerary.trip[i].location.long;
        activity.location.lat = itinerary.trip[i].location.lat;
        activity.location.address = itinerary.trip[i].location.address;
        activity.location.type = itinerary.trip[i].location.type;
      }
      
      trip[i] = activity;
    }

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
      return Itinerary.getItineraryList({});
    } else if (user === null) {
      return Promise.resolve([]);
    } else {
      return Itinerary.getItineraryList({owner: user.id});
    }
  }).then(function(itineraries) {
    res.status(200).json({
      'itineraries': itineraries
    });
  }).catch(function(err) {
    console.log(err);
    console.log('Unable to get itineraries for given user');
    res.sendStatus(500);
  });
}