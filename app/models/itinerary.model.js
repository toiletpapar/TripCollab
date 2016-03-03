var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var locationSchema = new Schema({
  name: {
    type: String
  },
  long: {
    type: Number,
    required: "Longitude is required for location"
  },
  lat: {
    type: Number,
    required: "Latitude is required for location"
  },
  address: {
    type: String,
    required: "Address is required for location"
  },
  type: {
    type: String,
    required: "Type is required for location"
  }
});

var activitySchema = new Schema({
  day: {
    required: "Day of activity is required",
    type: Number
  },
  time: {
    required: "Time of activity is required",
    type: Date
  },
  location: {
    required: "Location of activity is required",
    type: locationSchema
  }
});

var itinerarySchema = new Schema({
  owner: {
    required: 'Owner of itinerary is required',
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  name: {
    required: 'Name of itinerary is required',
    type: String
  },
  trip: {
    required: 'Trip is required',
    type: [activitySchema]
  },
  deleted: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Itinerary', itinerarySchema);