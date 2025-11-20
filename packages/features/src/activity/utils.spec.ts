import { describe, expect, it, vi } from 'vitest';

import { HIRO_EXPLORER_URL, MEMPOOL_BASE_URL } from '@leather.io/constants';
import { type OnChainActivity, defaultCurrentNetwork } from '@leather.io/models';

import {
  formatActivityCaption,
  formatActivityStatusLabel,
  getBalancesText,
  makeActivityLink,
} from './utils';

function createTimestamp(minutesAgo: number) {
  return Math.floor((Date.now() - minutesAgo * 60 * 1000) / 1000);
}

describe('activity utils', () => {
  it('formats recent timestamps as minutes ago', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));

    const activity = {
      timestamp: createTimestamp(15),
    } as OnChainActivity;

    expect(formatActivityCaption(activity)).toBe('15 minutes ago');

    vi.useRealTimers();
  });

  it('derives deploy contract label from identifier', () => {
    const activity = {
      type: 'deploySmartContract',
      status: 'success',
      contractId: 'SP123.contract-name',
    } as OnChainActivity;

    expect(formatActivityStatusLabel(activity)).toBe('contract-name');
  });

  it('derives balance operators for receive/send activity', () => {
    const activity = {
      type: 'receiveAsset',
      status: 'success',
      value: {
        crypto: {
          amount: {
            shiftedBy: () => ({
              toNumber: () => 1,
            }),
          },
          decimals: 0,
          symbol: 'BTC',
        },
        quote: {
          amount: {
            shiftedBy: () => ({
              toNumber: () => 50000,
            }),
          },
          decimals: 0,
          symbol: 'USD',
        },
      },
    } as unknown as OnChainActivity;

    expect(getBalancesText(activity)).toEqual({
      formattedBalanceCrypto: '+ 1\u00A0BTC',
      formattedBalanceQuote: '+ $50,000',
    });
  });

  it('generates explorer links for different chains', () => {
    const btcActivity = makeActivityLink({
      txid: 'abc',
      networkPreference: defaultCurrentNetwork,
      asset: {
        chain: 'bitcoin',
        category: 'fungible',
        protocol: 'nativeBtc',
        name: 'Bitcoin',
        symbol: 'BTC',
        decimals: 8,
        hasMemo: false,
      },
    });

    expect(btcActivity).toBe(`${MEMPOOL_BASE_URL}/tx/abc`);

    const stacksActivity = makeActivityLink({
      txid: 'def',
      networkPreference: defaultCurrentNetwork,
      asset: {
        chain: 'stacks',
        category: 'fungible',
        protocol: 'nativeStx',
        name: 'Stacks',
        symbol: 'STX',
        decimals: 6,
        hasMemo: false,
      },
    });

    expect(stacksActivity).toBe(`${HIRO_EXPLORER_URL}/txid/def?chain=mainnet`);
  });
});
