import { describe, expect, it, vi } from 'vitest';

import { formatActivityCaption } from './activity-timestamp';

function createTimestamp(minutesAgo: number) {
  return Math.floor((Date.now() - minutesAgo * 60 * 1000) / 1000);
}

describe('activity-timestamp', () => {
  describe('formatActivityCaption', () => {
    it('formats recent timestamps as minutes ago', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-01T12:00:00.000Z'));

      expect(formatActivityCaption({ timestamp: createTimestamp(5) })).toBe('5 minutes ago');
      expect(formatActivityCaption({ timestamp: createTimestamp(15) })).toBe('15 minutes ago');
      expect(formatActivityCaption({ timestamp: createTimestamp(45) })).toBe('45 minutes ago');

      vi.useRealTimers();
    });

    it('formats timestamps within the last hour as minutes ago', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-01T12:00:00.000Z'));

      expect(formatActivityCaption({ timestamp: createTimestamp(59) })).toBe('59 minutes ago');

      vi.useRealTimers();
    });

    it('formats timestamps older than one hour with date', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-01T12:00:00.000Z'));

      const timestamp61MinutesAgo = Math.floor(
        new Date('2024-01-01T10:59:00.000Z').getTime() / 1000
      );
      expect(formatActivityCaption({ timestamp: timestamp61MinutesAgo })).toBe('Jan 1, 2024');

      vi.useRealTimers();
    });

    it('formats old timestamps with full date', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-15T12:00:00.000Z'));

      const oldTimestamp = Math.floor(new Date('2024-01-01T12:00:00.000Z').getTime() / 1000);
      expect(formatActivityCaption({ timestamp: oldTimestamp })).toBe('Jan 1, 2024');

      vi.useRealTimers();
    });

    it('formats timestamps from different months', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-03-15T12:00:00.000Z'));

      const febTimestamp = Math.floor(new Date('2024-02-20T12:00:00.000Z').getTime() / 1000);
      expect(formatActivityCaption({ timestamp: febTimestamp })).toBe('Feb 20, 2024');

      vi.useRealTimers();
    });

    it('formats timestamps from different years', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-15T12:00:00.000Z'));

      const oldYearTimestamp = Math.floor(new Date('2023-12-25T12:00:00.000Z').getTime() / 1000);
      expect(formatActivityCaption({ timestamp: oldYearTimestamp })).toBe('Dec 25, 2023');

      vi.useRealTimers();
    });

    it('handles edge case of exactly 60 minutes ago', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-01T12:00:00.000Z'));

      const timestamp60MinutesAgo = Math.floor(
        new Date('2024-01-01T11:00:00.000Z').getTime() / 1000
      );
      expect(formatActivityCaption({ timestamp: timestamp60MinutesAgo })).toBe('60 minutes ago');

      vi.useRealTimers();
    });

    it('handles timestamps less than 1 minute ago', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-01T12:00:00.000Z'));

      expect(formatActivityCaption({ timestamp: createTimestamp(0) })).toBe('0 minutes ago');

      vi.useRealTimers();
    });
  });
});
