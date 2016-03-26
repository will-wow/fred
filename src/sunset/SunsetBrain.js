'use strict';

const _ = require('lodash');
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
    const sunsetTime = new SunsetTime(this.robot, place);

    return sunsetTime.promise
    .then((time) => {
      const sunsetDate = new Date(time);
      return {
        time: new Date(sunsetDate.setMinutes(sunsetDate.getMinutes() - MINUTES_BEFORE_SUNSET)),
        data: sunsetTime.formattedTime
      };
    });
  }

  getReminderMessage(data, formattedTime) {
    return sunsetMessages.getSunsetReminderMessage(formattedTime);
  }
}

module.exports = SunsetBrain;



