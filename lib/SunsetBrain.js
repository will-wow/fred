'use strict';

const _ = require('lodash');
const CronJob = require('cron').CronJob;

const SunsetPlace = require('./SunsetPlace');
const SunsetTime = require('./SunsetTime');
const sunsetMessages = require('./sunsetMessages');

const MINUTES_BEFORE_SUNSET = 5;

/** Class representing the brain's sunset reminders. */
class SunsetBrain {

  /**
   * Set a reminder for a room.
   * @param {Object} robot - The hubot robot reference.
   */
  constructor(robot) {
    // Set up the brain for the first time, if nessecary.
    if (!robot.brain.data.sunsetRoomReminders) {
      robot.brain.data.sunsetRoomReminders = {};
    }

    this.robot = robot;
    this.reminders = robot.brain.data.sunsetRoomReminders;

    /**
     * Holds cancel functions for today's reminder jobs.
     * @private
     * @type {Object}
     */
    this.todaysReminderJobs = {};

    // Set up today's reminders on init.
    this._setTodaysReminders();
  }

  /**
   * Check if a room already has a reminder.
   * @param {string} room - The room ID
   * @returns {boolean} True if the room has a reminder.
   */
  roomHasReminder(room) {
    return Boolean(this.brain.data.sunsetRoomReminders[room]);
  }

  /**
   * Set a reminder for a room.
   * @param {string} room - The room ID
   * @param {string} address - The address for the reminder.
   */
  setRoomReminder(room, address) {
    if (this.getRoomReminder(room)) {
      return;
    }

    new SunsetPlace(address).promise
    .then((place) => {
      // Persist the reminder.
      this.brain.data.sunsetRoomReminders[room] = place;
      // Set up the chron job for today.
      this._setReminderForToday(place, room);
    });
  }

  /**
   * Turn off a room reminder.
   * @param {string} room
   */
  clearRoomReminder(room) {
    delete this.brain.data.sunsetRoomReminders[room];
    this._clearReminderForToday(room);
  }

  /**
   * Clear all reminder jobs for the day.
   * @private
   */
  _clearReminders() {
    // Clear yesterday's reminder jobs.
    _.forOwn(this.todaysReminderJobs, (place, room) => {
      this._clearReminderForToday(room);
    });

    // Clean up object.
    this.todaysReminderJobs = {};
  }

  /**
   * Set up reminder jobs for today.
   * @private
   */
  _setTodaysReminders() {
    this._clearReminders();
    // Set up new ones for today.
    _.forOwn(this.reminders, this._setReminderForToday);
  }

  /**
   * Set a reminder job for today.
   * @private
   * @param {Object} place
   * @param {string} room
   */
  _setReminderForToday(place, room) {
    // Cancel the existing job for the room, if there is one.
    if (this.todaysReminderJobs[room]) {
      this.todaysReminderJobs[room].stop();
    }

    const sunsetTime = new SunsetTime(this.robot, place);

    // Get the time for the sunset.
    sunsetTime.promise
    .then((time) => {
      const sunsetDate = new Date(time);
      const reminderDate = sunsetDate.setMinutes(sunsetDate.getMinutes() - MINUTES_BEFORE_SUNSET);

      // Set up the cron job for the sunset.
      this.todaysReminderJobs[room] = new CronJob({
        cronTime: reminderDate,
        onTick: () => {
          // Message the room with the sunset message.
          this.robot.messageRoom(room, sunsetMessages.getSunsetReminderMessage(sunsetTime.getFormattedTime()));
        },
        // Start immediatly.
        start: true
        // TODO: Does this matter when we're using a Date?
        // timeZone: this.place.timezone
      });
    });
  }

  /**
   * Unset a reminder job for today.
   * @private
   * @param {string} room
   */
  _clearReminderForToday(room) {
    this.todaysReminderJobs[room].stop();
    delete this.todaysReminderJobs[room];
  }
}

module.exports = SunsetBrain;



