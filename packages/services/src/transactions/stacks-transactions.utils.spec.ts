import { type StacksTx } from '@leather.io/models';

import { type HiroPrincipalMempoolTransaction } from '../infrastructure/api/hiro/hiro-stacks-api.types';
import {
  createTestMempoolTokenTransferTransaction,
  createTestPrincipalMempoolTokenTransferTx,
} from '../test/transactions-fixtures';
import {
  filterOutConfirmedTransactions,
  filterOutStaleTransactions,
} from './stacks-transactions.utils';

describe('filterOutConfirmedTransactions', () => {
  it('filters confirmed transactions by checking for matching tx_id in confirmed tx list', () => {
    const confirmedTxs: StacksTx[] = [
      createTestMempoolTokenTransferTransaction({ tx_id: 'tx1' }),
      createTestMempoolTokenTransferTransaction({ tx_id: 'tx2' }),
    ];
    const mempoolTxs: HiroPrincipalMempoolTransaction[] = [
      createTestPrincipalMempoolTokenTransferTx({ tx_id: 'tx1' }),
      createTestPrincipalMempoolTokenTransferTx({ tx_id: 'tx3' }),
    ];
    const pendingTxs = mempoolTxs.filter(filterOutConfirmedTransactions(confirmedTxs));
    expect(pendingTxs.length).toBe(1);
    expect(pendingTxs[0].tx_id).toBe('tx3');
  });

  it('can handle empty confirmed transaction lists', () => {
    const confirmedTxs: StacksTx[] = [];
    const mempoolTxs: HiroPrincipalMempoolTransaction[] = [
      createTestPrincipalMempoolTokenTransferTx({ tx_id: 'tx1' }),
      createTestPrincipalMempoolTokenTransferTx({ tx_id: 'tx3' }),
    ];
    const pendingTxs = mempoolTxs.filter(filterOutConfirmedTransactions(confirmedTxs));
    expect(pendingTxs.length).toBe(2);
  });
});

describe('filterOutStaleTransactions', () => {
  it('filters stale transactions by checking for matching nonce in confirmed tx list', () => {
    const confirmedTxs: StacksTx[] = [
      createTestMempoolTokenTransferTransaction({ nonce: 1 }),
      createTestMempoolTokenTransferTransaction({ nonce: 2 }),
    ];
    const mempoolTxs: HiroPrincipalMempoolTransaction[] = [
      createTestPrincipalMempoolTokenTransferTx({
        sender: { address: 'SP000000000000000000002Q6VF78', nonce: 2 },
      }),
      createTestPrincipalMempoolTokenTransferTx({
        sender: { address: 'SP000000000000000000002Q6VF78', nonce: 3 },
      }),
    ];
    const pendingTxs = mempoolTxs.filter(filterOutStaleTransactions(confirmedTxs));
    expect(pendingTxs.length).toBe(1);
    expect(pendingTxs[0].sender.nonce).toBe(3);
  });

  it('can handle empty confirmed transaction lists', () => {
    const confirmedTxs: StacksTx[] = [];
    const mempoolTxs: HiroPrincipalMempoolTransaction[] = [
      createTestPrincipalMempoolTokenTransferTx({
        sender: { address: 'SP000000000000000000002Q6VF78', nonce: 1 },
      }),
      createTestPrincipalMempoolTokenTransferTx({
        sender: { address: 'SP000000000000000000002Q6VF78', nonce: 2 },
      }),
    ];
    const pendingTxs = mempoolTxs.filter(filterOutStaleTransactions(confirmedTxs));
    expect(pendingTxs.length).toBe(2);
  });
});
