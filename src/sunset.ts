// Description:
//   Set a sunset alert for a channel.
//
// Commands:
//   hubot remind (us|me) about sunset - Set a sunset alert for the channel.
//   hubot remind (?:us|me) about sunset at <address> - Set a sunset alert for the channel at the address.
//   hubot when is sunset - Reply's with today's sunset time at the default address.
//   hubot when is sunset at <address> - Reply's with today's sunset time at the address.
//
// Configuration:
//   HUBOT_SUNSET_DEFAULT_ADDRESS: required
//
// Author:
//   Will Lee-Wagner <will@assetavenue.com>

const DEFAULT_ADDRESS = process.env.HUBOT_SUNSET_DEFAULT_ADDRESS || '1100 Glendon Ave, Los Angeles, CA 90024';

import SunsetBrain from './lib/sunset/SunsetBrain';
import SunsetPlace from './lib/sunset/SunsetPlace';
import SunsetTime from './lib/sunset/SunsetTime';
import * as sunsetMessages from './lib/sunset/sunsetMessages';
import {Robot} from './lib/shared/ReminderBrain';

interface HubotMessage {
  room: string
}

interface HubotRes {
  match: Function
  send: Function
  message: HubotMessage
}

export = (robot: Robot) => {
  // Initialize the SunsetBrain for data access.
  const sunsetBrain = new SunsetBrain(robot, 'sunsetRoomReminders');

  robot.respond(/when is sunset(?: at (.*))?\??$/i, (res: HubotRes) => {
    const address = res.match[1] || DEFAULT_ADDRESS;
    const sunsetPlace = new SunsetPlace(address);

    sunsetPlace.promise
    .then((place) => new SunsetTime(place).promise)
    .then((sunsetTime) => res.send(sunsetMessages.getOneTimeSunsetMessage(sunsetTime)))
    .catch((error) => res.send(error));
  });

  robot.respond(/remind (?:us|me) about sunset(?: at (.*))?$/i, (res: HubotRes) => {
    const room: string = res.message.room;
    const address: string = res.match[1] || DEFAULT_ADDRESS;

    // Handle an existing room reminder.
    if (sunsetBrain.roomHasReminder(room)) {
      res.send(sunsetMessages.getExistingRoomMessage(address, DEFAULT_ADDRESS));
      return;
    }
    sunsetBrain.setRoomReminder(room, address);
    res.send(sunsetMessages.getSunsetReminderSetMessage());
  });

  robot.respond(/stop reminding (?:us|me) about sunset/i, (res: HubotRes) => {
    const room = res.message.room;

    if (!sunsetBrain.roomHasReminder(room)) {
      res.send(sunsetMessages.getSunsetReminderClearFailMessage());
      return;
    }

    sunsetBrain.clearRoomReminder(room);
    res.send(sunsetMessages.getSunsetReminderClearMessage());
  });
};
