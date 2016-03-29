'use strict';

import SunsetTime from './SunsetTime';

/**
 * Utils for generating sunset messages.
 * @module sunsetMessages
 */

/**
 * The message for trying to set a reminder when one exists.
 * @param {string} address
 * @param {string} defaultAddress
 * @returns {string}
 */
export function getExistingRoomMessage(address: string, defaultAddress: string) {
  const messageAddress = address === defaultAddress ?
    '' :
    `at ${address} test`;

  return `
    Hm, I'm already tracking sunsets for this room${messageAddress}.
    Please say "stop reminding us about sunset" if you want me to stop tracking
    here first.
  `;
};

/**
 * The message for a "when is sunset" question.
 * @param {SunsetTime} sunsetTime - a SunsetTime instance.
 * @returns {string}
 */
export function getOneTimeSunsetMessage(sunsetTime: SunsetTime): string {
  return `${sunsetTime.isTomorrow ? 'Tomorrow' : 'Tonight'}, sunset starts at ${sunsetTime.formattedTime} :sunrise_over_mountains:`;
};

/**
 * The messsage for a sunset reminder.
 */
export function getSunsetReminderMessage(formattedTime: string, minutesBeforeSunset: number): string {
  return `Sunset starts in ${minutesBeforeSunset} minutes, at ${formattedTime} :sunrise_over_mountains:`;
};

/**
 * The message for setting a sunset reminder.
 * @returns {string}
 */
export function getSunsetReminderSetMessage():string {
  return `Okay, setting sunset reminders!`;
};

/**
 * The message for removing a sunset reminder.
 * @returns {string}
 */
export function getSunsetReminderClearMessage():string {
  return `Alright, no more sunsets here...`;
};

/**
 * The message for not finding a sunset reminder to remove.
 * @returns {string}
 */
export function getSunsetReminderClearFailMessage():string {
  return `That was easy, I wasn't tracking sunsets here anyway!`;
};