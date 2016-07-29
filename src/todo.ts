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
import nlc from './lib/nlc/naturalLanguageCommander';

function undefinedForSelf (res: hubot.Response, user: string): string {
  return res.message.user.name === user ? undefined : user;
}

export = (robot: hubot.Robot) => {
  const todo = new Todo(robot);

  function addItem(res: hubot.Response, user: string, item: string) {
    todo.add(user, item,
      (length: number) => res.send(personality.getCurrent(res.message.room).todoAddSuccess(length, user)),
      () => res.send(personality.getCurrent(res.message.room).todoAddDuplicate(undefinedForSelf(res, user)))
    );
  }

  function listItems(res: hubot.Response, user: string) {
    todo.list(user,
      (list: TodoList) => {
        // Number the list.
        const numberedList = _.map(list, (item, index) => `${index + 1}: ${item}`);
        // Add a message to the top of the list.
        const sendList = _.flatten([personality.getCurrent(res.message.room).todoList(undefinedForSelf(res, user)), numberedList]);

        res.send(sendList.join('\n'));
      },
      () => res.send(personality.getCurrent(res.message.room).todoListEmpty(undefinedForSelf(res, user)))
    );
  }

  function markItemAsComplete(res: hubot.Response, index: number, user: string) {
    todo.complete(user, index - 1,
      (removedItem: string) => res.send(personality.getCurrent(res.message.room).todoCompleteSuccess(removedItem, undefinedForSelf(res, user))),
      () => res.send(personality.getCurrent(res.message.room).todoCompleteNotFound(index, undefinedForSelf(res, user)))
    );
  }

  // Add item for user
  nlc.registerIntent({
    intent: 'TODO_ADD_ITEM',
    slots: [
      {
        name: 'User',
        type: 'SLACK_NAME',
      },
      {
        name: 'Item',
        type: 'STRING'
      }
    ],
    callback: (res: hubot.Response, user: string, item: string) => {
      addItem(res, user || res.message.user.name, item);
    },
    utterances: [
      // Other User
      'tell {User} to {Item}',
      'remind {User} to {Item}',
      'have {User} do {Item}',
      'get {User} to {Item}',
      'make {User} {Item}',
      '{User} has to {Item}',
      'put {Item} on {User}\'s todo list',
      'put {Item} on {User}\'s list',
      // Self
      'tell me to {Item}',
      'remind me to {Item}',
      'have me {Item}',
      'get me to {Item}',
      'make me {Item}',
      'I have to {Item}',
      'put {Item} on my todo list',
      'put {Item} on my list',
    ]
  });

  // List items
  nlc.registerIntent({
    intent: 'TODO_LIST_ITEMS',
    slots: [
      {
        name: 'User',
        type: 'SLACK_NAME',
      }
    ],
    callback: (res: hubot.Response, user: string) => {
      listItems(res, user || res.message.user.name);
    },
    utterances: [
      // Other User
      'what does {User} have to do',
      'what does {User} have todo',
      'what does {User} have on my list',
      'what does {User} have on the list',
      'does {User} have anything to do?',
      'what\'s on {User}\'s todo list?',
      'what\'s on {User}\'s list?',
      // Self
      'what do I have to do',
      'what do I have todo',
      'what do I have on my list',
      'what do I have on the list',
      'do I have anything to do?',
      'what\'s on my todo list?',
      'what\'s on my list?'
    ]
  });

  // Finish item
  nlc.registerIntent({
    intent: 'TODO_FINISH_ITEM',
    slots: [
      {
        name: 'User',
        type: 'SLACK_NAME',
      },
      {
        name: 'Index',
        type: 'NUMBER'
      }
    ],
    callback: (res: hubot.Response, user: string, index: number) => {
      markItemAsComplete(res, index, user || res.message.user.name);
    },
    utterances: [
      // Other User
      'mark {Index} as done for {User}',
      'mark {Index} as complete for {User}',
      'mark {Index} as completed for {User}',
      'mark {Index} as finished for {User}',
      'set {Index} as done for {User}',
      'set {Index} as complete for {User}',
      'set {Index} as completed for {User}',
      'set {Index} as finished for {User}',
      '{Index} is done for {User}',
      '{Index} is complete for {User}',
      '{Index} is completed for {User}',
      '{Index} is finished for {User}',
      'complete {Index} for {User}',
      'finish {Index} for {User}',
      'do {Index} for {User}',
      // Self
      'mark {Index} as done',
      'mark {Index} as complete',
      'mark {Index} as completed',
      'mark {Index} as finished',
      'set {Index} as done',
      'set {Index} as complete',
      'set {Index} as completed',
      'set {Index} as finished',
      '{Index} is done',
      '{Index} is complete',
      '{Index} is completed',
      '{Index} is finished',
      'complete {Index}',
      'finish {Index}',
      'do {Index}'
    ]
  });
};
