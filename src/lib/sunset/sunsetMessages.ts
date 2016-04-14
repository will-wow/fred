'use strict';

import SunsetTime from './SunsetTime';
import personality from '../personality/currentPersonality';

/**
 * Utils for generating sunset messages.
 * @module sunsetMessages
 */

/**
 * The message for trying to set a reminder when one exists.
 * @param address
 * @param defaultAddress
 */
export function getExistingRoomMessage(address: string, defaultAddress: string) {
  const messageAddress = address === defaultAddress ? undefined : address;
  return personality.current.sunsetExistingRoom(address);
};

/**
 * The message for a "when is sunset" question.
 * @param sunsetTime - a SunsetTime instance.
 */
export function getOneTimeSunsetMessage(sunsetTime: SunsetTime): string {
  return personality.current.sunsetOneTime(sunsetTime.formattedTime, sunsetTime.isTomorrow);
};

/**
 * The messsage for a sunset reminder.
 */
export function getSunsetReminderMessage(formattedTime: string, minutesBeforeSunset: number): string {
  return personality.current.sunsetReminder(formattedTime, minutesBeforeSunset);
};

/**
 * The message for setting a sunset reminder.
 */
export function getSunsetReminderSetMessage(): string {
  return personality.current.sunsetReminderSet();
};

/**
 * The message for removing a sunset reminder.
 */
export function getSunsetReminderClearMessage(): string {
  return personality.current.sunsetReminderCleared();
};

/**
 * The message for not finding a sunset reminder to remove.
 */
export function getSunsetReminderClearFailMessage(): string {
  return personality.current.sunsetReminderClearFailed();
};
