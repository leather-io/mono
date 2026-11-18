import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type AccountAddresses, OnChainActivityTypes } from '@leather.io/models';
import { initBigNumber } from '@leather.io/utils';

import { type Sip9AssetService } from '../assets/sip9-asset.service';
import { type Sip10AssetService } from '../assets/sip10-asset.service';
import { type HiroStacksApiClient } from '../infrastructure/api/hiro/hiro-stacks-api.client';
import { type MarketDataService } from '../market/market-data.service';
import { createActivitySip10Asset } from '../test/activity-fixtures';
import { createMock } from '../test/create-mock';
import {
  createTestPrincipalMempoolContractCallTx,
  createTestPrincipalMempoolTokenTransferTx,
} from '../test/transactions-fixtures';
import { type BitcoinTransactionsService } from '../transactions/bitcoin-transactions.service';
import { type StacksTransactionsService } from '../transactions/stacks-transactions.service';
import { ActivityService } from './activity.service';

const stxAddress = 'ST123';
const account: AccountAddresses = {
  id: { fingerprint: 'xyz', accountIndex: 0 },
  stacks: { stxAddress },
};
const token = createActivitySip10Asset({ assetId: 'ST000.token::xyz' });

const pendingContractCall = createTestPrincipalMempoolContractCallTx({
  tx_id: '0xcall',
  sender: { address: stxAddress, nonce: 1 },
  receipt_time: 1_700_000_000,
  contract_call: { contract_id: 'ST000.token', function_name: 'transfer' },
});

const tokenPostCondition = {
  type: 'fungible',
  principal: { type_id: 'principal_standard', address: stxAddress },
  condition_code: 'sent_equal_to',
  amount: '500',
  asset: { contract_address: 'ST000', contract_name: 'token', asset_name: 'xyz' },
};

describe(ActivityService.name, () => {
  const getTransactionById = vi.fn();
  const getPendingTransactions = vi.fn();
  const getAsset = vi.fn();

  const service = new ActivityService(
    createMock<HiroStacksApiClient>({
      getAddressTransactions: vi.fn().mockResolvedValue([]),
      getTransactionEvents: vi.fn().mockResolvedValue([]),
      getTransactionById,
    }),
    createMock<StacksTransactionsService>({ getPendingTransactions }),
    createMock<BitcoinTransactionsService>({}),
    createMock<MarketDataService>({
      getMarketData(asset) {
        return Promise.resolve({
          pair: { base: asset.symbol, quote: 'USD' },
          price: { amount: initBigNumber(1), symbol: 'USD', decimals: 2 },
        });
      },
    }),
    createMock<Sip10AssetService>({ getAsset }),
    createMock<Sip9AssetService>({})
  );

  beforeEach(() => {
    vi.clearAllMocks();
    getAsset.mockResolvedValue(token);
  });

  describe('getStacksActivity', () => {
    it('maps a pending contract call to the transfers in its post conditions', async () => {
      const signal = new AbortController().signal;
      getPendingTransactions.mockResolvedValue([pendingContractCall]);
      getTransactionById.mockResolvedValue({ post_conditions: [tokenPostCondition] });

      const activity = await service.getStacksActivity(account, signal);

      expect(getTransactionById).toHaveBeenCalledWith('0xcall', {
        signal,
        include: ['post_conditions'],
      });
      expect(getAsset).toHaveBeenCalledWith('ST000.token::xyz', signal);
      expect(activity).toHaveLength(1);
      expect(activity[0]).toMatchObject({
        type: OnChainActivityTypes.sendAsset,
        asset: token,
        amount: initBigNumber(500),
        txid: '0xcall',
        status: 'pending',
      });
    });

    it('does not fetch post conditions for pending stx transfers', async () => {
      getPendingTransactions.mockResolvedValue([
        createTestPrincipalMempoolTokenTransferTx({
          tx_id: '0xstx',
          sender: { address: stxAddress, nonce: 1 },
          token_transfer: { recipient: 'ST456', amount: '1000', memo: null },
        }),
      ]);

      const activity = await service.getStacksActivity(account);

      expect(getTransactionById).not.toHaveBeenCalled();
      expect(activity[0]).toMatchObject({
        type: OnChainActivityTypes.sendAsset,
        amount: initBigNumber(1000),
        txid: '0xstx',
      });
    });

    it('falls back to a contract execution when the transaction is no longer found', async () => {
      getPendingTransactions.mockResolvedValue([pendingContractCall]);
      getTransactionById.mockResolvedValue(null);

      const activity = await service.getStacksActivity(account);

      expect(activity).toEqual([
        expect.objectContaining({
          type: OnChainActivityTypes.executeSmartContract,
          contractId: 'ST000.token',
          functionName: 'transfer',
          txid: '0xcall',
        }),
      ]);
    });

    it('falls back to a contract execution when fetching post conditions fails', async () => {
      getPendingTransactions.mockResolvedValue([pendingContractCall]);
      getTransactionById.mockRejectedValue(new Error('Timeout'));

      const activity = await service.getStacksActivity(account);

      expect(activity).toEqual([
        expect.objectContaining({
          type: OnChainActivityTypes.executeSmartContract,
          txid: '0xcall',
        }),
      ]);
    });
  });
});
