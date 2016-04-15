interface Personality {
  personalityChanged(): string;

  catchAll(): string;

  done(): string;
  iLoveYou(love: string): string;

  conferenceRoomAka(roomName: string, otherNames: string): string ;
  conferenceRoomNotFound(name: string): string;
  conferenceRoomRealName(roomName): string;

  wordSpellingCorrect(): string;
  wordSpellingNotFound(): string;
  wordDefinitionNotFound(): string;

  sunsetExistingRoom(address?: string): string;
  sunsetOneTime(formattedTime: string, isTomorrow: boolean): string;
  sunsetReminder(formattedTime: string, minutesBeforeSunset: number): string;
  sunsetReminderSet(): string;
  sunsetReminderCleared(): string;
  sunsetReminderClearFailed(): string;
};

export default Personality;