//TODO: change how we log things (log4js?)

var Authentication = require('../services/authentication.server.service.js'),
  Users = require('../services/users.server.service.js'),
  Errors = require('../services/errors.server.service.js'),
  Promise = require('promise');

var exports = module.exports;

//Verify that the current session is valid.
exports.verifySession = function(req, res, next, username) {
  console.log(req.session.id);
  if (req.session.user && req.session.user === username) {
    next();
  } else {
    res.sendStatus(401);
  }
};

//Create/Regenerate a session for the user if the credentials are valid.
exports.login = function(req, res) {
  var user = req.body.user ? {
    username: req.body.user.username,
    password: req.body.user.password
  } : {};

  if (user && user.username && user.password) {
    Users.getUser(user.username).then(function(systemUser) {
      if (systemUser) {
        return Authentication.verifyUser(systemUser, user.password);
      } else {
        return Promise.reject(Errors.errors.USER_NOT_FOUND);
      }
    }).then(function(loginSuccess) {
      if (loginSuccess) {
        req.session.regenerate(function(err) {
          if (err) {
            console.log(err);
            res.sendStatus(500);
          } else {
            req.session.user = user.username; //Create the session
            res.sendStatus(200);
          }
        });
      } else {
        res.sendStatus(401);
      }
    }).catch(function(err) {
      console.log('Failed to login user');
      console.log(err);

      if (err === Errors.errors.USER_NOT_FOUND) {
        res.sendStatus(401);
      } else {
        res.sendStatus(500);
      }
    });
  } else {
    res.sendStatus(400);
  }
};

//Invalidate the session specified by the request.
exports.logout = function(req, res) {
  req.session.destroy(function(err) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
    } else {
      //TODO: Unset the cookie client-sided
      res.sendStatus(200);
    }
  });
};