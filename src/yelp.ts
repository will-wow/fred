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

    function search(offset) {
      return client.search({
        sort: '2',
        offset: offset,
        radius_filter: '600',
        location: location,
        limit: limit,
        term: randomSearch
      });
    }

    function makeSearch() {
      return new Promise(function(resolve, reject) {
        search(0).then(function(data) {
          search(20).then(function(secondData) {
            var results = data.businesses.concat(secondData.businesses);

            var urls = results.map(function(food) {
              return food.url;
            });
            resolve(urls);
          });
        });
      });
    }

    makeSearch().then(function(all) {
      res.send(feelingLucky(all));
    });
  });
};
