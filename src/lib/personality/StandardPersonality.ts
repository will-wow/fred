import Personality from './Personality';

class StandardPersonality implements Personality {
  public catchAll(): string {
    return `Sorry, I don't know what you mean! Try saying "fred help"`;
  }

  public personalityChanged(): string {
    return `I'm feeling kind of boring right now.`;
  }

  public iLoveYou(love: string): string {
    return `I ${love} you too`;
  }
  public done(): string {
    return `Done.`;
  };

  public conferenceRoomAka(roomName: string, otherNames: string): string {
    return `${roomName} is also known as ${otherNames}.`
  }
  public conferenceRoomNotFound(name: string): string {
    return `Sorry, even I don't know what ${name} is called!`;
  }
  public conferenceRoomRealName(roomName): string {
    return `That's ${roomName}.`;
  }

  public wordSpellingCorrect(): string {
    return `Correct!`;
  };
  public wordSpellingNotFound(): string {
    return `Sorry, I don't know how to spell that either.`;
  };
  public wordDefinitionNotFound(): string {
    return `Sorry, I'm not sure what that means either.`;
  };

  public sunsetExistingRoom(address?: string): string {
    const messageAddress = address ?
      '' :
      `at ${address} test`;

    return `Hm, I'm already tracking sunsets for this room${messageAddress}. Please say "stop reminding us about sunset" if you want me to stop tracking here first.`;
  };
  public sunsetOneTime(formattedTime: string, isTomorrow: boolean): string {
    return `${isTomorrow ? 'Tomorrow' : 'Tonight'}, sunset starts at ${formattedTime} :sunrise_over_mountains:`;
  };
  public sunsetReminder(formattedTime: string, minutesBeforeSunset: number): string {
    return `Sunset starts in ${minutesBeforeSunset} minutes, at ${formattedTime} :sunrise_over_mountains:`;
  };
  public sunsetReminderSet(): string {
    return `Okay, setting sunset reminders!`;
  };
  public sunsetReminderCleared(): string {
    return `Alright, no more sunsets here...`;
  };
  public sunsetReminderClearFailed(): string {
    return `That was easy, I wasn't tracking sunsets here anyway!`;
  };
};

export default StandardPersonality;