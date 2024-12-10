import { MempoolTransaction } from '@stacks/stacks-blockchain-api-types';

import { StacksTx } from '@leather.io/models';

import {
  filterOutConfirmedTransactions,
  filterOutStaleTransactions,
} from './stacks-transactions.utils';

describe('filterOutConfirmedTransactions', () => {
  it('filters confirmed transactions by checking for matching tx_id in confirmed tx list', () => {
    const confirmedTxs = [{ tx_id: 'tx1' }, { tx_id: 'tx2' }] as StacksTx[];
    const mempoolTxs = [{ tx_id: 'tx1' }, { tx_id: 'tx3' }] as MempoolTransaction[];
    const pendingTxs = mempoolTxs.filter(filterOutConfirmedTransactions(confirmedTxs));
    expect(pendingTxs.length).toBe(1);
    expect(pendingTxs[0].tx_id).toBe('tx3');
  });

  it('can handle empty confirmed transaction lists', () => {
    const confirmedTxs = [] as StacksTx[];
    const mempoolTxs = [{ tx_id: 'tx1' }, { tx_id: 'tx3' }] as MempoolTransaction[];
    const pendingTxs = mempoolTxs.filter(filterOutConfirmedTransactions(confirmedTxs));
    expect(pendingTxs.length).toBe(2);
  });
});

describe('filterOutStaleTransactions', () => {
  it('filters stale transactions by checking for matching nonce in confirmed tx list', () => {
    const confirmedTxs = [{ nonce: 1 }, { nonce: 2 }] as StacksTx[];
    const mempoolTxs = [{ nonce: 2 }, { nonce: 3 }] as MempoolTransaction[];
    const pendingTxs = mempoolTxs.filter(filterOutStaleTransactions(confirmedTxs));
    expect(pendingTxs.length).toBe(1);
    expect(pendingTxs[0].nonce).toBe(3);
  });

  it('can handle empty confirmed transaction lists', () => {
    const confirmedTxs = [] as StacksTx[];
    const mempoolTxs = [{ nonce: 1 }, { nonce: 2 }] as MempoolTransaction[];
    const pendingTxs = mempoolTxs.filter(filterOutStaleTransactions(confirmedTxs));
    expect(pendingTxs.length).toBe(2);
  });
});
