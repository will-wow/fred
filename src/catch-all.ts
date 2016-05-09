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
const Cleverbot = require('cleverbot-node');

import personality from './lib/personality/currentPersonality';

const cleverbot = new Cleverbot;

Cleverbot.prepare(() => {
  console.log('cleverbot ready!');
});

function delegateToCleverbot(res: hubot.Response, message: string): void {
  cleverbot.write(message, (response: string): void => {
    console.log(response);
    res.send(response['message']);
  });
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

export = (robot: hubot.Robot) => {
  robot.catchAll((res: hubot.Response) => {
    const text: string = res.message.text;

    const messageHandler: CatchAll = personality.isGrumpy(res.message.room) ? grumpyCatchAll : normalCatchAll;

    // Only respond to direct messages.
    if (_.words(text)[0] !== robot.name) {
      return;
    }

    const message: string = text.substr(text.indexOf(' ') + 1);

    // Calculate the sentiment of the statement. Negative numbers are negative sentiment.
    const sentimentScore: number = speak.sentiment.analyze(message).score;

    messageHandler(res, sentimentScore, message);
  });
};
