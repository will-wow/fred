'use strict';

import _ = require('lodash');
import moment = require('moment-timezone');

import ReminderBrain, {ReminderTime} from '../shared/ReminderBrain';
import PieChecker, {PieAttachment} from './PieChecker';

const NAMESPACE = 'pieOfTheDay';
const TIMEZONE = 'America/Los_Angeles';

/**
 * Get the time for a pie of the day post today.
 */
function getPieTime(): moment.Moment {
  return moment.tz(TIMEZONE).add(5, 'seconds');
  //return moment.tz(TIMEZONE).set('hour', 11).set('minute', 0).set('second', 0);
}

/**
 * Class representing the brain's pie of the day reminders.
 * @extends ReminderBrain
 */
class PieBrain extends ReminderBrain {
  private pieChecker: PieChecker;

  constructor(
    robot: hubot.Robot
  ) {
    super(robot, NAMESPACE);

    this.pieChecker = new PieChecker();
  }

  getReminderTime(): Promise<ReminderTime> {
    return Promise.resolve({
      time: getPieTime(),
      data: null
    });
  }

  getReminderMessage(room: string, data: void, formattedTime: string): Promise<string | void> {
    return this.pieChecker.getLastPie(room)
    .then((pieAttachment) => {
      console.log('pie time!', pieAttachment);

      if (this.robot.adapterName === 'slack') {
        // Emit the attachment.
        this.robot.emit('slack.attachment', pieAttachment);
        // resolve with an empty payload, so the brain doesn't do any other message.
        return;
      } else {
        return pieAttachment.fallback;
      }
    })
    .catch();
  }
}

export default PieBrain;
