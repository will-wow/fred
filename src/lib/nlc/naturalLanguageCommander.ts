/**
 * A singelton that holds all registered natural language commands for the bot.
 * @module naturalLanguageCommander
 */

import _ = require('lodash');

import * as utils from './nlcUtils';
import * as standardSlots from './standardSlots';

type SlotTypeItem = string | RegExp | ((message: string) => string);

/** A slot type to be used in intents.. */
export interface ISlotType {
  /** The slot type name. */
  type: string;
  /** The associated options */
  options: SlotTypeItem | SlotTypeItem[];
}

/** A slot to associate with an intent. */
export interface IIntentSlot {
  /** The name used in the associated utterances. */
  name: string;
  /** The slot type. */
  type: string;
}

export interface IIntent {
  /** The intent name. */
  intent: string;
  /** The callback to run when the intent matches. */
  callback: ((...slots: string[]) => void) | ((data: any, ...slots: string[]) => void);
  /**
   * The slots used in the utterances. Matched text will be returned as arguments
   * to the intent callback, in order.
   */
  slots: IIntentSlot[];
  /**
   * Array of utterances to match, including slots like {SlotName}
   */
  utterances: string[] | string[][];
}

class NaturalLanguageCommander {
  private slotTypes = [];
  private intents = [];

  /** Holds registered natural language commands. */
  constructor () {
    // Add the standard slot types.
    _.forEach([standardSlots], this.addSlotType);
  }

  /**
   * Add a custom slot type. Bound to this.
   * @param slotType
   */
  public addSlotType = (slotType: ISlotType): void => {

  };

  /**
   * Register an intent. Bound to this.
   * @param intent
   */
  public registerIntent = (intent: IIntent): void => {

  };

  public handleCommand(data: any, command: string): Promise<string>;
  public handleCommand(command: string): Promise<string>;
  public handleCommand(dataOrCommand: any, command?: string): Promise<string> {
    // Handle overload.
    let data: any;
    if (command) {
      data = dataOrCommand;
    } else {
      command = dataOrCommand;
    }

    // Clean up the input.
    command = this.cleanCommand(command);
  }

  private convertSlotTypeToRegex(slotType: ISlotType) {

  }

  /**
   * Cleans up a command for processing.
   * @param command - the user's command.
   */
  private cleanCommand(command: string): string {
    return command
    // Replace smart single quotes.
    .replace(/[\u2018\u2019]/g, "'")
    // Replace smart double quotes.
    .replace(/[\u201C\u201D]/g, '"');
  }
}

export default new NaturalLanguageCommander();
