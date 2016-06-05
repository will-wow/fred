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

import nlc from './lib/nlc/naturalLanguageCommander';

let fortuneSource;

// fortune-tweetable doesn't seem to work on windows.
try {
  fortuneSource = require('fortune-tweetable');
}
catch (e) {
  fortuneSource = {
    fortune: (): string => `No fortunes found.`
  };
}

import personality from './lib/personality/currentPersonality';

export = (robot: hubot.Robot) => {
  robot.respond(/what room is this?/i, (res: hubot.Response) => {
    res.send(res.message.room);
  });

  // Say to room/user.
  nlc.registerIntent({
    intent: 'MISC_SAY_TO',
    slots: [
      {
        name: 'Message',
        type: 'STRING',
      },
      {
        name: 'Room',
        type: 'SLACK_ROOM'
      }
    ],
    callback: (res: hubot.Response, message: string, room: string) => {
      robot.messageRoom(room, message);
      res.send(personality.getCurrent(res.message.room).done());
    },
    utterances: [
      'say "{Message}" to {Room}',
      'say "{Message}" in {Room}',
      'say {Message} to {Room}',
      'say {Message} in {Room}'
    ]
  });

  // Choose a random slogan.
  nlc.registerIntent({
    intent: 'MISC_SLOGAN',
    utterances: [
      `what is AssetAvenue's slogan`,
      `what's AssetAvenue's slogan`,
      `what's our slogan`,
      `what is our slogan`
    ],
    callback: (res: hubot.Response) => {
      const SLOGANS = [
        'Sure, why not?',
        'Humans ruin everything',
        `It's pretty okay`
      ];

      res.send(_.sample(SLOGANS));
    }
  });

  // Ask for a loan
  nlc.registerIntent({
    intent: 'MISC_LOAN',
    utterances: [
      'do you want a loan',
      'are you looking for a loan',
      'what kind of loan do you want',
      'do you need financing'
    ],
    callback: (res: hubot.Response) => {
      const LOANS = [
        'Can I have like 300 bucks real quick?',
        `Can I get an $800,000 personal loan? I have terrible credit, if that helps.`,
        `I'm going to open a tattoo parlor. Can I get a loan for that?`,
        `I'm going to buy a house for $10,000, do a $50,000 rehab, and sell it for like a million bucks. Interested?`,
        `Do you guys do loans?`,
        `Yeah, I'm doing a rehab. One thing - I, the owner, am going to occupy it. Is that cool?`
      ];

      res.send(_.sample(LOANS));
    }
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

  robot.respond(/fortune me/, (res: hubot.Response) => {
    res.send(fortuneSource.fortune());
  });
  robot.respond(/tell me (?:my fortune|something)/, (res: hubot.Response) => {
    res.send(fortuneSource.fortune());
  });

  robot.hear(/light ?weight/i, (res: hubot.Response) => {
    res.send('Yeeaaah buddy!');
  });

  robot.hear(/ye+a+h buddy/i, (res: hubot.Response) => {
    res.send('Lightweight!');
  });
};
