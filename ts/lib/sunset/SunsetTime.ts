'use strict';

import _ = require('lodash');
import Q = require('q');
import SunCalc = require('suncalc');
import moment = require('moment-timezone');

const SUNSET_BASE_URL = 'http://api.sunrise-sunset.org';
const SUNSET_PATH = 'json';

function isValidDate(date) {
  return isFinite(date);
}

/** Represents sunset's time */
class SunsetTime {
  /**
   * @param {Object} place
   */
  constructor(place) {
    /** @private */
    this.deferred = Q.defer();

    /** @private */
    this.place = place;

    // Supports using this instance as a promise.
    this.promise = this.deferred.promise;
    this.time = undefined;
    this.isTomorrow = false;

    this._getSunsetTime();
  }

  /**
   * Time formatted with the timezone from the place.
   * @type {string}
   */
  get formattedTime() {
    return moment(this.time).tz(this.place.timezone).format('h:mm a');
  }

  /**
   * Gets the sunset time for today.
   * @private
   * @param {Object=} date - A date to calculate sunset for.
   * @param {Object} place - The place data.
   */
  _getSunsetTime() {
    const now = moment().tz(this.place.timezone);
    const results = SunCalc.getTimes(now, this.place.geo.lat, this.place.geo.lng);
    const sunset = results.sunsetStart;
    // Bad data returns an invalid date, so do nothing in that case.
    if (!isValidDate(sunset)) {
      this.deferred.reject();
      return;
    }

    // Handle any weird case where SunCalc returns tomorrow's sunset.
    // TODO: Is this nessecary?
    if (!moment(sunset).isSame(now, 'day')) {
      this.isTomorrow = true;
    }
    // Resolve with time for promise use.
    this.deferred.resolve(this);
    // Save time.
    this.time = sunset;
  }
}

export = SunsetTime;