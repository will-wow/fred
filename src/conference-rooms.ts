// Description:
//   Miscellaneous commands
//
// Dependencies:
//
// Configuration:
//
// Commands:
//   hubot list the rooms - Print a list of the conference rooms and their nicknames.
//   hubot what is <room> called - Tells you the name of a conference room, if you know its nickname.
//
// Author:
//   Will Lee-Wagner <will@assetavenue.com>

import _ = require('lodash');

interface Rooms {
  [room: string]: string[]
};

const ROOMS: Rooms = {
  sunset: ['triangle', 'south east'],
  venice: ['workout', 'standup', 'playstation', 'couch', 'south west'],
  hollywood: ['rectangle', 'corner', 'north east'],
  mulholland: ['reception', 'other']
};

function joinRoomNames(names: string[]): string {
  // If the array has one name, return it. If it has none, return undefined.
  if (names.length <= 1) {
    return names[0];
  }

  const commaSeperatedNames = names.slice(0, names.length - 1);
  const lastName = _.last(names);

  return `${commaSeperatedNames.join(', ')} or ${lastName}`;
}

function getRoomNames(room: string, nameToExclude?: string): string {
  const names = ROOMS[room];

  if (!names) {
    return '';
  }

  const filteredNames = nameToExclude ? _.reject(names, (name) => name === nameToExclude) : names;

  return joinRoomNames(filteredNames);
}

export = (robot: hubot.Robot) => {
  robot.respond(/(?:list the rooms|what are the rooms)\??$/i, (res: hubot.Response) => {
    res.send(
`*The rooms are:*
Sunset: ${getRoomNames('sunset')}
Venice: ${getRoomNames('venice')}
Hollywood: ${getRoomNames('hollywood')}
Mulholland: ${getRoomNames('mulholland')}`
    );
  });

  robot.respond(/(?:what is|what's)(?: the)? (.+?)(?: room)? called\??$/i, (res: hubot.Response): void => {
    const name: string = res.match[1];

    // No name given.
    if (!name) {
      return res.send(`Sorry, what's that name again?`);
    }

    // The name matches one of the rooms directly.
    if (ROOMS[name]) {
      // Send the room's other names.
      return res.send(`${name} is also known as ${getRoomNames(name)}.`);
    }

    // Find the room by name.
    const roomName: string = _.findKey(ROOMS, (names: string[], key: string): boolean => {
      return _.includes(names, name);
    });

    // No room found.
    if (!roomName) {
      return res.send(`Sorry, even I don't know what ${name} is called!`);
    }

    // Room found. Return its name, and its other aliases.
    res.send(`That's ${roomName}.`);
  });
};
