import { describe, expect, it } from 'vitest';

import {
  BitcoinTransaction,
  BitcoinTransactionVin,
  BitcoinTransactionVout,
} from '@leather.io/models';

import { mapBitcoinTxToActivity } from './bitcoin-blockchain-activity.utils';

function vin(overrides: Partial<BitcoinTransactionVin>): BitcoinTransactionVin {
  return { n: 0, value: '0', ...overrides };
}

function vout(overrides: Partial<BitcoinTransactionVout>): BitcoinTransactionVout {
  return { n: 0, value: '0', ...overrides };
}

function mockBtcTx(overrides: Partial<BitcoinTransaction> = {}): BitcoinTransaction {
  return {
    txid: 'abc123',
    height: 800000,
    time: 1700000000,
    vin: [],
    vout: [],
    ...overrides,
  } as BitcoinTransaction;
}

describe('mapBitcoinTxToActivity', () => {
  it('returns undefined when no owned inputs or outputs', () => {
    const tx = mockBtcTx({
      vin: [vin({ address: 'bc1q_other', value: '10000', owned: false })],
      vout: [vout({ address: 'bc1q_other2', value: '9000', owned: false })],
    });
    expect(mapBitcoinTxToActivity(tx)).toBeUndefined();
  });

  it('maps a send transaction with correct fee', () => {
    const tx = mockBtcTx({
      vin: [vin({ address: 'bc1q_mine', value: '50000', owned: true })],
      vout: [
        vout({ address: 'bc1q_recipient', value: '40000', owned: false }),
        vout({ address: 'bc1q_change', value: '9000', owned: true }),
      ],
    });

    const result = mapBitcoinTxToActivity(tx);

    expect(result).toBeDefined();
    expect(result!.chain).toBe('bitcoin');
    expect(result!.initiatedByUser).toBe(true);
    expect(result!.fee?.amount.toString()).toBe('1000');
    expect(result!.events).toHaveLength(1);
    expect(result!.events[0]).toMatchObject({
      action: 'sent',
      counterparty: 'bc1q_recipient',
    });
    expect(result!.events[0].amount.crypto.amount.toString()).toBe('40000');
  });

  it('maps a receive transaction', () => {
    const tx = mockBtcTx({
      vin: [vin({ address: 'bc1q_sender', value: '60000', owned: false })],
      vout: [
        vout({ address: 'bc1q_mine', value: '50000', owned: true }),
        vout({ address: 'bc1q_change', value: '9000', owned: false }),
      ],
    });

    const result = mapBitcoinTxToActivity(tx);

    expect(result).toBeDefined();
    expect(result!.initiatedByUser).toBe(false);
    expect(result!.events).toHaveLength(1);
    expect(result!.events[0]).toMatchObject({
      action: 'received',
      counterparty: 'bc1q_sender',
    });
    expect(result!.events[0].amount.crypto.amount.toString()).toBe('50000');
  });

  it('aggregates multiple non-owned outputs into separate send events', () => {
    const tx = mockBtcTx({
      vin: [vin({ address: 'bc1q_mine', value: '100000', owned: true })],
      vout: [
        vout({ address: 'bc1q_alice', value: '30000', owned: false }),
        vout({ address: 'bc1q_bob', value: '40000', owned: false }),
        vout({ address: 'bc1q_change', value: '29000', owned: true }),
      ],
    });

    const result = mapBitcoinTxToActivity(tx);

    expect(result!.events).toHaveLength(2);
    const recipients = result!.events.map(e => e.counterparty);
    expect(recipients).toContain('bc1q_alice');
    expect(recipients).toContain('bc1q_bob');
  });

  it('uses largest non-owned input as counterparty for receive', () => {
    const tx = mockBtcTx({
      vin: [
        vin({ address: 'bc1q_small', value: '1000', owned: false }),
        vin({ address: 'bc1q_large', value: '90000', owned: false }),
      ],
      vout: [vout({ address: 'bc1q_mine', value: '80000', owned: true })],
    });

    const result = mapBitcoinTxToActivity(tx);

    expect(result!.events[0].counterparty).toBe('bc1q_large');
  });

  it('skips non-owned outputs without an address in send events', () => {
    const tx = mockBtcTx({
      vin: [vin({ address: 'bc1q_mine', value: '50000', owned: true })],
      vout: [
        vout({ value: '30000', owned: false }),
        vout({ address: 'bc1q_recipient', value: '19000', owned: false }),
      ],
    });

    const result = mapBitcoinTxToActivity(tx);

    expect(result!.events).toHaveLength(1);
    expect(result!.events[0].counterparty).toBe('bc1q_recipient');
  });

  it('sums duplicate recipient addresses in send', () => {
    const tx = mockBtcTx({
      vin: [vin({ address: 'bc1q_mine', value: '100000', owned: true })],
      vout: [
        vout({ address: 'bc1q_same', value: '20000', owned: false }),
        vout({ address: 'bc1q_same', value: '30000', owned: false }),
        vout({ address: 'bc1q_change', value: '49000', owned: true }),
      ],
    });

    const result = mapBitcoinTxToActivity(tx);

    expect(result!.events).toHaveLength(1);
    expect(result!.events[0].counterparty).toBe('bc1q_same');
    expect(result!.events[0].amount.crypto.amount.toString()).toBe('50000');
  });

  it('maps pending tx correctly', () => {
    const tx = mockBtcTx({
      height: undefined,
      time: undefined,
      vin: [vin({ address: 'bc1q_mine', value: '10000', owned: true })],
      vout: [vout({ address: 'bc1q_dest', value: '9000', owned: false })],
    });

    const result = mapBitcoinTxToActivity(tx);

    expect(result!.status).toBe('pending');
    expect(result!.blockHeight).toBeUndefined();
  });
});
