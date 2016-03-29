// Description:
//   Miscellaneous commands
//
// Dependencies:
//
// Configuration:
//
// Commands:
//   hubot what room is this? - Says what Hubot thinks the current room's name is.
//   hubot say <message> to <room> - Has the bot say a message in a room.
//
// Author:
//   Will Lee-Wagner <will@assetavenue.com>

export = (robot: hubot.Robot) => {
  robot.respond(/what room is this?/i, (res: hubot.Response) => {
    res.send(res.message.room);
  });

  robot.respond(/say "(.+)" to (.+)/i, (res: hubot.Response) => {
    const message: string = res.match[1];
    const room: string = res.match[2];

    robot.messageRoom(room, message);
    res.send('Done.')
  });
};
