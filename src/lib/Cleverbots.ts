const Cleverbot: ICleverbotClass = require("cleverbot.io");

const API_USER: string = process.env.CLEVERBOT_API_USER;
const API_KEY: string = process.env.CLEVERBOT_API_KEY;

interface ICleverbot {
  setNick(name: string): void;
  create(callback: (err: any, session: string) => void): void;
  ask(message: string, callback: (err: any, response: string) => void): void;
}

interface ICleverbotClass {
  new(user: string, key: string): ICleverbot;
}

class Cleverbots {
  private roomSessions: { [room: string]: string } = {};
  private roomCleverbots: { [room: string]: ICleverbot } = {};

  constructor (
  ) {
  }

  public ask(room: string, message: string): Promise<string> {
    return new Promise((resolve, reject): void => {
      this.getRoomBot(room)
      .then((bot: ICleverbot): void => {
        bot.ask(message, ((err: any, response: string): void => {
          if (err) {
            reject(err);
          } else {
            resolve(response);
          }
        }));
      });
    });
  }

  private getRoomBot (room: string): Promise<ICleverbot> {
    // Return the bot, if it's already initialized.
    if (this.roomCleverbots[room]) {
      return Promise.resolve(this.roomCleverbots[room]);
    } else {
      return this.getNewRoomBot(room);
    }
  }

  /**
   * Add a cleverbot instance to a room, using an existing session if
   * available.
   * @param room
   * @returns a promise with the new cleverbot instance.
   */
  private getNewRoomBot(room: string): Promise<ICleverbot> {
    /** True if the room already has a session. */
    const hasExistingSession: boolean = Boolean(this.roomSessions[room]);

    // New cleverbot
    const roomCleverbot = new Cleverbot(API_USER, API_KEY);

    // Use the existing ession.
    if (hasExistingSession) {
      roomCleverbot.setNick(this.roomSessions[room]);
    }

    return new Promise((resolve, reject): void => {
      roomCleverbot.create((err: any, session: string) => {
        if (err) {
          reject(err);
          return;
        }

        // Stash the new session.
        if (hasExistingSession) {
          this.roomSessions[room] = session;
        }

        // Save the cleverbot instance.
        this.roomCleverbots[room] = roomCleverbot;

        resolve(roomCleverbot);
      });
    });


  }
}

export default Cleverbots;
