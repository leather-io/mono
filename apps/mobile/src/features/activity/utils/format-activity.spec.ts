import dayjs from 'dayjs';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { BaseOnChainActivity, OnChainActivity } from '@leather.io/models';

import { formatActivityCaption, getActivityStatusLabel, getActivityTitle } from './format-activity';

function formatTemplateValue(value: unknown) {
  if (value === undefined || value === null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return String(value);
  }
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return '';
    }
  }
  return '';
}

vi.mock('@lingui/core/macro', () => ({
  t: (message: TemplateStringsArray | string, ...values: unknown[]) => {
    if (typeof message === 'string') return message;
    return message.reduce(
      (acc, part, index) =>
        acc + part + (index < values.length ? formatTemplateValue(values[index]) : ''),
      ''
    );
  },
}));

const baseActivityFields = {
  level: 'account' as const,
  account: 'test-account',
  timestamp: 0,
  txid: 'txid',
  status: 'success' as BaseOnChainActivity['status'],
};

describe('getActivityStatusLabel', () => {
  const cases: {
    type: OnChainActivity['type'];
    status: BaseOnChainActivity['status'];
    expected: string;
  }[] = [
    { type: 'sendAsset', status: 'success', expected: 'Sent' },
    { type: 'sendAsset', status: 'failed', expected: 'Send Failed' },
    { type: 'receiveAsset', status: 'success', expected: 'Received' },
    { type: 'receiveAsset', status: 'pending', expected: '' },
    { type: 'executeSmartContract', status: 'pending', expected: 'Executing' },
    { type: 'deploySmartContract', status: 'failed', expected: 'Deployment failed' },
    { type: 'lockAsset', status: 'pending', expected: 'Locking' },
    { type: 'swapAssets', status: 'success', expected: 'Swapped' },
  ];

  it.each(cases)('returns $expected for $type / $status', ({ type, status, expected }) => {
    expect(getActivityStatusLabel({ type, status })).toBe(expected);
  });
});

describe('formatActivityCaption', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('includes the status label when the activity is recent', () => {
    vi.useFakeTimers();
    const now = new Date('2024-01-01T00:30:00.000Z');
    vi.setSystemTime(now);

    const minutesAgo15 = Math.floor((now.getTime() - 15 * 60 * 1000) / 1000);

    const caption = formatActivityCaption({
      type: 'sendAsset',
      status: 'success',
      timestamp: minutesAgo15,
    });

    expect(caption).toBe('Sent 15 minutes ago');
  });

  it('falls back to the formatted timestamp when no status text exists', () => {
    vi.useFakeTimers();
    const now = new Date('2024-01-01T12:00:00.000Z');
    vi.setSystemTime(now);

    const hoursAgoTwo = Math.floor((now.getTime() - 2 * 60 * 60 * 1000) / 1000);

    const caption = formatActivityCaption({
      type: 'receiveAsset',
      status: 'pending',
      timestamp: hoursAgoTwo,
    });

    const expectedDate = dayjs(hoursAgoTwo * 1000).format('MMM D, YYYY');
    expect(caption).toBe(expectedDate);
  });

  it('uses the formatted timestamp for older activities while keeping the status text', () => {
    vi.useFakeTimers();
    const now = new Date('2024-01-02T00:00:00.000Z');
    vi.setSystemTime(now);

    const dayAgo = Math.floor((now.getTime() - 24 * 60 * 60 * 1000) / 1000);

    const caption = formatActivityCaption({
      type: 'sendAsset',
      status: 'failed',
      timestamp: dayAgo,
    });

    const formattedDate = dayjs(dayAgo * 1000).format('MMM D, YYYY');
    expect(caption).toBe(`Send Failed ${formattedDate}`);
  });
});

describe('getActivityTitle', () => {
  it('prefers the crypto symbol for send and receive activity', () => {
    const activity = {
      ...baseActivityFields,
      type: 'sendAsset',
      value: {
        crypto: {
          symbol: 'BTC',
        },
      },
    } as unknown as OnChainActivity;

    expect(getActivityTitle(activity)).toBe('BTC');
  });

  it('falls back to Token Transfer when the symbol is missing', () => {
    const activity = {
      ...baseActivityFields,
      type: 'receiveAsset',
    } as unknown as OnChainActivity;

    expect(getActivityTitle(activity)).toBe('Token Transfer');
  });

  it('derives the contract name for smart contract activity', () => {
    const activity = {
      ...baseActivityFields,
      type: 'deploySmartContract',
      contractId: 'ST123.contract-name',
    } as unknown as OnChainActivity;

    expect(getActivityTitle(activity)).toBe('contract-name');
  });

  it('falls back to Unknown when contract metadata is unavailable', () => {
    const activity = {
      ...baseActivityFields,
      type: 'executeSmartContract',
      contractId: '',
    } as unknown as OnChainActivity;

    expect(getActivityTitle(activity)).toBe('Unknown');
  });

  it('returns the swap label for swap activity', () => {
    const activity = {
      ...baseActivityFields,
      type: 'swapAssets',
    } as unknown as OnChainActivity;

    expect(getActivityTitle(activity)).toBe('Swap Assets');
  });

  it('returns the lock label for lock activity', () => {
    const activity = {
      ...baseActivityFields,
      type: 'lockAsset',
    } as unknown as OnChainActivity;

    expect(getActivityTitle(activity)).toBe('Lock Asset');
  });

  it('returns Unknown for unsupported activity types', () => {
    const activity = {
      ...baseActivityFields,
      type: 'unsupported',
    } as unknown as OnChainActivity;

    expect(getActivityTitle(activity)).toBe('Unknown');
  });
});
