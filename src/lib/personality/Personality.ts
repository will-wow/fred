interface Personality {
  personalityChanged(): string;

  catchAll(): string;

  sunsetExistingRoom(address?: string): string;
  sunsetOneTime(formattedTime: string, isTomorrow: boolean): string;
  sunsetReminder(formattedTime: string, minutesBeforeSunset: number): string;
  sunsetReminderSet(): string;
  sunsetReminderCleared(): string;
  sunsetReminderClearFailed(): string;
};

export default Personality;