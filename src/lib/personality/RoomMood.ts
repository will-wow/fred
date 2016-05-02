import _ = require('lodash');

import Personality, {PersonalityClass} from './Personality';
import GrumpyPersonality from './GrumpyPersonality';
import StandardPersonality from './StandardPersonality';
import ButlerPersonality from './ButlerPersonality';

/** List of available personalities. */
const personalities: PersonalityClass[] = [
  StandardPersonality,
  ButlerPersonality
];

const grumpyPersonality = new GrumpyPersonality();

class RoomMood {
  /** The rooms's current personaility. */
  public current: Personality;
  /** The class of the room's personaility, for checking against. */
  private PersonalityClass: PersonalityClass;
  /** umber of negative comments */
  private negativeCount: number = 0;
  /** Number of positive comments */
  private positiveCount: number = 0;
  /** True if teh bot is grumpy in this room  */
  private isGrumpy: boolean = false;

  /**
   * The bot's mood in a room.
   * @param NewPersonality - A new personality class to use.
   */
  constructor(
    private room: string,
    NewPersonality?: PersonalityClass
  ) {
    this.choose(NewPersonality);
  }

  /**
   * @param NewPersonality - A new personality class to use.
   */
  public choose(NewPersonality?: PersonalityClass) {
    if (!NewPersonality) {
      // Don't repeat the same personality twice.
      const filteredPersonalities = _.reject(personalities, (Personality) => Personality === this.PersonalityClass);
      // If a personality wasn't given, pick one at random.
      this.setCurrent(_.sample(filteredPersonalities));
    } else {
      // If a personality was given, use it.
      this.setCurrent(NewPersonality);
    }
  }

  public addNegative(): string {
    this.negativeCount++;
    return this.getSentimentMessage(
      this.current.negativeResponse(),
      this.updateGrumpyStatus()
    );
  }

  public addPositive(): string {
    this.positiveCount++;
    return this.getSentimentMessage(
      this.current.positiveResponse(),
      this.updateGrumpyStatus()
    );
  }

  /**
   * Will randomly return an ignored message. If not undefined,
   * ignore the command and respond with the message instead.
   */
  public checkForIgnoredCommand(): string {
    const willIgnore = this.isGrumpy && _.random(1, 10) === 10;

    if (willIgnore) {
      return grumpyPersonality.ignored();
    }
  }

  private getSentimentMessage(message: string, grumpyStatusChanged: boolean): string {
    return grumpyStatusChanged ? this.current.personalityChanged() : message;
  }

  /**
   * Update the grumpy status.
   * @returns True if the grumpy status changed.
   */
  private updateGrumpyStatus(): boolean {
    const grumpyNumber: number = this.positiveCount - this.negativeCount;

    if (!this.isGrumpy && grumpyNumber <= -10) {
      // Become grumpy.
      this.isGrumpy = true;
      this.positiveCount = 0;
      this.negativeCount = 0;
      this.setCurrent(GrumpyPersonality);
      return true;
    } else if (this.isGrumpy && grumpyNumber >= 10) {
      // Stop being grumpy.
      this.isGrumpy = false;
      this.positiveCount = 0;
      this.negativeCount = 0;
      // Change personaility
      this.choose();
      return true;
    }

    // No grumpy change.
    return false;
  }

  /**
   * Set the current personality.
   * @param NewPersonality - A new personality class to use.
   */
  private setCurrent(NewPersonality: PersonalityClass) {
    // Set the new personality.
    this.current = new NewPersonality();
    this.PersonalityClass = NewPersonality;

    // Reset other data.
    this.positiveCount = 0;
    this.negativeCount = 0;
    this.isGrumpy = NewPersonality === GrumpyPersonality;
  }
}

export default RoomMood;
