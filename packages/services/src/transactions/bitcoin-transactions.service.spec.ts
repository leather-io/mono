import { describe, expect, it } from 'vitest';

import { AccountAddresses } from '@leather.io/models';

import { LeatherApiClient } from '../infrastructure/api/leather/leather-api.client';
import { createBitcoinTransactionsService } from './bitcoin-transactions.service';

describe(createBitcoinTransactionsService.name, () => {
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
          nativeSegwitDescriptor,
          taprootDescriptor,
        },
      };
      const mockLeatherApiClient = {
        fetchBitcoinTransactions: (descriptor: string) => {
          return Promise.resolve({
            data: descriptor === nativeSegwitDescriptor ? [duplicateTx] : [duplicateTx, uniqueTx],
          });
        },
      } as unknown as LeatherApiClient;

      const service = createBitcoinTransactionsService(mockLeatherApiClient);
      const result = await service.getAccountTransactions(mockAccount);
      expect(result).toHaveLength(2);
      expect(result).toEqual(expect.arrayContaining([duplicateTx, uniqueTx]));
    });

    it('should return empty array for accounts without bitcoin address info', async () => {
      const mockAccount: AccountAddresses = {
        id: {
          fingerprint: 'asdfsdf',
          accountIndex: 0,
        },
      };
      const service = createBitcoinTransactionsService({} as unknown as LeatherApiClient);
      const result = await service.getAccountTransactions(mockAccount);
      expect(result).toEqual([]);
    });
  });
});
