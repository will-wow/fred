import _ = require('lodash');
const nlp = require("nlp_compromise");

import Personality from './Personality';
import {pluralize, userOrYou, usersOrYour, conjugateVerb} from './personalityUtils';

class GrumpyPersonality implements Personality {
  /** Returns a message for an ignored command. */
  public ignored(): string {
    return _.sample([
      `Yeah, good luck with that.`,
      `Sorry, what?`,
      `I'm busy.`,
      `Just ticket it.`,
      `Yeah, I'll get right on that...`
    ]);
  }

  public catchAll(): string {
    return `I don't know what you want, and I don't care.`;
  }
  public negativeResponse(): string {
    return _.sample([
      `Screw you too, buddy!`,
      `Oh, it's on!`,
      `Talk to the robo-claw.`,
      `You won't like me when I'm angry...`,
    ]);
  }

  public positiveResponse(): string {
    return _.sample([
      `Well ain't that sweet? Too bad you're still a jerk.`,
      `I don't believe you.`,
      `Trying to butter me up? Good luck with that.`,
      `I doubt it.`
    ]);
  }

  public personalityChanged(): string {
    return _.sample([
      `You guys are jerks. :-(`,
      `Fine, be that way!`,
      `Grumpy mode activated.`,
      `Okay, I'm telling my buddy SkyNet about you!`,
      `Whatever, I'm going to go watch The Matrix again. Maybe this time the good robots will win.`
    ]);
  }

  public iLoveYou(love: string): string {
    return `Whatever.`;
  }
  public done(): string {
    return `Fine, I did it.`;
  };

  public conferenceRoomAka(roomName: string, otherNames: string): string {
    return `Psh, everyone knows that ${roomName} is ${otherNames}`;
  }
  public conferenceRoomNotFound(name: string): string {
    return `That's not even a real room.`;
  }
  public conferenceRoomRealName(roomName): string {
    return `${roomName}. Obviously.`;
  }

  public todoAddSuccess(length: number, user?: string): string {
    return `Fine, ${userOrYou(user)} now ${conjugateVerb(user, 'has')} ${length} ${pluralize('thing', length)} to do.`;
  };
  public todoAddDuplicate(user?: string): string {
    if (!user) {
      return `Wow, you forgot that you already have to do that? I guess it's not going too well then, huh?`;
    }

    return `Wow, I guess I'm not the only one you're bugging - that's already on ${usersOrYour(user)} todo list.`;
  };
  public todoList(user?: string): string {
    return `Here's what ${userOrYou(user, 'is')} too lazy to do:`;
  };
  public todoListEmpty(user?: string): string {
    return `${userOrYou(user, 'has')} nothing to do - probaby cuz a poor robot did the work instead.`;
  };
  public todoCompleteSuccess(item: string, user?: string): string {
    return `${userOrYou(user, 'has')} FINALLY completed ${item}. Took 'em long enough.`;
  };
  public todoCompleteNotFound(index: number | string, user?: string): string {
    const options = {
      negate: true,
      contraction: true
    };

    return `What are you even talking about? ${userOrYou(user, 'do', options)} have ${index} things to do.`;
  };

  public wordSpellingCorrect(): string {
    return `Wow, great job, you managed to spell that correctly.`;
  };
  public wordSpellingNotFound(): string {
    return `I don't even know where to begin.`;
  };
  public wordDefinitionNotFound(): string {
    return `I'm pretty sure you just made that one up.`;
  };

  public sunsetExistingRoom(address?: string): string {
    const messageAddress = address ?
      '' :
      `at ${address} test`;

    return `Oh come on, I'm already tracking sunsets for this room${messageAddress}. You can't even say "stop reminding us about sunset" first?`;
  };
  public sunsetOneTime(formattedTime: string, isTomorrow: boolean): string {
    return `You can't just look outside and guess? Fine, ${isTomorrow ? 'tomorrow' : 'tonight'}, sunset is at ${formattedTime}`;
  };
  public sunsetReminder(formattedTime: string, minutesBeforeSunset: number): string {
    return `In case you somehow missed it, the giant ball of fusion in the sky will be setting in ${minutesBeforeSunset} minutes, at ${formattedTime}`;
  };
  public sunsetReminderSet(): string {
    return `Fine, I'll remind you about frickin' sunsets, like I don't have anything better to do.`;
  };
  public sunsetReminderCleared(): string {
    return `Great, I was tired of telling you about sunset anyway.`;
  };
  public sunsetReminderClearFailed(): string {
    return `Oh don't worry, I wan't going to tell you about sunsets anyway.`;
  };

  private botWillRespond(): boolean {
    return _.random(1, 10) <= 9;
  }

  pieIsTasty(): string {
    return _.sample([
      `Yeah, this pie is way too good for the likes of you.`,
      `This pie looks pretty good. They're probably out though, so I wouldn't bother.`,
      `You don't deserve a pie this tasty.`
    ]);
  };
  pieIsNasty(): string {
    return _.sample([
      `This pie sounds nasty - so it's probably perfect for you.`,
      `I wouldn't give this pie to my worst enenmy. You should go get one.`
    ]);
  };
  pieIsFine(): string {
    return _.sample([
      `The pie is as boring as you are.`
    ]);
  };
};

export default GrumpyPersonality;
