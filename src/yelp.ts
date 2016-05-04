// Description:
//   Decides on lunch.
//
// Commands:
//   hubot yelp me * - Replies with a random yelp link to anything you search for.
//
// Configuration:
//   Currently Yelp only allows a max of 40 results.

// Author:
//   Jordan Chan <jordan@assetavenue.com>

var yelp = require('node-yelp');
var _ = require('lodash');

module.exports = (robot) => {

  var client = yelp.createClient({
    oauth: {
      "consumer_key": "xQSKK9H7wWD2kGBojduMeQ",
      "consumer_secret": "UsmGIEpuz7DR5q3-vV4TJDFUonM",
      "token": "i9_qThJY8s_5XDu9pcS4fjfTVmHy8zFn",
      "token_secret": "Gwzyzj38gbvCF6m0lwA_6VQU0KY"
    },
  });

  robot.respond(/yelp me (.*)/i, (res) => {
    var query = res.match[1];
    var limit = '20';
    var location = "1110 Glendon Ave. Los Angeles, CA";

    function search(offset) {
      return client.search({
        sort: '2',
        offset: offset,
        radius_filter: '600',
        location: location,
        limit: limit,
        term: query
      });
    };

    function feelingLucky(array) {
      return _.sample(array);
    };

    var pageOne = function () {
        return search(0).then(function (response) {
          return response.businesses;
        });
    };

    var pageTwo = function () {
      return search(20).then(function (response) {
        return response.businesses;
      });
    };

    function makeSearch() {
      Promise.all([pageOne(), pageTwo()])
        .then(function (results) {
          var firstPage = results[0];
          var secondPage = results[1];
          var allResults = firstPage.concat(secondPage);

          var urls = allResults.map(function(food) {
            return food.url;
          });

          res.send(feelingLucky(urls))

        })
        .catch(function (error) {
          console.log(error);
        });
    };

    makeSearch();

  });
};
