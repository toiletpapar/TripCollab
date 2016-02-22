var Itinerary = require('../controllers/itinerary.server.controller.js');

module.exports = function(app) {
	app.route('/api/itinerary/:user/')
		.get(Itinerary.getItineraryList)	//Retrieves all visible itineraries (Accepts query param user:username)
		.post(Itinerary.createItinerary);

	//app.route('/api/itinerary/:user/:itinerary')
		//.get(Itinerary.getItinerary);
		//.put(Itinerary.editItinerary)
		//.delete(Itinerary.deleteItinerary);

	//app.param('itinerary', Itinerary.retrieveItinerary);
};