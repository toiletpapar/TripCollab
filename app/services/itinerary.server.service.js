var Itinerary = require('../models/itinerary.model.js'),
    Users = require('./users.server.service.js'),
    Promise = require('promise');

var exports = module.exports;

exports.createItinerary = function(itineraryInfo, username) {
  return Users.getUser(username).then(function(user) {
    var itinerary = {};
    itinerary.owner = user.id;
    itinerary.trip = itineraryInfo.trip;
    itinerary.name = itineraryInfo.name;

    var itineraryDoc = new Itinerary(itinerary);

    return new Promise(function(resolve, reject) {
      itineraryDoc.save(function(err, itineraryDoc) {
        if (err) {
          reject(err);
        } else {
          resolve(itineraryDoc);
        }
      });
    });
  });
};

exports.getItineraryList = function(filter) {
  filter.deleted = false;

  return new Promise(function(resolve, reject) {
    Itinerary.find(filter).exec(function(err, itineraries) {
      if (err) {
        reject(err);
      } else {
        resolve(itineraries);
      }
    });
  });
};

exports.getItinerary = function(itineraryID) {
  return new Promise(function(resolve, reject) {
    Itinerary.findById(itineraryID).and([{deleted: false}]).exec(function(err, itinerary) {
      if (err) {
        reject(err);
      } else {
        resolve(itinerary);
      }
    });
  });
};

exports.editItinerary = function(itinerary, info) {
  itinerary.trip = info.trip;
  itinerary.name = info.name;
  return new Promise(function(resolve, reject) {
    itinerary.save(function(err, itinerary) {
      if (err) {
        reject(err);
      } else {
        resolve(itinerary);
      }
    });
  });
};

exports.deleteItinerary = function(itinerary) {
  //Soft delete
  itinerary.deleted = true;
  return new Promise(function(resolve, reject) {
    itinerary.save(function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(itinerary);
      }
    });
  }); 
};