// Description:
//   Personality commands
//
// Dependencies:
//
// Configuration:
//
// Commands:
//   hubot change personality - Change to a new random personality
//
// Author:
//   Will Lee-Wagner <will@assetavenue.com>

import _ = require('lodash');
import personality from './lib/personality/currentPersonality';

export = (robot: hubot.Robot) => {
  robot.respond(/change personality/i, (res: hubot.Response) => {
    personality.choose();

    res.send(personality.current.personalityChanged());
  });

  robot.respond(/how are you ?(?:feeling|doing)?/i, (res: hubot.Response) => {
    res.send(personality.current.personalityChanged());
  });
};
