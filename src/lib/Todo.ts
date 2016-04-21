import _ = require('lodash');

interface TodoData {
  [user: string]: TodoList;
}

export type TodoList = string[];

const TODO = 'todo';


/** Convert usernames from slack usernames, if they aren't already */
function toBaseUsername (user: string): string {
  return user[0] === '@' ? user : '@' + user;
}

class Todo {
  private brain: hubot.Brain;

  constructor (robot: hubot.Robot) {
    this.brain = robot.brain;
  }

  /**
   * Returns a copy of the list in a callback, if there is one.
   * @param user - The username
   * @param onSuccess - Callback called with the list.
   * @param onFailure - Callback if the list is empty.
   */
  public list(user: string, onSuccess: (list: TodoList) => void, onFailure: () => void): void {
    const list = this.getList(user);

    if (list.length) {
      onSuccess(_.clone(this.getList(user)));
    } else {
      onFailure();
    }
  }

  /**
   * Adds a todo item for a user.
   * @param user - The username
   * @param todo - The thing to do.
   * @param onSuccess - Callback called with the new list length.
   * @param onFailure - Callback if item already exists.
   */
  public add(user: string, todo: string, onSuccess: (length: number) => void, onFailure: () => void) {
    const list = this.getList(user);

    // Handle duplicates.
    if (_.includes(list, todo)) {
      onFailure();
      return;
    }

    list.push(todo);
    onSuccess(list.length);
  }

  /**
   * Removes a todo item for a user.
   * @param user - The username
   * @param index - The index of the item to remove.
   * @param onSuccess - Callback called with the removed item.
   * @param onFailure - Callback if there wasn't an item at that index..
   */
  public complete(user: string, index: number, onSuccess: (item: string) => void, onFailure: () => void): void {
    const list = this.getList(user);
    const item = list[index];

    if (!item) {
      onFailure();
      return;
    }

    list.splice(index, 1);
    onSuccess(item);
  }

  /** Get the todo list for a user. Create one if it doesn't exist. */
  private getList(user: string): TodoList {
    // Set up the brain for the first time, if nessecary.
    if (!this.brain.data[TODO]) {
      this.brain.data[TODO] = {};
    }

    const todos: TodoData = this.brain.data[TODO];
    const slackUser = toBaseUsername(user);

    // Set up user list if that doesn't exist.
    if (!todos[slackUser]) {
      todos[slackUser] = [];
    }

    return todos[slackUser];
  }
}

export default Todo;
