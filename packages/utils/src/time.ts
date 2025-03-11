// WARNING: When using `setTimeout` method, there is an upper maximum
// https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout#maximum_delay_value
export const oneMinInMs = 60 * 1000;
export const fiveMinInMs = 5 * oneMinInMs;
export const oneDayInMs = 24 * 60 * 60 * 1000;
export const oneWeekInMs = 7 * oneDayInMs;

export function dateToUnixTimestamp(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}
