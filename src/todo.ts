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
import Todo, {TodoList} from './lib/Todo';

function undefinedForSelf (res: hubot.Response, user: string): string {
  return res.message.user.name === user ? undefined : user;
}

export = (robot: hubot.Robot) => {
  const todo = new Todo(robot);

  function addItem(res: hubot.Response, user: string, item: string) {
    todo.add(user, item,
      (length: number) => res.send(personality.current.todoAddSuccess(length, user)),
      () => res.send(personality.current.todoAddDuplicate(undefinedForSelf(res, user)))
    );
  }

  function listItems(res: hubot.Response, user: string) {
    todo.list(user,
      (list: TodoList) => {
        // Number the list.
        const numberedList = _.map(list, (item, index) => `${index + 1}: ${item}`);
        // Add a message to the top of the list.
        const sendList = _.flatten([personality.current.todoList(undefinedForSelf(res, user)), numberedList]);

        res.send(sendList.join('\n'));
      },
      () => res.send(personality.current.todoListEmpty(undefinedForSelf(res, user)))
    );
  }

  function markItemAsComplete(res: hubot.Response, index: string, user: string) {
    const indexNumber = _.toNumber(index);

    todo.complete(user, indexNumber - 1,
      (removedItem: string) => res.send(personality.current.todoCompleteSuccess(removedItem, undefinedForSelf(res, user))),
      () => res.send(personality.current.todoCompleteNotFound(index, undefinedForSelf(res, user)))
    );
  }

  // Add item for user
  robot.respond(/(?:tell|remind) (.+) to (.+)/i, (res: hubot.Response) => {
    const user = res.match[1];
    const item = res.match[2];

    const finalUserName: string = _.includes(['me', 'myself'], user.trim()) ?
      res.message.user.name :
      user;

    addItem(res, finalUserName, item);
  });

  // Add item for self
  robot.respond(/put (.+) on my (?:todo )?list/i, (res: hubot.Response) => {
    const user = res.message.user.name;
    const item = res.match[1];

    addItem(res, user, item);
  });

  // List items for user
  robot.respond(/what do I have to ?do/i, (res: hubot.Response) => {
    const user = res.message.user.name;

    listItems(res, user);
  });

  // List items for self
  robot.respond(/what does (.+) have to ?do/i, (res: hubot.Response) => {
    const user = res.match[1];

    listItems(res, user);
  });

  // Complete item for other user
  robot.respond(/mark #?([0-9]+) (?:as )?(?:done|complete|completed|finished) for (.+)/i, (res: hubot.Response) => {
    const index = res.match[1];
    const user = res.match[2];

    markItemAsComplete(res, index, user);
  });
  robot.respond(/(?:do|complete|finish) #?([0-9]+) for (.+)/, (res: hubot.Response) => {
    const index = res.match[1];
    const user = res.match[2];

    markItemAsComplete(res, index, user);
  });

  // Complete Item for self
  robot.respond(/mark #?([0-9]+) (?:as )?(?:done|complete|completed|finished)$/i, (res: hubot.Response) => {
    const index = res.match[1];
    const user = res.message.user.name;

    markItemAsComplete(res, index, user);
  });
  robot.respond(/(?:do|complete|finish) #?([0-9]+)/, (res: hubot.Response) => {
    const index = res.match[1];
    const user = res.message.user.name;

    markItemAsComplete(res, index, user);
  });
};
