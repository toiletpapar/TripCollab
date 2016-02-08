//Handles everything that has to do with security with regards to the user

var Promise = require('promise'),
  crypto = require('crypto');

var exports = module.exports;

/*jshint esnext: true*/
const ITERATIONS = 10000;
const KEYLEN = 64;
const DIGESTFN = 'sha256';

//Returns a promise which resolves in a salt that protects user passwords.
exports.makeSalt = function() {
  return new Promise(function(resolve, reject) {
    crypto.randomBytes(64, function(err, buf) {
      if (err) {
        reject(err);
      } else {
        resolve(buf.toString('hex'));
      }
    });
  });
};

//Returns a promise which resolves in a hash of salt + password
exports.hashPassword = function(salt, password) {
  return new Promise(function(resolve, reject) {
    crypto.pbkdf2(password, salt, ITERATIONS, KEYLEN, DIGESTFN, function(err, hash) {
      if (err) {
        reject(err);
      } else {
        resolve(hash.toString('hex'));
      }
    });
  });
};

//Returns true if the given credentials are valid in our system for user
exports.verifyUser = function(user, password) {
  return new Promise(function(resolve, reject) {
    this.hashPassword(user.salt, password).then(function(hash) {
      if (hash === user.passwordHash) {
        resolve(true);
      } else {
        resolve(false);
      }
    }).catch(function(err){
      reject(err);
    });
  }.bind(this));
};