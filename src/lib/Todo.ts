import _ = require('lodash');

interface TodoData {
  [user: string]: TodoList;
}

export type TodoList = string[];

const TODO = 'todo';

class Todo {
  private brain: hubot.Brain;

  constructor (robot: hubot.Robot) {
    this.brain = robot.brain;
  }

  /** Returns a copy of the list, so it doesn't get mutated. */
  public list(user: string): TodoList {
    return _.clone(this.getList(user));
  }

  /**
   * Adds a todo item for a user.
   * @param user - The username
   * @param todo - The thing to do.
   */
  public add(user: string, todo: string) {
    const list = this.getList(user);
    list.push(todo);
    this.brain.save();
  }

  /**
   * Removes a todo item for a user.
   * @param user - The username
   * @param index - The index of the item to remove.
   * @returns True if there was an item to delete at that index.
   */
  public complete(user: string, index: number): boolean {
    const list = this.getList(user);

    if (!list[index]) {
      return false;
    }

    list.splice(index, 1);
    return true;
  }

  /** Get the todo list for a user. Create one if it doesn't exist. */
  private getList(user: string): TodoList {
    // Set up the brain for the first time, if nessecary.
    if (!this.brain.data[TODO]) {
      this.brain.data[TODO] = {};
    }

    const todos: TodoData = this.brain.data[TODO];

    // Set up user list if that doesn't exist.
    if (!todos[user]) {
      todos[user] = [];
    }

    return todos[user];
  }
}

export default Todo;