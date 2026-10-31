import { describe, expect, it } from 'vitest';

import { type AccountAddresses, defaultNetworksKeyedById } from '@leather.io/models';

import { type LeatherApiClient } from '../infrastructure/api/leather/leather-api.client';
import { type MempoolApiClient } from '../infrastructure/api/mempool/mempool-api.client';
import { type MempoolTransaction } from '../infrastructure/api/mempool/mempool-api.schema';
import { createMock } from '../test/create-mock';
import {
  createTestLeatherBitcoinTransaction,
  createTestLeatherBitcoinTransactionsPage,
  createTestSettingsService,
} from '../test/transactions-fixtures';
import { BitcoinTransactionsService } from './bitcoin-transactions.service';

describe(BitcoinTransactionsService.name, () => {
  describe('getAccountTransactions', () => {
    it('deduplicates transactions with the same txid from different descriptors', async () => {
      const duplicateTx = createTestLeatherBitcoinTransaction({
        txid: 'abc123',
      });
      const uniqueTx = createTestLeatherBitcoinTransaction({
        txid: 'def456',
      });
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
      const mockLeatherApiClient = createMock<LeatherApiClient>({
        fetchBitcoinTransactions(descriptor: string) {
          const data =
            descriptor === nativeSegwitDescriptor ? [duplicateTx] : [duplicateTx, uniqueTx];
          return Promise.resolve(createTestLeatherBitcoinTransactionsPage(data));
        },
      });

      const service = new BitcoinTransactionsService(
        mockLeatherApiClient,
        createMock<MempoolApiClient>({}),
        createTestSettingsService(defaultNetworksKeyedById.mainnet)
      );
      const result = await service.getAccountTransactions(mockAccount, { page: 1, pageSize: 150 });
      expect(result).toHaveLength(2);
      expect(result[0].txid).toEqual(duplicateTx.txid);
      expect(result[1].txid).toEqual(uniqueTx.txid);
    });

    it('fetches transactions by address for a fixed-address (multisig) account', async () => {
      const tx = createTestLeatherBitcoinTransaction({ txid: 'multisig-tx' });
      let requestedAddress: string | undefined;
      const mockLeatherApiClient = createMock<LeatherApiClient>({
        fetchBitcoinTransactionsByAddress(address: string) {
          requestedAddress = address;
          return Promise.resolve(createTestLeatherBitcoinTransactionsPage([tx]));
        },
      });
      const service = new BitcoinTransactionsService(
        mockLeatherApiClient,
        createMock<MempoolApiClient>({}),
        createTestSettingsService(defaultNetworksKeyedById.mainnet)
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
      const mempoolTx: MempoolTransaction = {
        txid: 'claim-tx',
        status: {
          confirmed: true,
          block_height: 4471,
          block_hash: undefined,
          block_time: 1_700_000_000,
        },
        fees: 153,
        vin: [
          { txid: 'lock-tx', vout: 0, prevout: { scriptpubkey_address: 'bcrt1qlock', value: 1e7 } },
        ],
        vout: [{ scriptpubkey_address: vaultAddress, value: 9_999_847 }],
      };
      const mockMempoolApiClient = createMock<MempoolApiClient>({
        fetchAddressTransactions: () => Promise.resolve([mempoolTx]),
      });
      const service = new BitcoinTransactionsService(
        createMock<LeatherApiClient>({}),
        mockMempoolApiClient,
        createTestSettingsService(defaultNetworksKeyedById.primaryStacksTestnet)
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

    it('fetches from the network mempool for the signet staking testnet', async () => {
      let requestedMempoolUrl: string | undefined;
      const mockMempoolApiClient = createMock<MempoolApiClient>({
        fetchAddressTransactions(_address: string, mempoolUrl?: string) {
          requestedMempoolUrl = mempoolUrl;
          return Promise.resolve([]);
        },
      });
      const service = new BitcoinTransactionsService(
        createMock<LeatherApiClient>({}),
        mockMempoolApiClient,
        createTestSettingsService(defaultNetworksKeyedById.btcStakingStacksTestnet)
      );
      await service.getAddressTransactions('tb1qvault', { page: 1, pageSize: 150 });
      expect(requestedMempoolUrl).toEqual(
        defaultNetworksKeyedById.btcStakingStacksTestnet.chain.bitcoin.bitcoinUrl
      );
    });

    it('fetches from the Leather API for the default signet network', async () => {
      let requestedAddress: string | undefined;
      const mockLeatherApiClient = createMock<LeatherApiClient>({
        fetchBitcoinTransactionsByAddress(address: string) {
          requestedAddress = address;
          return Promise.resolve(createTestLeatherBitcoinTransactionsPage([]));
        },
      });
      const service = new BitcoinTransactionsService(
        mockLeatherApiClient,
        createMock<MempoolApiClient>({}),
        createTestSettingsService(defaultNetworksKeyedById.signet)
      );
      await service.getAddressTransactions('tb1qsignet', { page: 1, pageSize: 150 });
      expect(requestedAddress).toEqual('tb1qsignet');
    });

    it('should return empty array for accounts without bitcoin address info', async () => {
      const mockAccount: AccountAddresses = {
        id: {
          fingerprint: 'asdfsdf',
          accountIndex: 0,
        },
      };
      const service = new BitcoinTransactionsService(
        createMock<LeatherApiClient>({}),
        createMock<MempoolApiClient>({}),
        createTestSettingsService(defaultNetworksKeyedById.mainnet)
      );
      const result = await service.getAccountTransactions(mockAccount, { page: 1, pageSize: 150 });
      expect(result).toEqual([]);
    });
  });
});
