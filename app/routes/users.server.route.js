var Users = require('../controllers/users.server.controller.js');

module.exports = function(app) {
  app.route('/api/users/')
    .post(Users.createUser);

  app.route('/api/users/:user')
  	.get(Users.getFullProfile);
};