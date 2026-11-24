import {
  type HiroPrincipalMempoolTransaction,
  type HiroPrincipalTransaction,
} from '../infrastructure/api/hiro/hiro-stacks-api.types';
import {
  createTestPrincipalMempoolTokenTransferTx,
  createTestPrincipalTokenTransferTx,
} from '../test/transactions-fixtures';
import {
  filterOutConfirmedTransactions,
  filterOutStaleTransactions,
} from './stacks-transactions.utils';

describe('filterOutConfirmedTransactions', () => {
  it('filters confirmed transactions by checking for matching tx_id in confirmed tx list', () => {
    const confirmedTxs: HiroPrincipalTransaction[] = [
      createTestPrincipalTokenTransferTx({ tx_id: 'tx1' }),
      createTestPrincipalTokenTransferTx({ tx_id: 'tx2' }),
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
    const confirmedTxs: HiroPrincipalTransaction[] = [];
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
    const confirmedTxs: HiroPrincipalTransaction[] = [
      createTestPrincipalTokenTransferTx({
        sender: { address: 'SP000000000000000000002Q6VF78', nonce: 1 },
      }),
      createTestPrincipalTokenTransferTx({
        sender: { address: 'SP000000000000000000002Q6VF78', nonce: 2 },
      }),
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

  it('keeps a pending transaction whose nonce matches a confirmed transaction from another sender', () => {
    const confirmedTxs: HiroPrincipalTransaction[] = [
      createTestPrincipalTokenTransferTx({
        sender: { address: 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE', nonce: 7 },
      }),
    ];
    const mempoolTxs: HiroPrincipalMempoolTransaction[] = [
      createTestPrincipalMempoolTokenTransferTx({
        sender: { address: 'SP000000000000000000002Q6VF78', nonce: 7 },
      }),
    ];
    const pendingTxs = mempoolTxs.filter(filterOutStaleTransactions(confirmedTxs));
    expect(pendingTxs).toEqual(mempoolTxs);
  });

  it('can handle empty confirmed transaction lists', () => {
    const confirmedTxs: HiroPrincipalTransaction[] = [];
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
