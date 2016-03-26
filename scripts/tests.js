'use strict';

// Description
//   Some routes for testing hubut functionality.
//
// Author:
//  Will Lee-Wagner <will@assetavenue.com>

module.exports = (robot) => {
  robot.respond(/what room is this?/i, (res) => {
    res.send(res.message.room);
  });

  robot.respond(/test room chat/i, (res) => {
    res.send('kk');

    setTimeout(function () {
      robot.messageRoom(res.message.room, 'No hashtag');
    }, 1000);
  });
};