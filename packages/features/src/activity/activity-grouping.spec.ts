import { describe, expect, it } from 'vitest';

import { formatActivityDateLabel, groupActivityByDate } from './activity-grouping';

const now = new Date('2026-07-28T12:00:00Z');

function atLocalNoon(isoDate: string) {
  return new Date(`${isoDate}T12:00:00`);
}

function unixSeconds(date: Date) {
  return Math.floor(date.getTime() / 1000);
}

describe('formatActivityDateLabel', () => {
  it('labels the reference day as Today', () => {
    expect(formatActivityDateLabel(now, now)).toBe('Today');
  });

  it('labels the previous day as Yesterday', () => {
    expect(formatActivityDateLabel(atLocalNoon('2026-07-27'), atLocalNoon('2026-07-28'))).toBe(
      'Yesterday'
    );
  });

  it('labels an earlier day in the same year without the year', () => {
    expect(formatActivityDateLabel(atLocalNoon('2026-07-25'), atLocalNoon('2026-07-28'))).toBe(
      'Jul 25th'
    );
  });

  it('labels a day in a prior year with the year', () => {
    expect(formatActivityDateLabel(atLocalNoon('2024-07-25'), atLocalNoon('2026-07-28'))).toBe(
      'Jul 25th, 2024'
    );
  });
});

describe('groupActivityByDate', () => {
  const items = [
    { id: 'a', timestamp: unixSeconds(atLocalNoon('2026-07-28')) },
    { id: 'b', timestamp: unixSeconds(atLocalNoon('2026-07-28')) },
    { id: 'c', timestamp: unixSeconds(atLocalNoon('2026-07-27')) },
    { id: 'd', timestamp: unixSeconds(atLocalNoon('2026-07-25')) },
  ];

  function group(input: typeof items) {
    return groupActivityByDate(input, {
      getTimestamp: item => item.timestamp,
      now: atLocalNoon('2026-07-28'),
    });
  }

  it('buckets items into one group per calendar day', () => {
    expect(group(items).map(g => g.label)).toEqual(['Today', 'Yesterday', 'Jul 25th']);
  });

  it('preserves the incoming order within a group', () => {
    expect(group(items)[0].items.map(item => item.id)).toEqual(['a', 'b']);
  });

  it('preserves the incoming order across groups and never re-sorts', () => {
    const outOfOrder = [items[3], items[0], items[2]];
    expect(group(outOfOrder).map(g => g.label)).toEqual(['Jul 25th', 'Today', 'Yesterday']);
  });

  it('returns no groups for an empty list', () => {
    expect(group([])).toEqual([]);
  });

  it('keeps pending items dated now inside the Today group', () => {
    const pending = { id: 'pending', timestamp: unixSeconds(atLocalNoon('2026-07-28')) };
    const grouped = group([pending, ...items]);
    expect(grouped[0].label).toBe('Today');
    expect(grouped[0].items.map(item => item.id)).toEqual(['pending', 'a', 'b']);
  });

  function groupWithPending(input: ((typeof items)[number] & { pending?: boolean })[]) {
    return groupActivityByDate(input, {
      getTimestamp: item => item.timestamp,
      isPending: item => item.pending === true,
      now: atLocalNoon('2026-07-28'),
    });
  }

  it('groups a stuck pending item with an old timestamp under Today instead of its own leading group', () => {
    const stuck = { id: 'stuck', timestamp: unixSeconds(atLocalNoon('2026-07-25')), pending: true };
    const grouped = groupWithPending([stuck, ...items]);
    expect(grouped.map(g => g.label)).toEqual(['Today', 'Yesterday', 'Jul 25th']);
    expect(grouped[0].items.map(item => item.id)).toEqual(['stuck', 'a', 'b']);
  });

  it('keeps confirmed items on the stuck pending date in their own later group', () => {
    const stuck = { id: 'stuck', timestamp: unixSeconds(atLocalNoon('2026-07-25')), pending: true };
    const grouped = groupWithPending([stuck, ...items]);
    expect(grouped[2].label).toBe('Jul 25th');
    expect(grouped[2].items.map(item => item.id)).toEqual(['d']);
  });

  it('groups a pending item with a zero timestamp under Today', () => {
    const noReceiptTime = { id: 'no-receipt-time', timestamp: 0, pending: true };
    const grouped = groupWithPending([noReceiptTime, ...items]);
    expect(grouped.map(g => g.label)).toEqual(['Today', 'Yesterday', 'Jul 25th']);
    expect(grouped[0].items.map(item => item.id)).toEqual(['no-receipt-time', 'a', 'b']);
  });
});
