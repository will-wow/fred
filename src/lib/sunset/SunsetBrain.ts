'use strict';

import _ = require('lodash');

import ReminderBrain, {ReminderTime} from '../shared/ReminderBrain';
import SunsetPlace from './SunsetPlace';
import SunsetTime from './SunsetTime';
import * as sunsetMessages from './sunsetMessages';

import Deferred from '../Deferred';

const MINUTES_BEFORE_SUNSET: number = 5;
/**
 * Class representing the brain's sunset reminders.
 * @extends ReminderBrain
 */
class SunsetBrain extends ReminderBrain {
  getReminderData(address: string): Promise<SunsetPlace> {
    return new SunsetPlace(address).promise;
  }

  getReminderTime(place: SunsetPlace): Promise<ReminderTime> {
    // Use the promise for SunsetTime, so we can .catch errors down the line.
    return new SunsetTime(place).promise.then((sunsetTime) => {
      const sunsetDate: moment.Moment = sunsetTime.time;

      return {
        time: sunsetDate.clone().subtract(MINUTES_BEFORE_SUNSET, 'minutes'),
        data: sunsetTime.formattedTime
      };
    });
  }

  getReminderMessage(data: any, formattedTime: string): Promise<string> {
    return Promise.resolve(sunsetMessages.getSunsetReminderMessage(formattedTime, MINUTES_BEFORE_SUNSET));
  }
}

export default SunsetBrain;



