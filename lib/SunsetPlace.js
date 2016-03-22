'use strict';

const _ = require('lodash');
const Q = require('q');
const tzwhere = require('tzwhere');

const geocoderProvider = 'google';
const httpAdapter = 'http';
const geocoder = require('node-geocoder')(geocoderProvider, httpAdapter);

// Initialize the timezone lookup library.
tzwhere.init();

/** Represents a place */
class SunsetPlace {

  /**
   * @param {string} address
   */
  constructor(address) {
    /** @private */
    this.deferred = Q.defer();
    this.address = address;

    this.promise = this.deferred.promise;
    this.geo = undefined;
    this.timezone = undefined;

    this.findPlace();
  }

  /**
   * @returns {Object} {geo, timezone}
   */
  getPlace() {
    return {
      geo: this.geo,
      timezone: this.timezone
    };
  }

  /**
   * Calculate the place from the address.
   * @private
   */
  findPlace() {
    return geocoder.geocode(this.address)
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

        this.geo = geo;
        this.timezone = timezone;

        this.deferred.resolve(this.getPlace());
      });
  }
}

module.exports = SunsetPlace;