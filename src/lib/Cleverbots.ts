const Cleverbot: ICleverbotClass = require("cleverbot.io");
const randomstring = require("randomstring");

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
  /** Session tokens for the rooms. */
  private roomSessions: { [room: string]: string } = {};
  /** Connected cleverbots */
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
            console.log('cleverbot ask error:', response);
            reject(response);
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

    // If there's not an existing session token, generate one.
    // Note that cleverbot is supposed to do this itself, but that seems to
    // not work correctly.
    if (!hasExistingSession) {
      const session = randomstring.generate(7) + room;
      this.roomSessions[room] = session;
    }

    // Set the session to connect to previous chats.
    roomCleverbot.setNick(this.roomSessions[room]);

    return new Promise((resolve, reject): void => {
      roomCleverbot.create((err: any, session: string) => {
        if (err) {
          console.log('cleverbot create error:', err);
          reject(err);
          return;
        }

        // Save the cleverbot instance.
        this.roomCleverbots[room] = roomCleverbot;

        resolve(roomCleverbot);
      });
    });


  }
}

export default Cleverbots;
