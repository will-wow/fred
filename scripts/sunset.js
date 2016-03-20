'use strict';

// Description
//   Set a sunset alert for a channel.
//
// Commands:
//   hubot sunset reminder <time> - Set a sunset alert for the channel.
//   hubot sunset time? - Reply's with today's sunset time.
//
// Author:
//   Will Lee-Wagner <will@assetavenue.com>

const _ = require('lodash');
const Q = require('q');
const moment = require('moment');
var tzwhere = require('tzwhere');

const geocoderProvider = 'google';
const httpAdapter = 'http';
const geocoder = require('node-geocoder')(geocoderProvider, httpAdapter);

const SUNSET_BASE_URL = 'http://api.sunrise-sunset.org';
const SUNSET_PATH = 'json';

/**
 * Returns a promise with the place object for an address.
 * @param {string} address
 * @returns {Object} Promise with Place
 */
function getPlace(address) {
  return geocoder.geocode(address)
    .then((res) => {
      // Pull out the coordinates of the address, and format them for sunrise-sunset.org.
      const geo = {
        lat: res.latitude,
        lng: res.longitude
      };

      // Look up the timezone for the place, and save that for formatting later.
      const timezone = tzwhere.tzNameAt(geo.lat, geo.lng);

      return { geo, timezone };
    });
}

/**
 * Gets the sunset time for today.
 * @param {Object} robot - The hubot robot instance.
 * @param {Object} place - The place data.
 * @returns {Object} Promise with a moment() for the sunset time.
 */
function getSunsetTime(robot, place) {
  const deferred = Q.defer();

  robot.http(SUNSET_BASE_URL)
    .path(SUNSET_PATH)
    .header('Accept', 'application/json')
    .get(place.geo)((err, res, body) => {
      let data;

      // Handle response errors.
      if (err) {
        return deferred.reject(err);
      }

      try {
        // Parse the response.
        data = JSON.parse(body);
      }
      catch (e) {
        // Handle bad JSON.
        return deferred.reject(e);
      }

      // Resolve with the sunset time.
      // Also include the place reference, for chaing.
      deferred.resolve({
        place,
        time: body.sunset
      });
    });

   return deferred.promise;
}

/**
 * Formats a time with the timezone from a place.
 * @param {Object} place
 * @param {string} time
 */
function formatTime(place, time) {
  return moment(time).tz(place.timezone).format('h:mm a');
}

// Initialize the timezone lookup library.
tzwhere.init();

module.exports = (robot) => {
  robot.respond(/sunset time (.*)$/i, (res) => {
    const address = res.match[1];

    if (!address) {
      res.send(`Gimmie an address! I'm not psychic! Yet...`);
      return;
    }

    getPlace(address)
    .then((place) => getSunsetTime(robot, place))
    .then((data) => formatTime(data.place, data.time))
    .then((time) => res.send(`Sunset tonight is at ${time}`))
    .catch((error) => res.send(error));
  });
};