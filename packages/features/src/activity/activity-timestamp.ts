import dayjs from 'dayjs';

import type { Activity } from '@leather.io/models';

export function formatActivityCaption({ timestamp }: Pick<Activity, 'timestamp'>) {
  const timestampMs = timestamp * 1000;
  const now = dayjs();
  const then = dayjs(timestampMs);

  const minutes = now.diff(then, 'minute');
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = now.diff(then, 'hour');
  if (hours < 24) return `${hours}h ago`;

  const days = now.diff(then, 'day');
  if (days < 30) {
    const isDifferentMonth = now.year() === then.year() && now.month() !== then.month();
    if (isDifferentMonth) {
      const calendarMonthDiff = now.year() * 12 + now.month() - (then.year() * 12 + then.month());
      return `${calendarMonthDiff}mo ago`;
    } else {
      return `${days}d ago`;
    }
  }

  const months = now.diff(then, 'month');
  if (months < 12) return `${months}mo ago`;

  const years = now.diff(then, 'year');
  return `${years}y ago`;
}
