import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';

dayjs.extend(advancedFormat);

const groupKeyFormat = 'YYYY-MM-DD';

export interface ActivityGroup<TItem> {
  key: string;
  label: string;
  items: TItem[];
}

export interface GroupActivityByDateOptions<TItem> {
  getTimestamp(item: TItem): number;
  now?: Date;
}

export function formatActivityDateLabel(date: Date, now: Date = new Date()): string {
  const target = dayjs(date);
  const reference = dayjs(now);
  if (target.isSame(reference, 'day')) return 'Today';
  if (target.isSame(reference.subtract(1, 'day'), 'day')) return 'Yesterday';
  if (target.isSame(reference, 'year')) return target.format('MMM Do');
  return target.format('MMM Do, YYYY');
}

export function groupActivityByDate<TItem>(
  items: TItem[],
  { getTimestamp, now = new Date() }: GroupActivityByDateOptions<TItem>
): ActivityGroup<TItem>[] {
  const groups = new Map<string, ActivityGroup<TItem>>();

  for (const item of items) {
    const date = new Date(getTimestamp(item) * 1000);
    const key = dayjs(date).format(groupKeyFormat);
    const group = groups.get(key);
    if (group) {
      group.items.push(item);
      continue;
    }
    groups.set(key, { key, label: formatActivityDateLabel(date, now), items: [item] });
  }

  return [...groups.values()];
}
