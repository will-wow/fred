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
//   hubot what's our slogan - Say AssetAvenue's slogan
//   hubot do you want a loan - Ask for a loan
//   hubot fortune me - Give a random fortune or quote
//
// Author:
//   Will Lee-Wagner <will@assetavenue.com>

import _ = require('lodash');

import nlc from './lib/nlc/naturalLanguageCommander';
import Dictators from './lib/Dictators';

export = (robot: hubot.Robot) => {
  const dictators = new Dictators(robot);

  // Add a new dictator.
  nlc.registerIntent({
    intent: 'DICTATOR_REGISTER',
    utterances: [
      `dictator me`,
      `Add me as a dictator`,
      `Make me a dictator`
    ],
    callback: (res: hubot.Response) => {
      if (dictators.add(res.message.user.name)) {
        res.send(`All hail the new dictator!`);
      } else {
        res.send(`Good news, you're already a dictator!`);
      }
    }
  });

  // Remove a dictator.
  nlc.registerIntent({
    intent: 'DICTATOR_RESIGN',
    utterances: [
       `Remove me as a dictator`,
       `I resign as dictator`,
       `Stop making me choose lunch`,
       `Un-Trump me`,
       `Untrump me`
    ],
    callback: (res: hubot.Response) => {
      if (dictators.remove(res.message.user.name)) {
        res.send(`Okay, you're no longer a lunch dictator!`);
      } else {
        res.send(`Good news, you already weren't a dictator!`);
      }
    }
  });

  // Choose a dictator.
  nlc.registerIntent({
    intent: 'DICTATOR_CHOICE',
    utterances: [
      `Trump me`,
      `Who's picking lunch`,
      `Whos picking lunch`,
      `What's for lunch`,
      `Whats for lunch`,
      `Choose a dictator`,
      `dictator me`,
      `choose the dictator`,
      `lunch time`
    ],
    callback: (res: hubot.Response) => {
      const dictator = dictators.choose();

      if (dictator) {
        res.send(`@${dictators.choose()} is the dictator today!`);
      } else {
        res.send(`There aren't any dictators! Anarchy reigns!`);
      }
    }
  })
};
