import { describe, expect, it } from 'vitest';

import { AccountAddresses } from '@leather.io/models';

import { LeatherApiClient } from '../infrastructure/api/leather/leather-api.client';
import { MempoolApiClient } from '../infrastructure/api/mempool/mempool-api.client';
import { SettingsService } from '../infrastructure/settings/settings.service';
import { BitcoinTransactionsService } from './bitcoin-transactions.service';

describe(BitcoinTransactionsService.name, () => {
  describe('getAccountTransactions', () => {
    it('deduplicates transactions with the same txid from different descriptors', async () => {
      const duplicateTx = {
        txid: 'abc123',
        amount: 100000,
      };
      const uniqueTx = {
        txid: 'def456',
        amount: 200000,
      };
      const nativeSegwitDescriptor = 'wpkh(...)';
      const taprootDescriptor = 'tr(...)';
      const mockAccount: AccountAddresses = {
        id: {
          fingerprint: 'asdf',
          accountIndex: 0,
        },
        bitcoin: {
          type: 'hd',
          nativeSegwitDescriptor,
          taprootDescriptor,
        },
      };
      const mockLeatherApiClient = {
        fetchBitcoinTransactions: (descriptor: string) => {
          const data =
            descriptor === nativeSegwitDescriptor ? [duplicateTx] : [duplicateTx, uniqueTx];
          return Promise.resolve({ data, meta: { totalPages: 1 } });
        },
      } as unknown as LeatherApiClient;

      const service = new BitcoinTransactionsService(
        mockLeatherApiClient,
        {} as unknown as MempoolApiClient,
        {
          getSettings: () => ({ network: { chain: { bitcoin: { bitcoinNetwork: 'mainnet' } } } }),
        } as unknown as SettingsService
      );
      const result = await service.getAccountTransactions(mockAccount);
      expect(result).toHaveLength(2);
      expect(result[0].txid).toEqual(duplicateTx.txid);
      expect(result[1].txid).toEqual(uniqueTx.txid);
    });

    it('fetches transactions by address for a fixed-address (multisig) account', async () => {
      const tx = { txid: 'multisig-tx', amount: 50000 };
      let requestedAddress: string | undefined;
      const mockLeatherApiClient = {
        fetchBitcoinTransactionsByAddress: (address: string) => {
          requestedAddress = address;
          return Promise.resolve({ data: [tx], meta: { totalPages: 1 } });
        },
      } as unknown as LeatherApiClient;
      const service = new BitcoinTransactionsService(
        mockLeatherApiClient,
        {} as unknown as MempoolApiClient,
        {
          getSettings: () => ({ network: { chain: { bitcoin: { bitcoinNetwork: 'mainnet' } } } }),
        } as unknown as SettingsService
      );
      const mockAccount: AccountAddresses = {
        id: { fingerprint: 'multisig-fp', accountIndex: 0 },
        bitcoin: {
          type: 'fixedAddress',
          address: 'bc1qmultisig',
          paymentType: 'p2wsh',
          multisig: { threshold: 2, signerCount: 3 },
        },
      };
      const result = await service.getAccountTransactions(mockAccount);
      expect(requestedAddress).toEqual('bc1qmultisig');
      expect(result).toHaveLength(1);
      expect(result[0].txid).toEqual(tx.txid);
    });

    it('should return empty array for accounts without bitcoin address info', async () => {
      const mockAccount: AccountAddresses = {
        id: {
          fingerprint: 'asdfsdf',
          accountIndex: 0,
        },
      };
      const service = new BitcoinTransactionsService(
        {} as unknown as LeatherApiClient,
        {} as unknown as MempoolApiClient,
        {} as unknown as SettingsService
      );
      const result = await service.getAccountTransactions(mockAccount);
      expect(result).toEqual([]);
    });
  });
});
