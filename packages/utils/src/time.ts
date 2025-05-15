// WARNING: When using `setTimeout` method, there is an upper maximum
// https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout#maximum_delay_value
export const oneMinInMs = 60 * 1000;
export const fiveMinInMs = 5 * oneMinInMs;
export const oneDayInMs = 24 * 60 * 60 * 1000;
export const oneWeekInMs = 7 * oneDayInMs;

export function dateToUnixTimestamp(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

export function weeksInMs(weeks: number) {
  return daysInMs(weeks * 7);
}

export function daysInMs(days: number) {
  return hoursInMs(days * 24);
}

export function hoursInMs(hours: number) {
  return minutesInMs(hours * 60);
}

export function minutesInMs(minutes: number) {
  return secondsInMs(minutes * 60);
}

export function secondsInMs(seconds: number) {
  return seconds * 1000;
}

export function weeksInSec(weeks: number) {
  return daysInSec(weeks * 7);
}

export function daysInSec(days: number) {
  return hoursInSec(days * 24);
}

export function hoursInSec(hours: number) {
  return minutesInSec(hours * 60);
}

export function minutesInSec(minutes: number) {
  return minutes * 60;
}
