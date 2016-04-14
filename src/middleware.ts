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

export = (robot: hubot.Robot) => {
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
