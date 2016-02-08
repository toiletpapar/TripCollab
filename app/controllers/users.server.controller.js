var Users = require('../services/users.server.service.js'),
  Errors = require('../services/errors.server.service.js'),
  Promise = require('promise');

var exports = module.exports;

exports.createUser = function(req, res) {
  var user = req.body.user ? {
    username: req.body.user.username,
    password: req.body.user.password
  } : {};

  if (user && user.username && user.password) {
    Users.getUser(user.username).then(function(systemUser) {
      if (systemUser) {
        return Promise.reject(Errors.errors.CONFLICTING_USERNAME);
      } else {
        return Users.createUser(user);
      }
    }).then(function() {
      res.sendStatus(201);  //Created
    }).catch(function(err) {
      console.log('Unable to create user');
      console.log(err);
      if (err === Errors.errors.CONFLICTING_USERNAME) {
        res.sendStatus(409);  //Conflict
      } else {
        res.sendStatus(500);  //Internal Server Error
      }
    });
  } else {
    res.sendStatus(400);  //Bad Request
  }
};

//stubs
exports.getFullProfile = function(req, res) {
  res.status(200).json({
    'profile': 'yours'
  });
};