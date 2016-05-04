// Description:
//   Pizza of the Day commands
//
// Dependencies:
//
// Configuration:
//
// Commands:
//   hubot what's the pie of the day?
//   hubot start tracking the pie of the day
//
// Author:
//   Will Lee-Wagner <will@assetavenue.com>

import _ = require('lodash');

import personality from './lib/personality/currentPersonality';
import PieChecker, {PieAttachment} from './lib/pie/PieChecker';
import PieBrain from './lib/pie/PieBrain';

export = (robot: hubot.Robot) => {
  const pieChecker = new PieChecker();
  const pieBrain = new PieBrain(robot);

  robot.respond(/what(:?.s| is) the (?:pie of the day|pizza of the day|potd)/i, (res: hubot.Response) => {
    pieChecker.getLastPie(res.message.room)
    .then((pieAttachment: PieAttachment) => {
      if (robot.adapterName === 'slack') {
        robot.emit('slack.attachment', pieAttachment);
      } else {
        res.send(pieAttachment.fallback);
      }
    })
    .catch(() => {
      res.send('Sorry, no pie for you!');
    });
  });

  robot.respond(/start tracking (?:pie of the day|pizza of the day|potd)/i, (res: hubot.Response) => {
    pieBrain.setRoomReminder(res.message.room);
    res.send(`Okay, I'll start tracking the pie of the day here.`);
  });
};
