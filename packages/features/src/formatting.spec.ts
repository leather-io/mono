import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';

import { formatSats, formatTimestamp, formatTimestampWithTime } from './formatting';

describe('formatSats', () => {
  it('formats number values correctly', () => {
    expect(formatSats(1000000)).toBe('1,000,000 sats');
  });

  it('formats string values correctly', () => {
    expect(formatSats('1000000')).toBe('1,000,000 sats');
  });

  it('handles zero', () => {
    expect(formatSats(0)).toBe('0 sats');
  });

  it('returns original for invalid values', () => {
    expect(formatSats('invalid')).toBe('invalid');
  });
});

describe('formatTimestamp', () => {
  it('formats Unix timestamp to readable date', () => {
    // 1704067200 = Jan 1, 2024 00:00:00 UTC
    const result = formatTimestamp(1704067200);
    expect(result).toContain('2024');
    expect(result).toContain('Jan');
  });
});

describe('formatTimestampWithTime', () => {
  it('formats Unix timestamp to date-time', () => {
    // 1704067200 = Jan 1, 2024 00:00:00 UTC
    const result = formatTimestampWithTime(1704067200);
    expect(result).toBe(dayjs.unix(1704067200).format('YYYY-MM-DD HH:mm'));
  });

  it('handles timestamps with non-zero time', () => {
    // 1704110400 = Jan 1, 2024 12:00:00 UTC
    const result = formatTimestampWithTime(1704110400);
    expect(result).toBe(dayjs.unix(1704110400).format('YYYY-MM-DD HH:mm'));
  });
});
