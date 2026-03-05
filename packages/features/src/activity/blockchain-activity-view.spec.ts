import { describe, expect, it } from 'vitest';

import { btcAsset, stxAsset } from '@leather.io/constants';
import { type BlockchainActivity, defaultCurrentNetwork } from '@leather.io/models';
import { createMoney, minusSign } from '@leather.io/utils';

import { createBlockchainActivityView } from './blockchain-activity-view';

function makeActivity(overrides: Partial<BlockchainActivity> = {}): BlockchainActivity {
  return {
    txid: 'txid-123',
    timestamp: 1000,
    status: 'success',
    chain: 'bitcoin',
    initiatedByUser: true,
    events: [],
    ...overrides,
  };
}

describe('createBlockchainActivityView', () => {
  it('maps bitcoin send with correct title, caption, and operator', () => {
    const activity = makeActivity({
      events: [
        {
          action: 'sent',
          asset: btcAsset,
          counterparty: 'bc1qreceiveraddress123456789',
          amount: {
            crypto: createMoney(10000, 'BTC'),
            quote: createMoney(500, 'USD'),
          },
        },
      ],
    });

    const result = createBlockchainActivityView(activity, defaultCurrentNetwork);

    expect(result.title).toBe('BTC');
    expect(result.caption).toContain('Sent to');
    expect(result.balances.operator).toBe(minusSign);
    expect(result.balances.crypto).toBe(activity.events[0]!.amount.crypto);
    expect(result.balances.quote).toBe(activity.events[0]!.amount.quote);
    expect(result.statusIndicator).toBe('sent');
    expect(result.activityAvatar).toBe('asset');
  });

  it('maps bitcoin receive with green color and + operator', () => {
    const activity = makeActivity({
      events: [
        {
          action: 'received',
          asset: btcAsset,
          counterparty: 'bc1qsenderaddress123456789',
          amount: {
            crypto: createMoney(50000, 'BTC'),
            quote: createMoney(2500, 'USD'),
          },
        },
      ],
    });

    const result = createBlockchainActivityView(activity, defaultCurrentNetwork);

    expect(result.title).toBe('BTC');
    expect(result.caption).toContain('Received from');
    expect(result.balances.operator).toBe('+');
    expect(result.balances.color).toBe('green.action-primary-default');
    expect(result.statusIndicator).toBe('received');
  });

  it('maps stacks contract call with function name as title', () => {
    const activity = makeActivity({
      chain: 'stacks',
      events: [],
      contract: {
        type: 'call',
        contractId: 'SP123.my-contract',
        functionName: 'transfer',
      },
    });

    const result = createBlockchainActivityView(activity, defaultCurrentNetwork);

    expect(result.title).toBe('transfer');
    expect(result.caption).toBe('my-contract');
    expect(result.statusIndicator).toBe('function');
    expect(result.asset).toBe(stxAsset);
  });

  it('maps pending transaction with pending status indicator', () => {
    const activity = makeActivity({
      status: 'pending',
      events: [
        {
          action: 'sent',
          asset: btcAsset,
          counterparty: 'bc1qreceiveraddress123456789',
          amount: {
            crypto: createMoney(10000, 'BTC'),
            quote: createMoney(500, 'USD'),
          },
        },
      ],
    });

    const result = createBlockchainActivityView(activity, defaultCurrentNetwork);

    expect(result.statusIndicator).toBe('pending');
    expect(result.statusLabel).toBe('Sending');
    expect(result.caption).toContain('Sending to');
  });

  it('maps failed transaction with failed status indicator', () => {
    const activity = makeActivity({
      status: 'failed',
      events: [
        {
          action: 'sent',
          asset: btcAsset,
          amount: {
            crypto: createMoney(10000, 'BTC'),
            quote: createMoney(500, 'USD'),
          },
        },
      ],
    });

    const result = createBlockchainActivityView(activity, defaultCurrentNetwork);

    expect(result.statusIndicator).toBe('failed');
    expect(result.statusLabel).toBe('Send Failed');
  });

  it('uses fallback avatar and empty balances when no events', () => {
    const activity = makeActivity({ events: [] });

    const result = createBlockchainActivityView(activity, defaultCurrentNetwork);

    expect(result.activityAvatar).toBe('fallback');
    expect(result.balances).toEqual({});
  });

  it('generates key from txid and timestamp', () => {
    const activity = makeActivity({ txid: 'abc123', timestamp: 9999 });

    const result = createBlockchainActivityView(activity, defaultCurrentNetwork);

    expect(result.key).toBe('abc123-9999');
  });

  it('maps contract deploy with status-based title', () => {
    const activity = makeActivity({
      chain: 'stacks',
      contract: {
        type: 'deploy',
        contractId: 'SP123.deployed-contract',
      },
    });

    const result = createBlockchainActivityView(activity, defaultCurrentNetwork);

    expect(result.title).toBe('Deployed');
    expect(result.caption).toBe('deployed-contract');
    expect(result.asset).toBe(stxAsset);
  });
});
