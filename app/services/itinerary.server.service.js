var Itinerary = require('../models/itinerary.model.js'),
    Users = require('./users.server.service.js'),
    Promise = require('promise');

var exports = module.exports;

exports.createItinerary = function(trip, username) {
  return Users.getUser(username).then(function(user) {
    var itinerary = {};
    itinerary.owner = user.id;
    itinerary.trip = trip;

    var itineraryDoc = new Itinerary(itinerary);

    return new Promise(function(resolve, reject) {
      itineraryDoc.save(function(err, userDoc) {
        if (err) {
          reject(err);
        } else {
          resolve(userDoc);
        }
      });
    });
  });
};

exports.getItineraryList = function(user) {
  return new Promise(function(resolve, reject) {
    Itinerary.find({ owner: user.id }).exec(function(err, itineraries) {
      if (err) {
        reject(err);
      } else {
        resolve(itineraries);
      }
    });
  });
};