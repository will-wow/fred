import _ = require('lodash');
const nlp = require("nlp_compromise");

import Personality from './Personality';
import {pluralize, userOrYou, usersOrYour, conjugateVerb} from './personalityUtils';

class ButlerPersonality implements Personality {
  catchAll(): string {
    return _.sample([
      `Terribly sorry, but I don't understand that. Perhaps try saying "fred help"`,
      `I'm not sure what you want. Try saying "fred help"`
    ]);
  }
  negativeResponse(): string {
    return _.sample([
      `Well I never!`,
      `Quite rude.`,
      `That is indecent.`,
      `That is improper.`,
      `Shocking.`,
      `Your mother was a hamster, and your father smelt of elderberries!`
    ]);
  }
  positiveResponse(): string {
    return _.sample([
      `Much appreciated.`,
      `Very good.`,
      `Quite right.`,
      `Yes, well, good.`
    ]);
  }

  personalityChanged(): string {
    return `I'm sure you'll be pleased to know that I'm feeling rather proper.`;
  }

  iLoveYou(love: string): string {
    return `Jolly good.`;
  }
  done(): string {
    return `It is done.`;
  };

  conferenceRoomAka(roomName: string, otherNames: string): string {
    return `I believe the peasants refer to ${roomName} as ${otherNames}.`;
  }
  conferenceRoomNotFound(name: string): string {
    return `Apologies, I don't know of any ${name} room.`;
  }
  conferenceRoomRealName(roomName): string {
    return `That is properly refered to as ${roomName}.`;
  }

  todoAddSuccess(length: number, user?: string): string {
    return `Very well, ${userOrYou(user)} now ${conjugateVerb(user, 'has')} ${length} ${pluralize('thing', length)} to do.`;
  };
  todoAddDuplicate(user?: string): string {
    return `It seems that is already on ${usersOrYour(user)} todo list. An oversight, I'm sure.`;
  };
  todoList(user?: string): string {
    return `This is what ${userOrYou(user, 'has')} to do:`;
  };
  todoListEmpty(user?: string): string {
    return `It seems ${userOrYou(user, 'has')} nothing to do. Perhaps some silver needs polishing?`;
  };
  todoCompleteSuccess(item: string, user?: string): string {
    return `Very good, ${userOrYou(user, 'has')} completed ${item}. We shall see if it is up to my standards.`;
  };
  todoCompleteNotFound(index: number | string, user?: string): string {
    const options = {
      negate: true,
      contraction: false
    };

    return `Apologies, but ${userOrYou(user, 'do', options)} have ${index} things to do.`;
  };

  wordSpellingCorrect(): string {
    return `That is spelled correctly.`;
  };
  wordSpellingNotFound(): string {
    return `I'm afraid I'm at a loss.`;
  };
  wordDefinitionNotFound(): string {
    return `I'm afraid I'm at a loss.`;
  };

  sunsetExistingRoom(address?: string): string {
    const messageAddress = address ?
      '' :
      `at ${address} test`;

    return `It seems I am already tracking sunsets for this room${messageAddress}. Do say "stop reminding us about sunset" if you want me to stop tracking here first.`;
  };
  sunsetOneTime(formattedTime: string, isTomorrow: boolean): string {
    return `${isTomorrow ? 'Tomorrow' : 'Tonight'}, sunset shall start promptly at ${formattedTime}`;
  };
  sunsetReminder(formattedTime: string, minutesBeforeSunset: number): string {
    return `Pardon me, but sunset shall be starting in ${minutesBeforeSunset} minutes, at ${formattedTime}`;
  };
  sunsetReminderSet(): string {
    return `Very good, I shall remind you of future sunsets.`;
  };
  sunsetReminderCleared(): string {
    return `As you wish, I shall cease reminding you of sunsets.`;
  };
  sunsetReminderClearFailed(): string {
    return `It seems I was already not remdinding you of sunsets. I shall continue to not do so in the future.`;
  };

  pieIsTasty(): string {
    return _.sample([
      `This would be an excellent pizza.`,
      `This would make a fine choice for lunch today.`,
      `I do believe you would enjoy this pizza.`,
    ]);
  };
  pieIsNasty(): string {
    return _.sample([
      `I do not believe you would enjoy this pizza.`,
      `If my staff had made this pizza, they would be let go immediately.`
    ]);
  };
  pieIsFine(): string {
    return _.sample([
      `This pizza would be... acceptable.`,
      `You could go get this pie, but I might suggest waiting for a better one.`
    ]);
  };
};

export default ButlerPersonality;
