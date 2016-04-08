// Type definitions for hubot v2.18.0
// Project: https://github.com/github/hubot
// Definitions by: Will Lee-Wagner <whentheresawill.net/>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare module hubot {

  interface ResponseMessage {
    done: boolean;
    id: string;
    room: string;
    text: string;
    user: User;
  }

  interface Response {
    /**
     * Posts a message back to the chat source
     * @param strings - One or more strings to be posted. The order of these strings should be kept intact.
     */
    send(...strings: string[]): void
    /**
     * Posts an emote back to the chat source
     * @param strings - One or more strings to be posted. The order of these strings should be kept intact.
     */
    emote(...strings: string[]): void
    /**
     * Posts a message mentioning the current user.
     * @param strings - One or more strings to be posted. The order of these strings should be kept intact.
     */
    reply(...strings: string[]): void
    /**
     * Posts a topic changing message
     * @param strings - One or more strings to set as the topic of the room the bot is in.
     */
    topic(...strings: string[]): void
    /**
     * Play a sound in the chat source
     * @param strings - One or more strings to be posted as sounds to play. The order of these strings should be kept intact.
     */
    play(...strings: string[]): void
    /**
     * Posts a message in an unlogged room
     * @param strings - One or more strings to be posted. The order of these strings should be kept intact.
     */
    locked(...strings: string[]): void
    /**
     * Picks a random item from the given items.
     * @param items - An Array of items.
     * @returns a random item.
     */
    random(items: any[]): any
    /**
     * Tell the message to stop dispatching to listeners
     */
    finish(): void


    match(): Function

    message: ResponseMessage
  }

  interface User {
    id: string
    name: string
  }

  interface Message {
    /** A User instance that sent the message. */
    user: User
    /** A String message. */
    text: string
    /** A String of the message ID. */
    id: string
    /**
     * Determines if the message matches the given regex.
     * @param regex - A Regex to check
     * @returns a Match object or null.
     */
    match(regex: RegExp): RegExpMatchArray
    /**
     * String representation of a TextMessage
     * @returns the message text
     */
    toString(): string
  }

  interface MatcherFunction { (message: Message): boolean }
  interface ResponseCallback { (res: Response): void }
  interface MiddlewareFunction { (context, next, done): void}

  interface Robot {
    name: string
    events: NodeJS.EventEmitter
    brain: Brain
    alias: boolean
    adapter: any
    Response: Response
    commands: any[]
    listners: Function[]
    middleware: Object
    logger: string
    pingIntervalId: boolean
    globalHttpOptions: Object

    /**
     * Adds a custom Listener with the provided matcher, options, and callback
     * @param matcher - A Function that determines whether to call the callback. Expected to return a truthy value if the callback should be executed.
     * @param options - An Object of additional parameters keyed on extension name
     * @param callback - A Function that is called with a Response object if the matcher function returns true.
     */
    listen(matcher: MatcherFunction, callback: ResponseCallback): void
    listen(matcher: MatcherFunction, options: Object, callback: ResponseCallback): void
    /**
     * Adds a Listener that attempts to match incoming messages based on a Regex.
     * @param regex - A Regex that determines if the callback should be called.
     * @param options - An Object of additional parameters keyed on extension name
     * @param callback - A Function that is called with a Response object.
     */
    hear(regex: RegExp, callback: ResponseCallback): void;
    hear(regex: RegExp, options: Object, callback: ResponseCallback): void
    /**
     * Public: Adds a Listener that attempts to match incoming messages directed at the robot based on a Regex. All regexes treat patterns like they begin with a '^'.
     * @param matcher - A Regex that determines if the callback should be called.
     * @param options - An Object of additional parameters keyed on extension name
     * @param callback - A Function that is called with a Response object.
     */
    respond(regex: RegExp, callback: ResponseCallback): void;
    respond(regex: RegExp, options: Object, callback: ResponseCallback): void,
    /**
     * Build a regular expression that matches messages addressed directly to the robot
     * @param regex - A RegExp for the message part that follows the robot's name/alias
     * @returns RegExp
     */
    respondPattern(regex: RegExp): RegExp

    enter(options: Object, callback: ResponseCallback): void
    leave(options: Object, callback: ResponseCallback): void
    topic(options: Object, callback: ResponseCallback): void
    error(callback: (error: Error) => void): void
    catchAll(options: Object, callback: ResponseCallback): void
    catchAll(callback: ResponseCallback): void
    listenerMiddleware(middleware: MiddlewareFunction): void,
    responseMiddleware(middleware: MiddlewareFunction): void,
    receiveMiddleware(middleware: MiddlewareFunction): void,
    receive(message: Message, cb: Function): void
    loadFile(path: string, file: string): void
    load(path: string): void
    loadHubotScripts(path: string, scripts: any[]): void
    loadExternalScripts(packages: any[]): void
    /**
     * Help Commands for Running Scripts.
     * @returns an Array of help commands for running scripts.
     */
    helpCommands(): void
    send(...strings: string[]): void
    reply(...strings: string[]): void
    /**
     * A helper send function to message a room that the robot is in.
     * @param room - String designating the room to message.
     * @param strings - One or more Strings for each message to send.
     */
    messageRoom(room: string, ...strings: string[]): void
    /**
     * A wrapper around the EventEmitter API to make usage
     * semantically better.
     * @param event - The event name.
     * @param args - A Function that is called with the event parameter when event happens.
     */
    on(event: string, ...args: any[]): void
    /**
     * A wrapper around the EventEmitter API to make usage
     * semantically better.
     * @param event - The event name.
     * @param args - A Function that is called with the event parameter when event happens.
     */
    emit(event: string, ...args: any[]): void
    /**
     * Kick off the event loop for the adapter
     */
    run(): void
    /**
     * Gracefully shutdown the robot process
     */
    shutdown(): void
    /**
     * The version of Hubot from npm
     * @returns a String of the version number.
     */
    parseVersion(): string
    /**
     * @returns a ScopedClient instance.
     */
    http(url: string, options: Object): Object
  }

  interface Brain extends NodeJS.EventEmitter {
    data: Object
    autoSave: boolean

    set(key: any, value: any): Brain
    get(key: any): any
    remove(key: any): Brain
    save(): void
    close(): void
    setAutoSave(enabled: boolean): void
    /**
     * Merge keys loaded from a DB against the in memory representation.
     * Caveats: Deeply nested structures don't merge well.
     * @param seconds - An Integer of seconds between saves.
     */
    resetSaveInterval(seconds: number): void
    mergeData(data: Object): void
    users(): User[]
    userForId(id: string, options: Object): User
    userForName(name: string): User
    usersForRawFuzzyName(fuzzyName: string): User[]
    usersForFuzzyName(fuzzyName: string): User[]
  }
}