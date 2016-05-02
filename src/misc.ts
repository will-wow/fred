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
const speak = require('speakeasy-nlp');

import personality from './lib/personality/currentPersonality';

export = (robot: hubot.Robot) => {
  robot.respond(/what room is this?/i, (res: hubot.Response) => {
    res.send(res.message.room);
  });

  robot.respond(/say "(.+)" to (.+)/i, (res: hubot.Response) => {
    const message: string = res.match[1];
    const room: string = res.match[2];

    robot.messageRoom(room, message);
    res.send(personality.getCurrent(res.message.room).done());
  });

  robot.hear(/I (love|like|liek)(?: you)? fred/i, (res: hubot.Response) => {
    const love: string = res.match[1];

    res.reply(personality.getCurrent(res.message.room).iLoveYou(love));
  });

  robot.hear(/problem solved/i, (res: hubot.Response) => {
    res.reply('https://youtu.be/e3mLoFndR6M');
  });

  robot.respond(/what.s my name/i, (res: hubot.Response) => {
    res.send(res.message.user.name);
  });

  robot.respond(/what.s (.+).s name/i, (res: hubot.Response) => {
    res.send(res.match[1]);
  });

  robot.respond(/what names do you know?/i, (res: hubot.Response) => {
    const users = robot.brain.users();
    const names = _.map(users, 'name');

    res.send(names.join(', '));
  });

  robot.respond(/what do you think (?:about|of) (.+)/i, (res: hubot.Response) => {
    const message = res.match[1];

    const sentimentScore: number = speak.sentiment.analyze(message).score;

    if (sentimentScore === 0) {
      res.send('Meh.');
    } else if (sentimentScore < 0) {
      res.send('How rude!');
    } else {
      res.send('How nice!');
    }
  });

  robot.catchAll((res) => {
    // Only respond to direct messages.
    if (_.words(res.message.text)[0] !== robot.name) {
      return;
    }

    // Calculate the sentiment of the statement. Negative numbers are negative sentiment.
    const sentimentScore: number = speak.sentiment.analyze(res.message.text).score;

    if (sentimentScore === 0) {
      res.send(personality.getCurrent(res.message.room).catchAll());
    } else if (sentimentScore < 0) {
      res.send('How rude!');
    } else {
      res.send('How nice!');
    }
  });
};
