'use strict';

// Description
//   Set a sunset alert for a channel.
//
// Commands:
//  hubot remind us about sunset - Set a sunset alert for the channel.
//  hubot remind us about sunset at <address> - Set a sunset alert for the channel at the address.
//  hubot when is sunset - Reply's with today's sunset time at the default address.
//  hubot when is sunset at <address> - Reply's with today's sunset time at the address.
//
// Configuration:
//  HUBOT_SUNSET_DEFAULT_ADDRESS: required
//
// Author:
//  Will Lee-Wagner <will@assetavenue.com>

const DEFAULT_ADDRESS = process.env.HUBOT_SUNSET_DEFAULT_ADDRESS || '1100 Glendon Ave, Los Angeles, CA 90024';

import SunsetBrain = require('./lib/sunset/SunsetBrain');
import SunsetPlace = require('./lib/sunset/SunsetPlace');
import SunsetTime = require('./lib/sunset/SunsetTime');
import sunsetMessages = require('./lib/sunset/sunsetMessages');

export = (robot) => {
  // Initialize the SunsetBrain for data access.
  const sunsetBrain = new SunsetBrain(robot, 'sunsetRoomReminders');

  robot.respond(/when is sunset(?: at (.*))?\??$/i, (res) => {
    const address = res.match[1] || DEFAULT_ADDRESS;
    const sunsetPlace = new SunsetPlace(address);

    sunsetPlace.promise
    .then((place) => new SunsetTime(place).promise)
    .then((sunsetTime) => res.send(sunsetMessages.getOneTimeSunsetMessage(sunsetTime)))
    .catch((error) => res.send(error));
  });

  robot.respond(/remind us about sunset(?: at (.*))?$/i, (res) => {
    const room = res.message.room;
    const address = res.match[1] || DEFAULT_ADDRESS;

    // Handle an existing room reminder.
    if (sunsetBrain.roomHasReminder(room)) {
      res.send(sunsetMessages.getExistingRoomMessage());
      return;
    }
    sunsetBrain.setRoomReminder(room, address);
    res.send(sunsetMessages.getSunsetReminderSetMessage());
  });

  robot.respond(/stop reminding us about sunset/i, (res) => {
    const room = res.message.room;

    if (!sunsetBrain.roomHasReminder(room)) {
      res.send(sunsetMessages.getSunsetReminderClearFailMessage());
      return;
    }

    sunsetBrain.clearRoomReminder(room);
    res.send(sunsetMessages.getSunsetReminderClearMessage());
  });
};
