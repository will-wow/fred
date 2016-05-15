export type PersonalityClass = {new (): Personality};

interface Personality {
  personalityChanged(): string;
  negativeResponse(): string;
  positiveResponse(): string;

  catchAll(): string;

  done(): string;
  iLoveYou(love: string): string;

  conferenceRoomAka(roomName: string, otherNames: string): string;
  conferenceRoomNotFound(name: string): string;
  conferenceRoomRealName(roomName): string;

  todoAddSuccess(length: number, user?: string): string;
  todoAddDuplicate(user?: string): string;
  todoList(user?: string): string;
  todoListEmpty(user?: string): string;
  todoCompleteSuccess(item: string, user?: string): string;
  todoCompleteNotFound(index: number | string, user?: string): string;

  wordSpellingCorrect(): string;
  wordSpellingNotFound(): string;
  wordDefinitionNotFound(): string;

  sunsetExistingRoom(address?: string): string;
  sunsetOneTime(formattedTime: string, isTomorrow: boolean): string;
  sunsetReminder(formattedTime: string, minutesBeforeSunset: number): string;
  sunsetReminderSet(): string;
  sunsetReminderCleared(): string;
  sunsetReminderClearFailed(): string;

  pieIsTasty(): string;
  pieIsNasty(): string;
  pieIsFine(): string;
};

export default Personality;
