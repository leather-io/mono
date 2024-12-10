import { describe, expect, it, vi } from 'vitest';

import { HiroStacksApiClient } from '../infrastructure/api/hiro/hiro-stacks-api.client';
import { createStacksTransactionsService } from './stacks-transactions.service';

describe('StacksTransactionsService', () => {
  const mockStacksApiClient = {
    getAddressMempoolTransactions: vi.fn().mockResolvedValue({ results: [] }),
    getAddressConfirmedTransactions: vi.fn().mockResolvedValue({ results: [] }),
  } as unknown as HiroStacksApiClient;

  const stacksTransactionsService = createStacksTransactionsService(mockStacksApiClient);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPendingTransactions', () => {
    const signal = new AbortController().signal;
    const stacksAddress = 'STACKS_ADDRESS';
    it('calls the Stacks API to retrieve mempool and confirmed transactions', async () => {
      await stacksTransactionsService.getPendingTransactions(stacksAddress, signal);
      expect(mockStacksApiClient.getAddressMempoolTransactions).toHaveBeenCalledWith(
        stacksAddress,
        signal
      );
      expect(mockStacksApiClient.getAddressConfirmedTransactions).toHaveBeenCalledWith(
        stacksAddress,
        signal
      );
    });

    it('filters out stale and confirmed txs from mempool txs', async () => {
      mockStacksApiClient.getAddressMempoolTransactions = vi.fn().mockResolvedValue({
        results: [
          { tx_id: 'txA', nonce: 1 },
          { tx_id: 'txC', nonce: 2 },
          { tx_id: 'txD', nonce: 3 },
        ],
      });
      mockStacksApiClient.getAddressConfirmedTransactions = vi.fn().mockResolvedValue({
        results: [
          { tx_id: 'txA', nonce: 1 },
          { tx_id: 'txB', nonce: 2 },
        ],
      });
      const pendingTxs = await stacksTransactionsService.getPendingTransactions(stacksAddress);
      expect(pendingTxs).toEqual([{ tx_id: 'txD', nonce: 3 }]);
    });

    it('propogates errors from API calls', async () => {
      const error = new Error('API Error');
      mockStacksApiClient.getAddressMempoolTransactions = vi.fn().mockRejectedValue(error);

      await expect(stacksTransactionsService.getPendingTransactions(stacksAddress)).rejects.toThrow(
        error
      );
    });
  });
});
