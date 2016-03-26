'use strict';

const _ = require('lodash');
const Q = require('q');
const CronJob = require('cron').CronJob;

const ReminderBrain = require('../ReminderBrain');
const SunsetPlace = require('./SunsetPlace');
const SunsetTime = require('./SunsetTime');
const sunsetMessages = require('./sunsetMessages');

const MINUTES_BEFORE_SUNSET = 5;
/**
 * Class representing the brain's sunset reminders.
 * @extends ReminderBrain
 */
class SunsetBrain extends ReminderBrain {
  getReminderData(address) {
    return new SunsetPlace(address).promise;
  }

  getReminderTime(place) {
    const sunsetTime = new SunsetTime(place);
    const sunsetDate = new Date(); //new Date(time);

    // Use the promise for SunsetTime, so we can .catch errors down the line.
    return new SunsetTime(place).promise.then((time) => {
      return {
        time: new Date(sunsetDate.setSeconds(sunsetDate.getSeconds() + 5)), //new Date(sunsetDate.setMinutes(sunsetDate.getMinutes() - MINUTES_BEFORE_SUNSET)),
        data: sunsetTime.formattedTime
      };
    });
  }

  getReminderMessage(data, formattedTime) {
    return Q.resolve(sunsetMessages.getSunsetReminderMessage(formattedTime));
  }
}

module.exports = SunsetBrain;



