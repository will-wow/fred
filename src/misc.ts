// Description:
//   Miscellaneous commands
//
// Dependencies:
//
// Configuration:
//
// Commands:
//   hubot tell me something - Say a random joke or something else from fortune.
//   hubot what room is this? - Says what Hubot thinks the current room's name is.
//   hubot say <message> to <room> - Has the bot say a message in a room.
//
// Author:
//   Will Lee-Wagner <will@assetavenue.com>

import _ = require('lodash');
const speak = require('speakeasy-nlp');
const fortuneSource = require('fortune-tweetable');

import personality from './lib/personality/currentPersonality';

export = (robot: hubot.Robot) => {
  robot.respond(/what room is this?/i, (res: hubot.Response) => {
    res.send(res.message.room);
  });

  robot.respond(/say (.+) to (.+)/i, (res: hubot.Response) => {
    const message: string = res.match[1];
    const room: string = res.match[2];

    robot.messageRoom(room, message);
    res.send(personality.getCurrent(res.message.room).done());
  });

  robot.hear(/I (love|like|liek)(?: you)? fred/i, (res: hubot.Response) => {
    const love: string = res.match[1];

    personality.addPositive(res.message.room);

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

  robot.respond(/what adapter is this/i, (res: hubot.Response) => {
    res.send(robot.adapterName);
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

  // This is just returning a 508 right now :-(
  robot.respond(/pun me (.+)/, (res: hubot.Response) => {
    const word = res.match[1];

    robot.http(`http://dadjokes.org/pun/${word}/json`)
    .get()((err, getRes, body) => {
      if (err) {
        res.send('Something went wrong :-(');
        return;
      }

      let pun;

      try {
        pun = JSON.parse(body).pun;
      }
      catch (e) {
        res.send('Something went wrong :-(');
        return;
      }

      if (pun) {
        res.send(pun);
      } else {
        res.send(`That's not punny.`);
      }
    });
  });

  robot.respond(/(?:joke|fortune) me/, (res: hubot.Response) => {
    res.send(fortuneSource.fortune());
  });
  robot.respond(/tell me (?:a joke|my fortune|something)/, (res: hubot.Response) => {
    res.send(fortuneSource.fortune());
  });

  robot.hear(/light ?weight/i, (res: hubot.Response) => {
    res.send('Yeeaaah buddy!');
  });

  robot.hear(/ye+a+h buddy/i, (res: hubot.Response) => {
    res.send('Lightweight!');
  });
};
