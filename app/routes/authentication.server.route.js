var Authentication = require('../controllers/authentication.server.controller.js');

//TODO: Replace routes with routers
module.exports = function(app) {
  app.route('/api/auth/')
    .post(Authentication.login);

  app.route('/api/auth/:user')
    .delete(Authentication.logout);

  app.param('user', Authentication.verifySession);
};