import Personality from './Personality';

class ButlerPersonality implements Personality {
  public catchAll(): string {
    return `Terribly sorry, but I don't understand that. Perhaps try saying "fred help"`;
  }

  public personalityChanged(): string {
    return `I'm sure you'll be pleased to know that I'm feeling rather proper.`;
  }

  public sunsetExistingRoom(address?: string): string {
    const messageAddress = address ?
      '' :
      `at ${address} test`;

    return `It seems I am already tracking sunsets for this room${messageAddress}.
      Do say "stop reminding us about sunset" if you want me to stop tracking
      here first.`;
  };
  public sunsetOneTime(formattedTime: string, isTomorrow: boolean): string {
    return `${isTomorrow ? 'Tomorrow' : 'Tonight'}, sunset starts at ${formattedTime} :sunrise_over_mountains:`;
  };
  public sunsetReminder(formattedTime: string, minutesBeforeSunset: number): string {
    return `Sunset starts in ${minutesBeforeSunset} minutes, at ${formattedTime} :sunrise_over_mountains:`;
  };
  public sunsetReminderSet(): string {
    return `Very good, I shall remind you of future sunsets.`;
  };
  public sunsetReminderCleared(): string {
    return `As you wish, I shall cease reminding you of sunsets.`;
  };
  public sunsetReminderClearFailed(): string {
    return `It seems I was already not remdinding you of sunsets.
      I shall continue to not do so in the future.`;
  };
};

export default ButlerPersonality;