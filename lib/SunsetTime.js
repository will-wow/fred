'use strict';

const _ = require('lodash');
const Q = require('q');
const moment = require('moment-timezone');

const SUNSET_BASE_URL = 'http://api.sunrise-sunset.org';
const SUNSET_PATH = 'json';

/** Represents sunset's time */
class SunsetTime {
  /**
   * @param {Object} robot
   * @param {Object} place
   */
  constructor(robot, place) {
    /** @private */
    this.robot = robot;
    /** @private */
    this.deferred = Q.defer();

    /** @private */
    this.place = place;
    /** @private */
    this.time = undefined;

    this.promise = this.deferred.promise;
  }

  /**
   * @returns {number} Epoch time.
   */
  getTime() {
    return this.time;
  }

  /**
   * Formats the time with the timezone from the place.
   * @returns {string} Time
   */
  getFormattedTime() {
    return moment(this.time).tz(this.place.timezone).format('h:mm a');
  }

  /**
   * Gets the sunset time for today.
   * @private
   * @param {Object} robot - The hubot robot instance.
   * @param {Object} place - The place data.
   */
  _getSunsetTime() {
    console.log('this._getFormattedSunsetPath()', this._getFormattedSunsetPath());

    this.robot.http(SUNSET_BASE_URL)
    .path(this._getFormattedSunsetPath())
    .header('Accept', 'application/json')
    .get(this.place.geo)((err, res, body) => {

      // Handle response errors.
      if (err) {
        return this.deferred.reject(err);
      }

      let data;
      try {
        // Parse the response.
        data = JSON.parse(body);
      }
      catch (e) {
        // Handle bad JSON.
        return this.deferred.reject(e);
      }

      let results = data.results;
      if (!results) {
        return this.deferred.reject('No sunset time found!');
      }

      // Save time.
      this.time = results.sunset;

      this.deferred.resolve(this.time);
    });
  }

  /**
   * Construct the path for a sunset time request.
   * @private
   * @returns {string} The path
   */
  _getSunsetPath() {
    return `${SUNSET_PATH}?lat=${this.place.geo.lat}&lng=${this.place.geo.lng}&formatted=0`;
  }
}

module.exports = SunsetTime;