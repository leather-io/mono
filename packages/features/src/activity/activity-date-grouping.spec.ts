import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';

import {
  type DateHeaderRow,
  formatDateGroupLabel,
  getDateGroupKey,
  insertDateHeaders,
  isDateHeaderRow,
} from './activity-date-grouping';

describe('getDateGroupKey', () => {
  it('returns same key for timestamps on the same day', () => {
    const morning = dayjs().startOf('day').add(2, 'hour').unix();
    const evening = dayjs().startOf('day').add(20, 'hour').unix();
    expect(getDateGroupKey(morning)).toBe(getDateGroupKey(evening));
  });

  it('returns different keys for timestamps on different days', () => {
    const today = dayjs().startOf('day').add(12, 'hour').unix();
    const yesterday = dayjs().subtract(1, 'day').startOf('day').add(12, 'hour').unix();
    expect(getDateGroupKey(today)).not.toBe(getDateGroupKey(yesterday));
  });
});

describe('formatDateGroupLabel', () => {
  it('returns "Today" for timestamps from today', () => {
    const now = dayjs().unix();
    expect(formatDateGroupLabel(now)).toBe('Today');
  });

  it('returns "Yesterday" for timestamps from yesterday', () => {
    const yesterday = dayjs().subtract(1, 'day').startOf('day').add(12, 'hour').unix();
    expect(formatDateGroupLabel(yesterday)).toBe('Yesterday');
  });

  it('returns formatted date for older timestamps', () => {
    const older = dayjs('2024-01-15').startOf('day').add(12, 'hour').unix();
    expect(formatDateGroupLabel(older)).toBe('Jan 15, 2024');
  });
});

describe('isDateHeaderRow', () => {
  it('returns true for date header rows', () => {
    const row: DateHeaderRow = { key: 'date-123', kind: 'date-header', timestamp: 123 };
    expect(isDateHeaderRow(row)).toBe(true);
  });

  it('returns false for items without kind', () => {
    expect(isDateHeaderRow({})).toBe(false);
  });

  it('returns false for items with different kind', () => {
    expect(isDateHeaderRow({ kind: 'sbtc-deposit' })).toBe(false);
  });
});

describe('insertDateHeaders', () => {
  it('inserts date headers before groups of items on the same day', () => {
    const todayTs = dayjs().unix();
    const yesterdayTs = dayjs().subtract(1, 'day').unix();

    const items = [
      { key: 'a', timestamp: todayTs },
      { key: 'b', timestamp: todayTs },
      { key: 'c', timestamp: yesterdayTs },
    ];

    const result = insertDateHeaders(items);
    expect(result).toHaveLength(5);
    expect('kind' in result[0] && result[0].kind === 'date-header').toBe(true);
    expect(result[1]).toBe(items[0]);
    expect(result[2]).toBe(items[1]);
    expect('kind' in result[3] && result[3].kind === 'date-header').toBe(true);
    expect(result[4]).toBe(items[2]);
  });

  it('does not insert headers for items without timestamps', () => {
    const items = [{ key: 'a' }, { key: 'b' }];
    const result = insertDateHeaders(items);
    expect(result).toHaveLength(2);
  });

  it('returns empty array for empty input', () => {
    expect(insertDateHeaders([])).toEqual([]);
  });
});
