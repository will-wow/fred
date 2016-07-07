// Description:
//   Catches unmatched commands.
//
// Dependencies:
//
// Configuration:
//
// Commands:
//
// Author:
//   Will Lee-Wagner <will@assetavenue.com>

import _ = require('lodash');
const speak = require('speakeasy-nlp');

import personality from './lib/personality/currentPersonality';
import Cleverbots from './lib/Cleverbots';
import nlc from './lib/nlc/naturalLanguageCommander';
const Response = '../node_modules/hubot/src/response';

const cleverbots = new Cleverbots;

function delegateToCleverbot(res: hubot.Response, message: string): void {
  cleverbots.ask(res.message.room, message)
  .then((response) => res.send(response))
  .catch((error) => res.send(`Sorry, I can't connect to Cleverbot right now.`));
}

type CatchAll = (res: hubot.Response, sentimentScore: number, message: string) => void;

/**
 * Handle a catchAll is normal mode by updating fred's mood, and passing the message to cleverbot.
 * @param res
 * @param sentimentScore - < 1 for negative, > 1 for positive.
 * @param message - The user's message text.
 */
function normalCatchAll(res: hubot.Response, sentimentScore: number, message: string) {
  // Silently record sentiments.
  if (sentimentScore < 0) {
    personality.addNegative(res.message.room);
  } else if (sentimentScore > 0) {
    personality.addPositive(res.message.room);
  }

  // Get a response from cleverbot.
  delegateToCleverbot(res, message);
}

/**
 * Handle a catchAll in grumpy mode by updating fred's mood, and responding accordingly.
 * @param res
 * @param sentimentScore - < 1 for negative, > 1 for positive.
 * @param message - The user's message text.
 */
function grumpyCatchAll(res: hubot.Response, sentimentScore: number) {
  if (sentimentScore === 0) {
    res.send(personality.getCurrent(res.message.room).catchAll());
  } else if (sentimentScore < 0) {
    res.send(personality.addNegative(res.message.room));
  } else {
    res.send(personality.addPositive(res.message.room));
  }
}

// Handle uncaught comamnds.
nlc.registerNotFound((res: hubot.Response) => {
  // TODO: Pass the message to the notFoundCallback, so we don't have to duplicate this.
  const text: string = res.message.text;
  const message: string = text.substr(text.indexOf(' ') + 1);

  // Handle messages differently based on if fred is grumpy or not.
  const messageHandler: CatchAll = personality.isGrumpy(res.message.room) ? grumpyCatchAll : normalCatchAll;

  // Calculate the sentiment of the statement. Negative numbers are negative sentiment.
  const sentimentScore: number = speak.sentiment.analyze(message).score;

  messageHandler(res, sentimentScore, message);
});

export = (robot: hubot.Robot) => {
  robot.catchAll((res: hubot.Response) => {
    const text: string = res.message.text;

    // Only respond to direct messages.
    if (!text.match(robot.respondPattern(''))) {
      return;
    }

    const message: string = text.substr(text.indexOf(' ') + 1);

    // Try to handle it with a natural language command.
    nlc.handleCommand(res, message);
  });
};
