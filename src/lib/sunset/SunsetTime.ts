'use strict';

import _ = require('lodash');
import moment = require('moment-timezone');
var SunCalc = require('suncalc');

import Deferred from '../Deferred';
import SunsetPlace from './SunsetPlace';

function isValidDate(date: Date) {
  return isFinite(date.valueOf());
}

/** Represents sunset's time */
class SunsetTime {
  public promise: Promise<SunsetTime>;
  public time: moment.Moment;
  public isTomorrow: boolean;
  private deferred: Deferred;
  private place: SunsetPlace;

  /**
   * @param {Object} place
   */
  constructor(place) {
    // Support using this instance as a promise.
    this.deferred = new Deferred();
    this.promise = this.deferred.promise;

    // Store the place.
    this.place = place;

    this.time = undefined;
    this.isTomorrow = false;

    this._getSunsetTime();
  }

  /**
   * Time formatted with the timezone from the place.
   */
  get formattedTime(): string {
    return this.time.format('h:mm a');
  }

  /**
   * Gets the sunset time for today.
   */
  private _getSunsetTime() {
    const now = moment.tz(this.place.timezone);
    const results = SunCalc.getTimes(now, this.place.geo.lat, this.place.geo.lng);
    const sunset = results.sunsetStart;
    // Bad data returns an invalid date, so do nothing in that case.
    if (!isValidDate(sunset)) {
      this.deferred.reject();
      return;
    }

    // Handle any weird case where SunCalc returns tomorrow's sunset.
    // TODO: Is this nessecary?
    if (!moment.tz(sunset, this.place.timezone).isSame(now, 'day')) {
      this.isTomorrow = true;
    }
    // Resolve with time for promise use.
    this.deferred.resolve(this);
    // Save time.
    this.time = moment.tz(sunset, this.place.timezone);
  }
}

export default SunsetTime;
