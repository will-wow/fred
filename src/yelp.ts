// Description:
//   Decides on lunch.
//
// Commands:
//   hubot yelp me baby - Replies with the yelp link to a local restaurant.
//
// Configuration:
//
// Author:
//   Jordan Chan <jordan@assetavenue.com>

var yelp = require('node-yelp');
var _ = require('lodash');
module.exports = (robot) => {

	function feelingLucky(array) {
		return _.sample(array);
	}

	var client = yelp.createClient({
	  	oauth: {
		    "consumer_key": "xQSKK9H7wWD2kGBojduMeQ",
		    "consumer_secret": "UsmGIEpuz7DR5q3-vV4TJDFUonM",
		    "token": "i9_qThJY8s_5XDu9pcS4fjfTVmHy8zFn",
		    "token_secret": "Gwzyzj38gbvCF6m0lwA_6VQU0KY"
		},
	});

	robot.respond(/yelp me baby/i, (res) => {
		var randomSearch = 'lunch';
		var limit = '20';
		var location = "1110 Glendon Ave. Los Angeles, CA";
		var results = [];

		function search {
			client.search({
			  sort: '2',
			  offset: '0',
			  radius_filter: '600',
				location: location,
			  limit: limit,
			  term: randomSearch
			}).then (function (data) {
				data.businesses.forEach(function (food) {
					results.push(food.url);
			})
		})

			client.search({
			  sort: '2',
			  offset: '20',
			  radius_filter: '600',
				location: location,
			  limit: limit,
			  term: randomSearch
			}).then (function (data) {
				data.businesses.forEach(function (food) {
					results.push(food.url);
				})
				res.send(feelingLucky(results));
			})

		};

	  search();
};
