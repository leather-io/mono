import { describe, expect, it, vi } from 'vitest';

import { type HiroStacksApiClient } from '../infrastructure/api/hiro/hiro-stacks-api.client';
import { createMock } from '../test/create-mock';
import {
  createTestPrincipalMempoolTokenTransferTx,
  createTestPrincipalTokenTransferTx,
} from '../test/transactions-fixtures';
import { StacksTransactionsService } from './stacks-transactions.service';

describe(StacksTransactionsService.name, () => {
  const getPrincipalMempoolTransactions = vi.fn().mockResolvedValue({ results: [] });
  const getPrincipalTransactions = vi.fn().mockResolvedValue({ results: [] });
  const mockStacksApiClient = createMock<HiroStacksApiClient>({
    getPrincipalMempoolTransactions,
    getPrincipalTransactions,
  });

  const stacksTransactionsService = new StacksTransactionsService(mockStacksApiClient);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPendingTransactions', () => {
    const signal = new AbortController().signal;
    const stacksAddress = 'STACKS_ADDRESS';
    it('calls the Stacks API to retrieve mempool and confirmed transactions', async () => {
      await stacksTransactionsService.getPendingTransactions(stacksAddress, signal);
      expect(mockStacksApiClient.getPrincipalMempoolTransactions).toHaveBeenCalledWith(
        stacksAddress,
        {},
        { signal }
      );
      expect(mockStacksApiClient.getPrincipalTransactions).toHaveBeenCalledWith(
        stacksAddress,
        { limit: 50 },
        { signal }
      );
    });

    it('filters out stale and confirmed txs from mempool txs', async () => {
      const txD = createTestPrincipalMempoolTokenTransferTx({
        tx_id: 'txD',
        sender: { address: stacksAddress, nonce: 3 },
      });
      getPrincipalMempoolTransactions.mockResolvedValue({
        results: [
          createTestPrincipalMempoolTokenTransferTx({
            tx_id: 'txA',
            sender: { address: stacksAddress, nonce: 1 },
          }),
          createTestPrincipalMempoolTokenTransferTx({
            tx_id: 'txC',
            sender: { address: stacksAddress, nonce: 2 },
          }),
          txD,
        ],
      });
      getPrincipalTransactions.mockResolvedValue({
        results: [
          {
            transaction: createTestPrincipalTokenTransferTx({
              tx_id: 'txA',
              sender: { address: stacksAddress, nonce: 1 },
            }),
          },
          {
            transaction: createTestPrincipalTokenTransferTx({
              tx_id: 'txB',
              sender: { address: stacksAddress, nonce: 2 },
            }),
          },
        ],
      });
      const pendingTxs = await stacksTransactionsService.getPendingTransactions(stacksAddress);
      expect(pendingTxs).toEqual([txD]);
    });

    it('filters out mempool txs that are no longer pending', async () => {
      const pendingTx = createTestPrincipalMempoolTokenTransferTx({ tx_id: 'txPending' });
      getPrincipalMempoolTransactions.mockResolvedValue({
        results: [
          pendingTx,
          createTestPrincipalMempoolTokenTransferTx({
            tx_id: 'txDropped',
            status: 'dropped_replace_by_fee',
          }),
        ],
      });
      getPrincipalTransactions.mockResolvedValue({ results: [] });
      const pendingTxs = await stacksTransactionsService.getPendingTransactions(stacksAddress);
      expect(pendingTxs).toEqual([pendingTx]);
    });

    it('propogates errors from API calls', async () => {
      const error = new Error('API Error');
      getPrincipalMempoolTransactions.mockRejectedValue(error);

      await expect(stacksTransactionsService.getPendingTransactions(stacksAddress)).rejects.toThrow(
        error
      );
    });
  });
});
