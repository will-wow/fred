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

/** Internal utterance matcher. */
interface IUtteranceMatcher {
  matcher: RegExp;
  mapping: IIntentSlot[];
}

class NaturalLanguageCommander {
  private slotTypes = [];
  private intents = [];
  private matchers: IUtteranceMatcher[] = [];

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

    // TODO: This.
    return Promise.resolve('');
  }

  /**
   * Check a command against an utterance matcher.
   * @param command - The command text.
   * @param matcher - An utternace matcher
   * @returns false if no match, an object of slotNames to the matched data otherwise.
   */
  private checkCommandForMatch(
    command: string,
    matcher: IUtteranceMatcher
  ): { [key: string]: any } | boolean {
    const matches = command.match(matcher.matcher);

    // If the command didn't match, failure.
    if (!matches) {
      return false;
    }

    // If it matched, and there are no slots, success!
    // Return an empty array of slots.
    if (matcher.mapping.length === 0) {
      return [];
    }

    // Remove the global match, we don't need it.
    matches.shift();

    // Flag if there was a bad match.
    let badMatch: boolean = false;
    /** Map the slotNames to the matched data. */
    let matchedSlots: { [key: string]: any } = {};

    _.forEach(matcher.mapping, (slot: IIntentSlot, i: number) => {
      const text = matches[i];
      const slotData: any = this.checkSlotMatch(slot.type, text);

      // If the slot didn't match, note the bad match, and exit early.
      if (!slotData) {
        badMatch = true;
        return false;
      }

      // Associate the slot data with the name.
      matchedSlots[slot.name] = slotData;
    });

    if (badMatch) {
      return false;
    } else {
      return matchedSlots;
    }
  }

  /**
   * Check text for a slotType match.
   * @param slotType - The slotType name
   * @param text - The text to match against.
   * @returns undefined if no match, otherwise the return value of the slot type.
   */
  private checkSlotMatch(slotType: string, text: string): any {

  }

  private addUtteranceMatcher(utterance: string, slots: IIntentSlot[]): void {
    const slotMapping: IIntentSlot[] = [];

    // Handle slot replacement.
    if (slots && slots.length) {
      const slotRegexp: RegExp = /{(\w+)}/g;
      const names: string[] = _.map<IIntentSlot, string>(slots, 'name');
      let matches: string[];

      // Loop while there are still slots left.
      while ((matches = slotRegexp.exec(utterance)) !== null) {
        const slotName: string = matches[1];

        if (_.includes(names, slotName)) {
          // Find where in the slot names array this slot is.
          const slotIndex: number = names.indexOf(slotName);
          // Find the matching slot type.
          const slot: IIntentSlot = slots[slotIndex];

          // Update the utterance.
          utterance = this.repaceSlotWithCaptureGroup(
            utterance,
            slotRegexp.lastIndex,
            slotName
          );
          // Record the match ordering for this slot in the utterance.
          slotMapping.push(slot);
        }
      }
    }

    utterance = this.replaceSpacesForRegexp(utterance);
    utterance = this.replaceBracesForRegexp(utterance);

    this.matchers.push({
      // Compile the regular expression, with global and ignore case.
      matcher: new RegExp(utterance, 'gi'),
      // Store the mapping for later retrieval.
      mapping: slotMapping
    });
  }

  /** Replace runs of spaces with the space character, for better matching. */
  private replaceSpacesForRegexp(utterance: string): string {
    return _.replace(utterance, /\s+/g, '\\s+');
  }

  /** Escape braces that would cause a problem with regular expressions. */
  private replaceBracesForRegexp(utterance: string): string {
    utterance
    .replace('[', '\\[')
    .replace(']', '\\]')
    .replace('(', '\\(')
    .replace(')', '\\)');

    return utterance;
  }

  private repaceSlotWithCaptureGroup(utterance: string, lastIndex: number, slotName: string): string {
    // Find the beginning of the slot name (accounting for braces).
    const firstIndex: number = lastIndex - (slotName.length + 2);

    // Replace the slot with a generic capture group.
    return utterance.slice(0, firstIndex) + '(.+)' + utterance.slice(lastIndex);
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
