// Description:
//   Miscellaneous commands
//
// Dependencies:
//
// Configuration:
//
// Commands:
//   hubot what room is this? - Says what Hubot thinks the room's name is.
//   hubot say <message> to <room> - Has the bot say a message in a room.
//
// Author:
//   Will Lee-Wagner <will@assetavenue.com>

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
  robot.respond(/what room is this?/i, (res: HubotRes) => {
    res.send(res.message.room);
  });

  robot.respond(/say "(.+)" to (.+)/i, (res: HubotRes) => {
    const message: string = res.match[1];
    const room: string = res.match[2];

    robot.messageRoom(room, message);
  });


};
