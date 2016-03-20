'use strict';

// Description
//   Set a sunset alert for a channel.
//
// Commands:
//  hubot sunset reminder <time> - Set a sunset alert for the channel.
//  hubot when is sunset - Reply's with today's sunset time at the default address.
//  hubot when is sunset at <address> - Reply's with today's sunset time at the address.
//
// Configuration:
//  HUBOT_SUNSET_DEFAULT_ADDRESS: required
//
// Author:
//  Will Lee-Wagner <will@assetavenue.com>

const _ = require('lodash');
const Q = require('q');
const moment = require('moment-timezone');
const tzwhere = require('tzwhere');

const geocoderProvider = 'google';
const httpAdapter = 'http';
const geocoder = require('node-geocoder')(geocoderProvider, httpAdapter);

const SUNSET_BASE_URL = 'http://api.sunrise-sunset.org';
const SUNSET_PATH = 'json';

const DEFAULT_ADDRESS = process.env.HUBOT_SUNSET_DEFAULT_ADDRESS || '1100 Glendon Ave, Los Angeles, CA 90024';

/**
 * Returns a promise with the place object for an address.
 * @param {string} address
 * @returns {Object} Promise with Place
 */
function getPlace(address) {

  return geocoder.geocode(address)
    .then((res) => {

      if (!res || !res[0] || !res[0].latitude || !res[0].longitude) {
        throw new Error('Address not found!');
      }

      // Pull out the coordinates of the address, and format them for sunrise-sunset.org.
      const geo = {
        lat: res[0].latitude,
        lng: res[0].longitude
      };

      // Look up the timezone for the place, and save that for formatting later.
      const timezone = tzwhere.tzNameAt(geo.lat, geo.lng);

      return { geo, timezone };
    });
}

function formatSunsetPath(place) {
  return `${SUNSET_PATH}?lat=${place.geo.lat}&lng=${place.geo.lng}&formatted=0`;
}

/**
 * Gets the sunset time for today.
 * @param {Object} robot - The hubot robot instance.
 * @param {Object} place - The place data.
 * @returns {Object} Promise with an ISO string for the sunset time, and the place for chaining.
 */
function getSunsetTime(robot, place) {
  const deferred = Q.defer();

  robot.http(SUNSET_BASE_URL)
    .path(formatSunsetPath(place))
    .header('Accept', 'application/json')
    .get(place.geo)((err, res, body) => {

      // Handle response errors.
      if (err) {
        return deferred.reject(err);
      }

      let data;
      try {
        // Parse the response.
        data = JSON.parse(body);
      }
      catch (e) {
        // Handle bad JSON.
        return deferred.reject(body);
      }

      let results = data.results;
      if (!results) {
        return deferred.reject('No sunset time found!');
      }

      deferred.resolve({
        time: results.sunset,
        place
      });
    });

   return deferred.promise;
}

/**
 * Formats a time with the timezone from a place.
 * @param {Object} place
 * @param {string} time
 * @returns {string} Time
 */
function formatTime(place, time) {
  return moment(time).tz(place.timezone).format('h:mm a');
}

// Initialize the timezone lookup library.
tzwhere.init();

module.exports = (robot) => {
  robot.respond(/when is sunset(?: at (.*))?\??$/i, (res) => {
    const address = res.match[1] || DEFAULT_ADDRESS;

    getPlace(address)
    .then((place) => getSunsetTime(robot, place))
    .then((data) => formatTime(data.place, data.time))
    .then((time) => res.send(`Tonight, sunset is at ${time}`))
    .catch((error) => res.send(error));
  });
};