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
      const result = await service.getAccountTransactions(mockAccount, { page: 1, pageSize: 150 });
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
      const result = await service.getAccountTransactions(mockAccount, { page: 1, pageSize: 150 });
      expect(requestedAddress).toEqual('bc1qmultisig');
      expect(result).toHaveLength(1);
      expect(result[0].txid).toEqual(tx.txid);
    });

    it('marks the queried address as owned for a fixed-address account on regtest', async () => {
      const vaultAddress = 'bcrt1qvault';
      const mempoolTx = {
        txid: 'claim-tx',
        status: { confirmed: true, block_height: 4471, block_time: 1_700_000_000 },
        fees: 153,
        vin: [
          { txid: 'lock-tx', vout: 0, prevout: { scriptpubkey_address: 'bcrt1qlock', value: 1e7 } },
        ],
        vout: [{ scriptpubkey_address: vaultAddress, value: 9_999_847 }],
      };
      const mockMempoolApiClient = {
        fetchAddressTransactions: () => Promise.resolve([mempoolTx]),
      } as unknown as MempoolApiClient;
      const service = new BitcoinTransactionsService(
        {} as unknown as LeatherApiClient,
        mockMempoolApiClient,
        {
          getSettings: () => ({
            network: { chain: { bitcoin: { bitcoinNetwork: 'regtest', mode: 'regtest' } } },
          }),
        } as unknown as SettingsService
      );
      const mockAccount: AccountAddresses = {
        id: { fingerprint: 'multisig-fp', accountIndex: 0 },
        bitcoin: {
          type: 'fixedAddress',
          address: vaultAddress,
          paymentType: 'p2wsh',
          multisig: { threshold: 1, signerCount: 2 },
        },
      };
      const result = await service.getAccountTransactions(mockAccount, { page: 1, pageSize: 150 });
      expect(result).toHaveLength(1);
      expect(result[0].vout[0].owned).toBe(true);
      expect(result[0].vin[0].owned).toBeUndefined();
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
      const result = await service.getAccountTransactions(mockAccount, { page: 1, pageSize: 150 });
      expect(result).toEqual([]);
    });
  });
});
