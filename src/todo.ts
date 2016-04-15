// Description:
//   Todo List commands
//
// Dependencies:
//
// Configuration:
//
// Commands:
//   hubot tell <user> to <something> - Add something to another user's todo list.
//   hubot put <something> on my todo list - Add something to the user's todo list.
//   hubot what do I have to do - List the users's todo list.
//   hubot what does <user> have to do - List another user's todo list.
//   hubot mark <N> done - Mark an item off the users's todo list
//   hubot mark <N> done for <user> - Mark an item off another users's todo list.
//
// Author:
//   Will Lee-Wagner <will@assetavenue.com>

import _ = require('lodash');

import personality from './lib/personality/currentPersonality';
import Todo from './lib/Todo';

export = (robot: hubot.Robot) => {
  const todo = new Todo(robot);

  robot.respond(/tell (.+) to (.+)/i, (res: hubot.Response) => {
    const user = res.match[1];
    const item = res.match[2];

    todo.add(user, item);
    res.send('kk');
  });

  robot.respond(/put (.+) on my (?:todo )?list/i, (res: hubot.Response) => {
    const user = res.message.user.name;
    const item = res.match[1];

    todo.add(user, item);
    res.send('kk');
  });

  robot.respond(/what do I have to ?do/i, (res: hubot.Response) => {
    const user = res.message.user.name;

    const list = todo.list(user);
    res.send(list.join('\n'));
  });

  robot.respond(/what does (.+) have to ?do/i, (res: hubot.Response) => {
    const user = res.match[1];

    const list = todo.list(user);
    res.send(list.join('\n'));
  });

  robot.respond(/mark #?([0-9]+) (?:as )?done for (.+)/i, (res: hubot.Response) => {
    const index = _.toNumber(res.match[1]);
    const user = res.match[2];

    if (todo.complete(user, index)) {
      res.send('kk');
    } else {
      res.send(`${index} not found for ${user}`);
    }
  });

  robot.respond(/mark #?([0-9]+) (?:as )?done$/i, (res: hubot.Response) => {
    const index = _.toNumber(res.match[1]);
    const user = res.message.user.name;

    if (todo.complete(user, index)) {
      res.send('kk');
    } else {
      res.send(`${index} not found for ${user}`);
    }
  });
};
