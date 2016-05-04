'use strict';

import _ = require('lodash');
var tzwhere = require('tzwhere');
var geocoderModule = require('node-geocoder');

import Deferred from '../Deferred';

const geocoderProvider = 'google';
const httpAdapter = 'http';
const geocoder = geocoderModule(geocoderProvider, httpAdapter);

// Initialize the timezone lookup library.
// Wait a tick, so it doesn't mess with connecting to slack.
process.nextTick(() => tzwhere.init());

interface Geo {
  lat: string;
  lng: string;
}

/** Represents a place */
class SunsetPlace {
  public promise: Promise<SunsetPlace>
  public geo: Geo;
  public timezone: string;

  private deferred: Deferred;
  private address: string;
  /**
   * @param {string} address
   */
  constructor(address) {
    /** @private */
    this.deferred = new Deferred();
    this.address = address;

    this.promise = this.deferred.promise;

    this.findPlace();
  }

  /**
   * Calculate the place from the address.
   * @private
   */
  private findPlace() {
    return geocoder.geocode(this.address)
      .then((res) => {

        if (!res || !res[0] || !res[0].latitude || !res[0].longitude) {
          throw new Error('Address not found!');
        }

        // Pull out the coordinates of the address, and format them for sunrise-sunset.org.
        const geo: Geo = {
          lat: res[0].latitude,
          lng: res[0].longitude
        };

        // Look up the timezone for the place, and save that for formatting later.
        const timezone: string = tzwhere.tzNameAt(geo.lat, geo.lng);

        this.geo = geo;
        this.timezone = timezone;

        this.deferred.resolve(this);
      });
  }
}

export default SunsetPlace;
