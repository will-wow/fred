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
import PieChecker, {PieAttachment} from './lib/PieChecker';

const pieChecker = new PieChecker();

export = (robot: hubot.Robot) => {
  robot.respond(/what(:?'s| is) the (?:pie of the day|pizza of the day|potd)/i, (res: hubot.Response) => {
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
};
