//Handles everything with regards to the user's data

var Authentication = require('./authentication.server.service.js'),
  User = require('../models/users.model.js'),
  Promise = require('promise');

var exports = module.exports;

//Creates the user in MongoDB given user object.
exports.createUser = function(user) {
  var dbUser = {};  //Final object to push into DB
  dbUser.username = user.username;
  
  return Authentication.makeSalt().then(function(salt) {
    dbUser.salt = salt;
    return Authentication.hashPassword(salt, user.password);
  }).then(function(hash) {
    dbUser.passwordHash = hash;
    var userDoc = new User(dbUser);

    return new Promise(function(resolve, reject) {
      userDoc.save(function(err, userDoc) {
        if (err) {
          reject(err);
        } else {
          resolve(userDoc);
        }
      });
    });
  });
};

//Retrieves the user from MongoDB given username.
exports.getUser = function(username) {
  return new Promise(function(resolve, reject) {
    User.findOne({ username: username }).exec(function(err, user) {
      if (err) {
        reject(err);
      } else {
        resolve(user);
      }
    });
  });
};