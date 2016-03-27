'use strict';

import _ = require('lodash');
import Q = require('q');
import cron = require('cron');

const CronJob = cron.CronJob;

/** Class representing daily reminders to a room. */
class ReminderBrain {

  /**
   * Set a reminder for a room.
   * @param {Object} robot - The hubot robot reference.
   * @param {string} namespace - The namespace for the reminders in the brain.
   */
  constructor(robot, namespace) {
    this.robot = robot;
    // Get data from the opts object
    this.namespace = namespace;

    // Get the reminders from storage, once they're loaded.
    this.robot.brain.on("loaded", this._onBrainLoaded.bind(this));
    // In case they were already loaded before we got here.
    this._onBrainLoaded();

    // Will be populated with the brain's reminders data by _setupStorage().
    this.reminders = undefined;

    /**
     * Holds cancel functions for today's reminder jobs.
     * @private
     * @type {Object}
     */
    this.todaysReminderJobs = {};

    this._setupDailyCron();
  }

  /**
   * Gets the data nessecary for calculating daily reminder times, which will be persisted.
   * If not overridden, persist no data.
   * @returns {Object} A promise with the data.
   */
  getReminderData(data) {
    return Q.resolve();
  }

  /**
   * Gets the time for a reminder.
   * It should return a promise, resolved with an object {time, data}.
   * Time is the time as a Date, and data is any associated data, to be passed to getReminderMessage,
   * like the formatted version of the time.
   * @abstract
   * @returns {Object} A promise with a the time data.
   */
  getReminderTime(data) {
    throw new Error('You must implement getReminderTime');
  }

  /**
   * Gets the message for a reminder. Called at reminder time.
   * @abstract
   * @param {Object} data - The data from getReminderData.
   * @param {any} timeData - The data from getReminderTime.
   * @returns {Object} A promise with the message.
   */
  getReminderMessage(data, timeData) {
    throw new Error('You must implement getReminderData');
  }

  /**
   * Check if a room already has a reminder.
   * @param {string} room - The room ID
   * @returns {boolean} True if the room has a reminder.
   */
  roomHasReminder(room) {
    return Boolean(this.reminders[room]);
  }

  /**
   * Set a reminder for a room.
   * @param {string} room - The room ID
   * @param {any} data - The data to pass to the reminder.
   */
  setRoomReminder(room, data) {
    this.getReminderData(data)
    .then((reminderData) => {
      // Set up the chron job for today.
      this._setReminderForToday(reminderData, room);
      // Persist the reminder.
      this.reminders[room] = reminderData;
    });
  }

  /**
   * Turn off a room reminder.
   * @param {string} room
   */
  clearRoomReminder(room) {
    delete this.reminders[room];
    this._clearReminderForToday(room);
  }

  /**
   * Runs once the robot.brain has loaded. Puts the reminders on this,
   * and sets up jobs for any exisitng reminders.
   */
  _onBrainLoaded() {
    if (this.reminders) {
      // No double setup.
      return;
    }

    // Set up the brain for the first time, if nessecary.
    if (!this.robot.brain.data[this.namespace]) {
      this.robot.brain.data[this.namespace] = {};
    }

    // Stash the reminders on this for easy access.
    this.reminders = this.robot.brain.data[this.namespace];

    // Set up today's reminders, since this is run when the robot boots up.
    this._setTodaysReminders();
  }

  /**
   * Sets up cron job to check for sunsets every day. The job should only every fire
   * for robots that stay up all night (so aren't on a free Heroku plan).
   */
  _setupDailyCron() {
    new CronJob({
      // Run at 1am every day.
      cronTime: '0 0 1 * * *',
      onTick: this._setTodaysReminders.bind(this),
      // Start immediatly.
      start: true
    });
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
    _.forOwn(this.reminders, this._setReminderForToday.bind(this));
  }

  /**
   * Set a reminder job for today.
   * @private
   * @param {any} data
   * @param {string} room
   */
  _setReminderForToday(data, room) {
    // Cancel the existing job for the room, if there is one.
    if (this.todaysReminderJobs[room]) {
      this.todaysReminderJobs[room].stop();
    }

    this.getReminderTime(data)
    .then((timeData) => {
      // Set up the cron job for the reminder.
      this.todaysReminderJobs[room] = new CronJob({
        cronTime: timeData.time,
        onTick: () => {
          // Get the message.
          this.getReminderMessage(data, timeData.data)
          .then((message) => {
            // Message the room.
            this.robot.messageRoom(room, message);
          });
        },
        // Start immediatly.
        start: true
      });
    });

  }

  /**
   * Unset a reminder job for today.
   * @private
   * @param {string} room
   */
  _clearReminderForToday(room) {
    if (!this.todaysReminderJobs[room]) {
      return;
    }

    this.todaysReminderJobs[room].stop();
    delete this.todaysReminderJobs[room];
  }
}

export = ReminderBrain;
