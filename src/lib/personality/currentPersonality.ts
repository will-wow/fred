/**
 * A sigelton that holds and sets bot's current personality.
 * @module currentPersonality
 */

import _ = require('lodash');

import Personality from './Personality';
import StandardPersonality from './StandardPersonality';
import ButlerPersonality from './ButlerPersonality';

type PersonalityClass = {new (): Personality};

/** List of available personalities. */
const personalities: PersonalityClass[] = [
  StandardPersonality,
  ButlerPersonality
];

class CurrentPersonality {
  /** The bot's current personaility. */
  public current: Personality;
  /** The class of the current personaility, for checking against. */
  private Current: PersonalityClass;

  constructor() {
    // Randomly choose a personality on start.
    this.choose();
  }

  /**
   * Choose a personaility at random, or set one explicity
   * @param personaility - A personaility to set.
   */
  public choose(NewPersonality?: PersonalityClass): void {
    if (!NewPersonality) {
      // Don't repeat the same personality twice.
      const filteredPersonalities = _.reject(personalities, (Personality) => Personality === this.Current);
      // If a personality wasn't given, pick one at random.
      this.setCurrent(_.sample(filteredPersonalities));
    } else {
      // If a personality was given, use it.
      this.setCurrent(NewPersonality);
    }
  }

  private setCurrent(NewPersonality: PersonalityClass): void {
    this.Current = NewPersonality;
    this.current = new NewPersonality();
  }
}

export default new CurrentPersonality();