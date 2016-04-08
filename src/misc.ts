// Description:
//   Miscellaneous commands
//
// Dependencies:
//
// Configuration:
//
// Commands:
//   hubot what room is this? - Says what Hubot thinks the current room's name is.
//   hubot say <message> to <room> - Has the bot say a message in a room.
//
// Author:
//   Will Lee-Wagner <will@assetavenue.com>

import _ = require('lodash');

export = (robot: hubot.Robot) => {
  robot.respond(/what room is this?/i, (res: hubot.Response) => {
    res.send(res.message.room);
  });

  robot.respond(/say "(.+)" to (.+)/i, (res: hubot.Response) => {
    const message: string = res.match[1];
    const room: string = res.match[2];

    robot.messageRoom(room, message);
    res.send('Done.');
  });

  robot.hear(/I (love|like|liek)(?: you)? fred/i, (res: hubot.Response) => {
    const love: string = res.match[1];

    res.reply(`I ${love} you too`);
  });

  robot.catchAll((res) => {
    // Only respond to direct messages.
    if (_.words(res.message.text)[0] !== robot.name) {
      return;
    }

    res.send(`Sorry, I don't know what you mean! Try saying "fred help"`);
  });
};
