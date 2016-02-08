var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  username: {
    required: 'Username is required',
    type: String
  },
  passwordHash: {
    required: 'Hashed password is required',
    type: String
  },
  salt: {
    required: 'Salt is required',
    type: String
  }
});

module.exports = mongoose.model('User', userSchema);