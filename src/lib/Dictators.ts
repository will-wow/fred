import _ = require('lodash');
import cron = require('cron');

const CronJob = cron.CronJob;

/** Class representing lunch dictators. */
class Dictators {
  namespace: string = 'dictator';
  dictators: string[];

  /**
   * Set a reminder for a room.
   * @param {Object} robot - The hubot robot reference.
   * @param {string} namespace - The namespace for the reminders in the brain.
   */
  constructor(
    public robot: hubot.Robot
  ) {
    // Get the dictators from storage, once they're loaded.
    this.robot.brain.on('loaded', this._onBrainLoaded.bind(this));
    // In case they were already loaded before we got here.
    setTimeout(() => this._onBrainLoaded(), 10000);
  }

  add(username: string): boolean {
    if (username[0] !== '@') {
      username = '@' + username;
    }

    if (_.includes(this.dictators, username)) {
      return false;
    } else {
      this.dictators.push(username);
      return true;
    }
  }

  remove(username: string): boolean {
    if (_.includes(this.dictators, username)) {
      _.pull(this.dictators, username);
      this.robot.brain.save();
      return true;
    } else {
      return false;
    }
  }

  choose(): (string | boolean) {
    if (this.dictators.length === 0) {
      return false;
    } else {
      return _.sample(this.dictators);
    }
  }

  list(): string[] {
    return this.dictators;
  }

  /**
   * Runs once the robot.brain has loaded. Puts the dictators on this.
   */
  private _onBrainLoaded(): void {
    if (this.dictators) {
      // No double setup.
      return;
    }

    // Set up the brain for the first time, if nessecary.
    if (!this.robot.brain.data[this.namespace]) {
      this.robot.brain.data[this.namespace] = [];
    }

    this.dictators = this.robot.brain.data[this.namespace];

    new CronJob({
      // Run at 11am every weekday.
      cronTime: '0 0 11 ? * MON-FRI *',
      // Choose a dictator.
      onTick: () => {
        const dictator = this.choose();

        if (dictator) {
          this.robot.messageRoom(
            'engineering',
            `All hail today's dictator: ${dictator}!`
          );
        }
      },
      // Start immediatly.
      start: true
    });
  }
}

export default Dictators;
