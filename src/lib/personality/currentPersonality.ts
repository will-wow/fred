/**
 * A sigelton that holds and sets bot's current personality.
 * @module currentPersonality
 */

import _ = require('lodash');

import Personality from './Personality';
import StandardPersonality from './StandardPersonality';
import ButlerPersonality from './ButlerPersonality';

type PersonalityClass = {new (): Personality};

/** The personaility data for a room */
interface RoomPersonaility {
  /** The rooms's current personaility. */
  personality: Personality;
  /** The class of the room's personaility, for checking against. */
  PersonalityClass: PersonalityClass;
}

/** List of available personalities. */
const personalities: PersonalityClass[] = [
  StandardPersonality,
  ButlerPersonality
];

class CurrentPersonality {
  /** Holds the personaility for each room */
  private roomPersonalities: { [room: string]: RoomPersonaility } = {};

  /** Handles the bot's personality */
  constructor() {}

  /** Get the current personality */
  public getCurrent(room: string) {
    // Set a random personality if there isn't one.
    if (!this.roomPersonalities[room]) {
      this.choose(room);
    }

    // Return the personality for the room
    return this.roomPersonalities[room].personality;
  }

  /**
   * Choose a personaility at random, or set one explicity
   * @param personaility - A personaility to set.
   */
  public choose(room: string, NewPersonality?: PersonalityClass): void {
    if (!NewPersonality) {
      // Don't repeat the same personality twice.
      const filteredPersonalities = _.reject(personalities, (Personality) => {
        if (!this.roomPersonalities[room]) {
          return;
        }

        return Personality === this.roomPersonalities[room].PersonalityClass;
      });
      // If a personality wasn't given, pick one at random.
      this.setCurrent(room, _.sample(filteredPersonalities));
    } else {
      // If a personality was given, use it.
      this.setCurrent(room, NewPersonality);
    }
  }

  private setCurrent(room: string, NewPersonality: PersonalityClass): void {
    this.roomPersonalities[room] = {
      personality: new NewPersonality(),
      PersonalityClass: NewPersonality
    };
  }


}

export default new CurrentPersonality();
