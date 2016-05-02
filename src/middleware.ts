// Description:
//   Middleware
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

import personality from './lib/personality/currentPersonality';

function messageIsCommand(robot: hubot.Robot, message: hubot.ResponseMessage): boolean {
  const text = message.text || <string>_.get(message, 'TextMessage.text');

  if (text === undefined) {
    return false;
  }

  return Boolean(text.match(robot.respondPattern('')));
}

export = (robot: hubot.Robot) => {
  // Let the bot ignore messages when grumpy.
  robot.receiveMiddleware((context, next, done) => {
    const res: hubot.Response = context.response;

    // If the command should be ignored, get the ignore message.
    const ignoredMessage = personality.checkForIgnoredCommand(res.message.room);

    // If there's no message, carry on.
    if (!ignoredMessage) {
      next();
      return;
    }

    // If the message was a command to fred:
    if (messageIsCommand(robot, res.message)) {
      // Respond with the ignore message.
      res.send(ignoredMessage);
    }

    // Don't process this command any further, so multiple listeners don't fire.
    context.response.message.finish();
    // No more middleware.
    done();
  });

  // Replace smart quotes with dumb ones, so hubot can match them.
  // robot.receiveMiddleware((context, next, done) => {
  //   // Ignore messages without text. I think this is covering a bug, I'm not sure.
  //   if (!_.get(context, 'response.message.text')) {
  //     next();
  //     return;
  //   }

  //   context.response.message.text = context.response.message.text
  //     .replace(/[\u2018\u2019]/g, "'")
  //     .replace(/[\u201C\u201D]/g, '"');

  //   next();
  // });
};
