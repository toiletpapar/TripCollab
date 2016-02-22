var Itinerary = require('../controllers/itinerary.server.controller.js');

module.exports = function(app) {
	app.route('/api/itinerary/:queryuser')
		.get(Itinerary.getItineraryList);

	app.route('/api/itinerary/:user/')
		.post(Itinerary.createItinerary);


	//app.route('/api/itinerary/:user/:itinerary')
		//.get(Itinerary.getItinerary);
		//.put(Itinerary.editItinerary)
		//.delete(Itinerary.deleteItinerary);


	//app.param('itinerary', Itinerary.retrieveItinerary);
};