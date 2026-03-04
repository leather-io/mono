import dayjs from 'dayjs';

export function getDateGroupKey(timestampSeconds: number): string {
  return dayjs(timestampSeconds * 1000)
    .startOf('day')
    .valueOf()
    .toString();
}

export function formatDateGroupLabel(timestampSeconds: number): string {
  const date = dayjs(timestampSeconds * 1000);
  const now = dayjs();
  const today = now.startOf('day');
  const yesterday = today.subtract(1, 'day');

  if (date.isAfter(today)) return 'Today';
  if (date.isAfter(yesterday)) return 'Yesterday';
  return date.format('MMM DD, YYYY');
}

export interface DateHeaderRow {
  key: string;
  kind: 'date-header';
  timestamp: number;
}

export function isDateHeaderRow(item: object): item is DateHeaderRow {
  return 'kind' in item && item.kind === 'date-header';
}

export function insertDateHeaders<T extends { key: string; timestamp?: number }>(
  items: T[]
): (T | DateHeaderRow)[] {
  const result: (T | DateHeaderRow)[] = [];
  let lastDateKey = '';

  for (const item of items) {
    const ts = item.timestamp;
    if (ts) {
      const dateKey = getDateGroupKey(ts);
      if (dateKey !== lastDateKey) {
        lastDateKey = dateKey;
        result.push({ key: `date-${dateKey}`, kind: 'date-header', timestamp: ts });
      }
    }
    result.push(item);
  }

  return result;
}
