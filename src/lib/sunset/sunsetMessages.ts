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
export function getExistingRoomMessage(room, address: string, defaultAddress: string) {
  const messageAddress = address === defaultAddress ? undefined : address;
  return personality.getCurrent(room).sunsetExistingRoom(address);
};

/**
 * The message for a "when is sunset" question.
 * @param sunsetTime - a SunsetTime instance.
 */
export function getOneTimeSunsetMessage(room, sunsetTime: SunsetTime): string {
  return personality.getCurrent(room).sunsetOneTime(sunsetTime.formattedTime, sunsetTime.isTomorrow);
};

/**
 * The messsage for a sunset reminder.
 */
export function getSunsetReminderMessage(room, formattedTime: string, minutesBeforeSunset: number): string {
  return personality.getCurrent(room).sunsetReminder(formattedTime, minutesBeforeSunset);
};

/**
 * The message for setting a sunset reminder.
 */
export function getSunsetReminderSetMessage(room): string {
  return personality.getCurrent(room).sunsetReminderSet();
};

/**
 * The message for removing a sunset reminder.
 */
export function getSunsetReminderClearMessage(room): string {
  return personality.getCurrent(room).sunsetReminderCleared();
};

/**
 * The message for not finding a sunset reminder to remove.
 */
export function getSunsetReminderClearFailMessage(room): string {
  return personality.getCurrent(room).sunsetReminderClearFailed();
};
