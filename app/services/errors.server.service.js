var exports = module.exports;

//Enumerated error codes
exports.errors = {
  USER_NOT_FOUND : {
    errorCode: 100,
    message: 'Unable to find user'
  },
  CONFLICTING_USERNAME : {
  	erroCode: 200,
  	message: 'Tried to create user but username was taken'
  }
};