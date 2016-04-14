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

export = (robot: hubot.Robot) => {
  // Replace smart quotes with dumb ones, so hubot can match them.
  robot.receiveMiddleware((context, next, done) => {
    context.response.message.text = context.response.message.text
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"');

    next();
  });
};
