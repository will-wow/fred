

var yelp = require("node-yelp");


module.exports = (robot) => {

	function feelingLucky(min, max) {
		return Math.random() * (max - min) + min;
	}

	var client = yelp.createClient({
	  	oauth: {
		    "consumer_key": "xQSKK9H7wWD2kGBojduMeQ",
		    "consumer_secret": "UsmGIEpuz7DR5q3-vV4TJDFUonM",
		    "token": "i9_qThJY8s_5XDu9pcS4fjfTVmHy8zFn",
		    "token_secret": "Gwzyzj38gbvCF6m0lwA_6VQU0KY"
		},

		httpClient: {
		    maxSockets: 50
	  	}
	});

	robot.respond(/yelp me baby/i, (res) => {
		var randomSearch = 'food';
		var limit = '20';

		client.search({
		  location: "1110 Glendon Ave. Los Angeles, CA",
		  sort: '2',
		  offset: '15',
		  radius_filter: '600',
		  limit: limit,
		  terms: randomSearch

		}).then( (data) => {
		  var number = Math.floor(feelingLucky(0 , limit));
		  var result = data.businesses[number].url;
		  res.send(result);

		});
	});
};