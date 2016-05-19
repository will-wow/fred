/**
 * A singelton that holds all registered natural language commands for the bot.
 * @module naturalLanguageCommander
 */

import _ = require('lodash');

import Deferred from '../Deferred';
import * as utils from './nlcUtils';
import * as standardSlots from './standardSlots';

type SlotTypeFunction = (message: string) => string;
type SlotTypeItem = string | string[] | RegExp | SlotTypeFunction;

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
  intent: IIntent;
  matcher: RegExp;
  mapping: IIntentSlot[];
}

type SlotMapping = {
  [slotName: string]: any;
}

class NaturalLanguageCommander {
  private slotTypes: SlotTypeItem[] = [];
  private intents: IIntent[] = [];
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
    const deferred = new Deferred();

    // Handle overload.
    let data: any;
    if (command) {
      data = dataOrCommand;
    } else {
      command = dataOrCommand;
    }

    // Clean up the input.
    command = this.cleanCommand(command);

    /** Flag if there was a match */
    let foundMatch: boolean = false;

    // TODO: Use nextTick here.
    _.forEach(this.matchers, (matcher: IUtteranceMatcher) => {
      const slotValues: SlotMapping = this.checkCommandForMatch(command, matcher);

      if (slotValues) {
        const orderedSlots: any[] = this.getOrderedSlots(matcher.intent, slotValues);

        if (data) {
          // Add the data as the first arg, if specified.
          orderedSlots.unshift(data);
        }

        // Call the callback with the slot values in order.
        matcher.intent.callback.apply(null, orderedSlots);
        // Resolve with the intent name, for reference.
        deferred.resolve(matcher.intent.intent);
        // Flag that a match was found.
        foundMatch = true;
        // Exit early.
        return false;
      }
    });

    // Reject if no matches.
    if (!foundMatch) {
      deferred.reject();
    }

    return deferred.promise;
  }

  /**
   * Get the slot values in the order specified by an intent.
   * @param intent - The user's intent.
   * @param slotMapping - The slot values mapped to their names.
   * @returns The ordered array of slot values.
   */
  private getOrderedSlots(intent: IIntent, slotMapping: SlotMapping): any[] {
    // Loop through the intent's slot ordering.
    return _.map(intent.slots, (slot: IIntentSlot): any => {
      // Add the slot values in order.
      return slotMapping[slot.name];
    });
  }

  /**
   * Check a command against an utterance matcher.
   * @param command - The command text.
   * @param matcher - An utternace matcher
   * @returns undefined if no match, an object of slotNames to the matched data otherwise.
   */
  private checkCommandForMatch(command: string, matcher: IUtteranceMatcher): SlotMapping {
    const matches = command.match(matcher.matcher);

    // If the command didn't match, failure.
    if (!matches) {
      return;
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
    let matchedSlots: SlotMapping = {};

    _.forEach(matcher.mapping, (slot: IIntentSlot, i: number) => {
      const slotText = matches[i];
      const slotData: any = this.checkSlotMatch(slotText, slot.type);

      // If the slot didn't match, note the bad match, and exit early.
      if (!slotData) {
        badMatch = true;
        return false;
      }

      // Associate the slot data with the name.
      matchedSlots[slot.name] = slotData;
    });

    if (!badMatch) {
      return matchedSlots;
    }
  }

  /**
   * Check text for a slotType match.
   * @param slotType - The slotType name
   * @param text - The text to match against.
   * @returns undefined if no match, otherwise the return value of the slot type.
   */
  private checkSlotMatch(slotText: string, slotTypeName: string): any {
    // Handle unknown slot types.
    if (!this.slotTypes[slotTypeName]) {
      throw new Error(`Slot Type ${slotTypeName} not found!`);
    }

    const slotType: SlotTypeItem = this.slotTypes[slotTypeName];

    // Match the slot based on the type.
    if (_.isRegExp(slotType)) {
      return this.getRegexpSlot(slotText, slotType);
    } else if (_.isString(slotType)) {
      return this.getStringSlot(slotText, slotType);
    } else if (_.isArray(slotType)) {
      return this.getListSlotType(slotText, slotType);
    } else {
      return this.getFunctionSlotType(slotText, slotType);
    }
  }

  /**
   * Check the slot text against the slot regular expression, and return the text if it matches.
   */
  private getRegexpSlot(slotText: string, slotType: RegExp): string {
    if (slotText.search(slotType)) {
      return slotText;
    }
  }

  /**
   * Check if the string matches the slotType, and return the type's string if it does.
   */
  private getStringSlot(slotText: string, slotType: string): string {
    if (slotText === slotType) {
      // Return the actual slotText if it matches directly.
      return slotText;
    } else if (slotText.toLowerCase() === slotType) {
      // If the lowercase matches, return the set type's capitaliztion.
      return slotType;
    }
  }

  /**
   * Check if the string matches the slotType function, and return the function's return value if it does.
   */
  private getFunctionSlotType(slotText: string, slotType: SlotTypeFunction): string {
    return slotType(slotText);
  }

  /**
   * Check if the string is contained in the string array, and return it if it does.
   */
  private getListSlotType(slotText: string, slotType: string[]): string {
    if (_.includes(slotType, slotText)) {
      // Return the actual slotText if it matches directly.
      return slotText;
    } else if (_.includes(slotType, slotText.toLowerCase())) {
      // If the lowercase matches, return the text's lowercase capitaliztion.
      return slotText.toLowerCase();
    }
  }

  private addUtteranceMatcher(utterance: string, intent: IIntent): void {
    const slots: IIntentSlot[] = intent.slots;
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
      intent,
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
