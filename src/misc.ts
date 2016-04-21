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

import personality from './lib/personality/currentPersonality';

export = (robot: hubot.Robot) => {
  robot.respond(/what room is this?/i, (res: hubot.Response) => {
    res.send(res.message.room);
  });

  robot.respond(/say "(.+)" to (.+)/i, (res: hubot.Response) => {
    const message: string = res.match[1];
    const room: string = res.match[2];

    robot.messageRoom(room, message);
    res.send(personality.current.done());
  });

  robot.hear(/I (love|like|liek)(?: you)? fred/i, (res: hubot.Response) => {
    const love: string = res.match[1];

    res.reply(personality.current.iLoveYou(love));
  });

  robot.hear(/problem solved/i, (res: hubot.Response) => {
    res.reply('https://youtu.be/e3mLoFndR6M');
  });

  robot.catchAll((res) => {
    // Only respond to direct messages.
    if (_.words(res.message.text)[0] !== robot.name) {
      return;
    }

    res.send(personality.current.catchAll());
  });

  robot.respond(/what.s my name/, (res: hubot.Response) => {
    res.send(res.message.user.name);
  });

  robot.respond(/what.s (.+).s name/, (res: hubot.Response) => {
    res.send(res.match[1]);
  });

  robot.respond(/what names do you know?/, (res: hubot.Response) => {
    const users = robot.brain.users();
    const names = _.map(users, 'name');

    res.send(names.join(', '));
  });
};
