//  TODO: refactor out of extension and share better
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import isToday from 'dayjs/plugin/isToday';
import isYesterday from 'dayjs/plugin/isYesterday';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(isToday);
dayjs.extend(isYesterday);
dayjs.extend(advancedFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

// export function todaysIsoDate() {
//   return new Date().toISOString().split('T')[0];
// }

/*
 TODO: check if we need isoDateToLocalDate. We don't show minutes but day could be wrong
  dayjs.tz(isoDate) fails with error: 
  r.formatToParts is not a function (it is undefined)
*/

// Convert ISO date to locale date taking into account user timezone
// export function isoDateToLocalDate(isoDate: string): string {
//   return dayjs.tz(isoDate).format('YYYY-MM-DD');
// }

// This is for the seperator date
// txDate is of the form YYYY-MM-DD
export function displayDate(txDate: string): string {
  const date = dayjs(txDate);

  if (date.isToday()) return 'Today';
  if (date.isYesterday()) return 'Yesterday';
  // TODO - check if we want to show year for current year
  //   if (dayjs().isSame(date, 'year')) {
  //     return date.format('MMM Do');
  //   }
  return date.format('MMM Do, YYYY');
}
