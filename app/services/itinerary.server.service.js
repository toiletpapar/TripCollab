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
    itinerary.published = itineraryInfo.published;

    //lowercase all tags
    for (var i = 0; i < itineraryInfo.tags.length; i++) {
      itineraryInfo.tags[i] = itineraryInfo.tags[i].toLowerCase();
    }

    itinerary.tags = itineraryInfo.tags;
    itinerary.sharedWith = itineraryInfo.sharedWith;

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

exports.getItineraryList = function(filter, owner, sharedWith) {
  return new Promise(function(resolve, reject) {
    var itineraryQuery = Itinerary.find(filter);

    if (owner && sharedWith) {
      itineraryQuery = itineraryQuery.or([{owner: owner}, {sharedWith: sharedWith}]);
    }

    itineraryQuery.exec(function(err, itineraries) {
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
  itinerary.published = info.published;

  //lowercase all tags
  for (var i = 0; i < info.tags.length; i++) {
    info.tags[i] = info.tags[i].toLowerCase();
  }

  itinerary.tags = info.tags;
  itinerary.sharedWith = info.sharedWith;
  
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