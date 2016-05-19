/**
 * Standard slot types for the NaturalLanguageCommander
 * @module standardSlots
 */

import _ = require('lodash');
import moment = require('moment-timezone');

import nlc, {ISlotType} from './naturalLanguageCommander';
import * as utils from './nlcUtils';

const TIMEZONE = 'America/Los_Angeles';

const DATE_FORMATS = [
  'M/D/YYYY',
  'M-D-YYYY',
  'MMM D YYYY',
  'MMM D, YYYY',
  'MMMM D YYYY',
  'MMMM D, YYYY',
  'YYYY-M-D'
];

export const DATE: ISlotType = {
  type: 'DATE',
  options: (dateString: string): any => {
    /*
     * Realitive dates.
     */
    if (dateString === 'today') {
      return moment().tz(TIMEZONE).startOf('day');
    } else if (dateString === 'tomorrow') {
      return moment().tz(TIMEZONE).startOf('day').add(1, 'day');
    } else if (dateString === 'yesterday') {
      return moment().tz(TIMEZONE).startOf('day').subtract(1, 'day');
    }

    /*
     * Specific dates.
     */
    // Try parsing the date with moment.
    const parsedDate: moment.Moment = moment(dateString, DATE_FORMATS, true);
    // Retun the date if it's valid.
    if (parsedDate.isValid()) {
      return parsedDate;
    }
  }
};

export const SLACK_NAME: ISlotType = {
  type: 'SLACK_NAME',
  // Names start with @.
  options: /^@.+/i
};

export const SLACK_ROOM: ISlotType = {
  type: 'SLACK_ROOM',
  // Rooms start with #, but names work too.
  options: /[#@].+/i
};
