import { describe, expect, it } from 'vitest';

import type { BitcoinTransaction } from '@leather.io/models';
import { dateToUnixTimestamp } from '@leather.io/utils';

import { mapBitcoinActivity } from './bitcoin-activity.utils';

function vin(value: string, opts: { owned?: boolean; address?: string } = {}) {
  return { n: 0, value, owned: opts.owned, address: opts.address };
}

function vout(value: string, opts: { owned?: boolean; address?: string } = {}) {
  return { n: 0, value, owned: opts.owned, address: opts.address };
}

function tx(partial: Partial<BitcoinTransaction>): BitcoinTransaction {
  return { txid: 'btc-1', height: 100, time: 1000, vin: [], vout: [], ...partial };
}

describe('mapBitcoinActivity', () => {
  it('returns null when the wallet is neither sender nor receiver', () => {
    const result = mapBitcoinActivity(
      tx({ vin: [vin('5000', { address: 'a' })], vout: [vout('5000', { address: 'b' })] })
    );
    expect(result).toBeNull();
  });

  it('maps an outgoing tx to a send with fee and recipient counterparty', () => {
    const result = mapBitcoinActivity(
      tx({
        vin: [vin('10000', { owned: true, address: 'mine' })],
        vout: [
          vout('7000', { address: 'recipient' }),
          vout('2000', { owned: true, address: 'change' }),
        ],
      })
    );
    expect(result?.action).toBe('send');
    expect(result?.initiatedByUser).toBe(true);
    expect(result?.counterparty).toBe('recipient');
    expect(result?.fee?.amount.toString()).toBe('1000');
    expect(result?.balanceChanges).toHaveLength(1);
    expect(result?.balanceChanges[0].direction).toBe('sent');
    expect(result?.balanceChanges[0].amount.crypto.amount.toString()).toBe('7000');
    expect(result?.balanceChanges[0].amount.crypto.symbol).toBe('BTC');
  });

  it('maps an incoming tx to a receive with sender counterparty and no fee', () => {
    const result = mapBitcoinActivity(
      tx({
        vin: [vin('5000', { address: 'sender' })],
        vout: [vout('4500', { owned: true, address: 'mine' })],
      })
    );
    expect(result?.action).toBe('receive');
    expect(result?.initiatedByUser).toBe(false);
    expect(result?.counterparty).toBe('sender');
    expect(result?.fee).toBeUndefined();
    expect(result?.balanceChanges[0].direction).toBe('received');
    expect(result?.balanceChanges[0].amount.crypto.amount.toString()).toBe('4500');
  });

  it('selects the largest non-owned output as the send counterparty', () => {
    const result = mapBitcoinActivity(
      tx({
        vin: [vin('10000', { owned: true, address: 'mine' })],
        vout: [
          vout('3000', { address: 'small' }),
          vout('5000', { address: 'large' }),
          vout('1000', { owned: true, address: 'change' }),
        ],
      })
    );
    expect(result?.counterparty).toBe('large');
    expect(result?.balanceChanges[0].amount.crypto.amount.toString()).toBe('8000');
  });

  it('marks an unconfirmed tx (no block height) as pending', () => {
    const result = mapBitcoinActivity(
      tx({
        height: undefined,
        vin: [vin('10000', { owned: true, address: 'mine' })],
        vout: [vout('9500', { address: 'recipient' })],
      })
    );
    expect(result?.status).toBe('pending');
  });

  it('keeps the mempool first-seen time of an unconfirmed tx', () => {
    const result = mapBitcoinActivity(
      tx({
        height: undefined,
        time: 500,
        vin: [vin('10000', { owned: true, address: 'mine' })],
        vout: [vout('9500', { address: 'recipient' })],
      })
    );
    expect(result?.timestamp).toBe(500);
  });

  it('falls back to now when an unconfirmed tx carries no time', () => {
    const before = dateToUnixTimestamp(new Date());
    const result = mapBitcoinActivity(
      tx({
        height: undefined,
        time: undefined,
        vin: [vin('10000', { owned: true, address: 'mine' })],
        vout: [vout('9500', { address: 'recipient' })],
      })
    );
    expect(result?.timestamp).toBeGreaterThanOrEqual(before);
  });
});
