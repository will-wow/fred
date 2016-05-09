/**
 * A sigelton that holds and sets bot's current personality.
 * @module currentPersonality
 */

import _ = require('lodash');

import RoomMood from './RoomMood';
import Personality, {PersonalityClass} from './Personality';

class CurrentPersonality {
  /** Holds the personaility for each room */
  private roomPersonalities: { [room: string]: RoomMood } = {};

  /** Handles the bot's personalities in various rooms. */
  constructor() {}

  /** Get the current personality */
  public getCurrent(room: string): Personality {
    // Set a random personality if there isn't one.
    if (!this.roomPersonalities[room]) {
      this.choose(room);
    }

    // Return the personality for the room
    return this.getCurrentRoomMood(room).current;
  }

  /**
   * Choose a personaility at random, or set one explicity
   * @param personaility - A personaility to set.
   */
  public choose(room: string, NewPersonality?: PersonalityClass): void {
    this.roomPersonalities[room] = new RoomMood(room, NewPersonality);
  }

  /** Add a negative point to the room's personaility. */
  public addNegative(room: string): string {
    const roomMood = this.getCurrentRoomMood(room);
    return roomMood.addNegative();
  }

  /** Add a positive point to the room's personaility. */
  public addPositive(room: string): string {
    const roomMood = this.getCurrentRoomMood(room);
    return roomMood.addPositive();
  }

  /**
   * Will randomly return an ignored message. If not undefined,
   * ignore the command and respond with the message instead.
   */
  public checkForIgnoredCommand(room: string): string {
    const roomMood = this.getCurrentRoomMood(room);
    return roomMood.checkForIgnoredCommand();
  }

  public isGrumpy(room: string): boolean {
    return this.roomPersonalities[room].isGrumpy;
  }

  /** Return the Mood for the room. */
  private getCurrentRoomMood(room: string): RoomMood {
    // Set a random personality if there isn't one.
    if (!this.roomPersonalities[room]) {
      this.choose(room);
    }

    // Return the mood for the room
    return this.roomPersonalities[room];
  }
}

export default new CurrentPersonality();
