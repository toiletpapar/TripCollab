var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var locationSchema = new Schema({
  name: {
    type: String
    //required: "Name is required for location" //For the purposes of the demo and backwards compatibility we do not require name
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
  published: {
    type: Boolean,
    default: false,
  },
  owner: {
    required: 'Owner of itinerary is required',
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  sharedWith: {
    type: [Schema.Types.ObjectId],
    ref: 'User',
    default: []
  },
  name: {
    required: 'Name of itinerary is required',
    type: String
  },
  trip: {
    type: [activitySchema]
  },
  deleted: {
    type: Boolean,
    default: false
  },
  tags: {
    type: [String],
    default: []
  }
});

module.exports = mongoose.model('Itinerary', itinerarySchema);