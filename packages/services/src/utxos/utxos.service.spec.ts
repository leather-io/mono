import { describe, expect, it } from 'vitest';

import { AccountAddresses, defaultNetworksKeyedById } from '@leather.io/models';

import {
  LeatherApiClient,
  LeatherApiStakingBond,
} from '../infrastructure/api/leather/leather-api.client';
import { MempoolApiClient } from '../infrastructure/api/mempool/mempool-api.client';
import { SettingsService } from '../infrastructure/settings/settings.service';
import { BitcoinTransactionsService } from '../transactions/bitcoin-transactions.service';
import { UtxosService } from './utxos.service';

describe(UtxosService.name, () => {
  describe('getAccountUtxos', () => {
    it('fetches utxos by address for a fixed-address (multisig) account', async () => {
      let requestedAddress: string | undefined;
      const mockLeatherApiClient = {
        fetchUtxosByAddress: (address: string) => {
          requestedAddress = address;
          return Promise.resolve([
            { txid: 'utxo1', vout: 0, value: '100000', height: 800000, address, path: '' },
          ]);
        },
      } as unknown as LeatherApiClient;
      const mockBitcoinTransactionsService = {
        getAddressTransactions: () => Promise.resolve([]),
      } as unknown as BitcoinTransactionsService;

      const service = new UtxosService(
        mockLeatherApiClient,
        {} as unknown as MempoolApiClient,
        mockBitcoinTransactionsService,
        {
          getSettings: () => ({ network: { chain: { bitcoin: { mode: 'mainnet' } } } }),
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

      const result = await service.getAccountUtxos({ account: mockAccount });

      expect(requestedAddress).toEqual('bc1qmultisig');
      expect(result.confirmed).toHaveLength(1);
      expect(result.confirmed[0].txid).toEqual('utxo1');
    });

    it('returns empty totals for accounts without bitcoin address info', async () => {
      const service = new UtxosService(
        {} as unknown as LeatherApiClient,
        {} as unknown as MempoolApiClient,
        {} as unknown as BitcoinTransactionsService,
        {} as unknown as SettingsService
      );
      const mockAccount: AccountAddresses = {
        id: { fingerprint: 'no-btc', accountIndex: 0 },
      };

      const result = await service.getAccountUtxos({ account: mockAccount });

      expect(result.confirmed).toEqual([]);
      expect(result.available).toEqual([]);
      expect(result.locked).toEqual([]);
    });
  });

  describe('getAccountUtxos locked utxos', () => {
    const hdAccount: AccountAddresses = {
      id: { fingerprint: 'hd-fp', accountIndex: 0 },
      bitcoin: {
        type: 'hd',
        taprootDescriptor: 'tr(...)',
        nativeSegwitDescriptor: 'wpkh(...)',
        zeroIndexNativeSegwitPayerAddress: 'bc1qpayer',
      },
    };
    const bond: LeatherApiStakingBond = {
      bondIndex: 4,
      stxAddress: 'SP1STAKER',
      enrollmentTxId: '0xenroll',
      registeredAtBurnHeight: 900_000,
      exitAnnouncedAtBurnHeight: null,
      outputs: [
        {
          txid: 'lock-a',
          vout: 1,
          amountSats: '200000000',
          unlockBurnHeight: 922_900,
          lockScriptHex: '00',
          spent: false,
          lastCheckedAt: null,
        },
      ],
    };
    const ownedUtxo = {
      txid: 'utxo1',
      vout: 0,
      value: '100000',
      height: 800000,
      address: 'bc1qpayer',
      path: "m/84'/0'/0'/0/0",
    };

    function createService(
      fetchStakingBonds: LeatherApiClient['fetchStakingBonds'],
      fetchUtxos: LeatherApiClient['fetchUtxos'] = () => Promise.resolve([])
    ) {
      return new UtxosService(
        { fetchUtxos, fetchStakingBonds } as unknown as LeatherApiClient,
        {} as unknown as MempoolApiClient,
        {
          getDescriptorTransactions: () => Promise.resolve([]),
        } as unknown as BitcoinTransactionsService,
        {
          getSettings: () => ({ network: { chain: { bitcoin: { mode: 'mainnet' } } } }),
        } as unknown as SettingsService
      );
    }

    it('lists unspent bond outputs as locked utxos for an hd account', async () => {
      let requestedAddress: string | undefined;
      const service = createService(address => {
        requestedAddress = address;
        return Promise.resolve([bond]);
      });

      const result = await service.getAccountUtxos({ account: hdAccount });

      expect(requestedAddress).toEqual('bc1qpayer');
      expect(result.locked).toEqual([{ txid: 'lock-a', vout: 1, value: 200_000_000 }]);
      expect(result.confirmed).toEqual([]);
      expect(result.available).toEqual([]);
    });

    it('does not request bonds when native segwit addresses are excluded', async () => {
      let called = false;
      const service = createService(() => {
        called = true;
        return Promise.resolve([bond]);
      });

      const result = await service.getAccountUtxos({
        account: hdAccount,
        exclusions: { nativeSegwitAddresses: true },
      });

      expect(called).toBe(false);
      expect(result.locked).toEqual([]);
    });

    it('leaves owned utxos intact and reports no locked utxos when the bonds request fails', async () => {
      const service = createService(
        () => Promise.reject(new Error('staking index unavailable')),
        () => Promise.resolve([ownedUtxo])
      );

      const result = await service.getAccountUtxos({ account: hdAccount });

      expect(result.locked).toEqual([]);
      expect(result.confirmed.map(utxo => utxo.txid)).toEqual(['utxo1', 'utxo1']);
      expect(result.available).toHaveLength(2);
    });
  });

  describe('staking testnet data source', () => {
    const stakingTestnetSettings = {
      getSettings: () => ({ network: defaultNetworksKeyedById.stakingTestnet }),
    } as unknown as SettingsService;
    const leatherApiClientThatMustNotBeCalled = {
      fetchUtxos: () => Promise.reject(new Error('leather api must not be called')),
      fetchUtxosByAddress: () => Promise.reject(new Error('leather api must not be called')),
      fetchStakingBonds: () => Promise.resolve([]),
    } as unknown as LeatherApiClient;

    it('reads hd account utxos from the network mempool, not the leather api', async () => {
      const requestedDescriptors: string[] = [];
      const mempoolApiClient = {
        fetchDescriptorUtxos: (descriptor: string) => {
          requestedDescriptors.push(descriptor);
          return Promise.resolve([]);
        },
      } as unknown as MempoolApiClient;
      const service = new UtxosService(
        leatherApiClientThatMustNotBeCalled,
        mempoolApiClient,
        {
          getDescriptorTransactions: () => Promise.resolve([]),
        } as unknown as BitcoinTransactionsService,
        stakingTestnetSettings
      );

      const result = await service.getAccountUtxos({
        account: {
          id: { fingerprint: 'hd-fp', accountIndex: 0 },
          bitcoin: {
            type: 'hd',
            taprootDescriptor: 'tr(...)',
            nativeSegwitDescriptor: 'wpkh(...)',
            zeroIndexNativeSegwitPayerAddress: 'tb1qvz04jt55sy7a4e9fg447gm2zlmnjck3d4yhelq',
          },
        },
      });

      expect(requestedDescriptors.sort()).toEqual(['tr(...)', 'wpkh(...)']);
      expect(result.confirmed).toEqual([]);
    });

    it('reads fixed address utxos from the network mempool, not the leather api', async () => {
      let requestedAddress: string | undefined;
      const mempoolApiClient = {
        fetchAddressUtxos: (address: string) => {
          requestedAddress = address;
          return Promise.resolve([]);
        },
      } as unknown as MempoolApiClient;
      const service = new UtxosService(
        leatherApiClientThatMustNotBeCalled,
        mempoolApiClient,
        {
          getAddressTransactions: () => Promise.resolve([]),
        } as unknown as BitcoinTransactionsService,
        stakingTestnetSettings
      );

      await service.getAccountUtxos({
        account: {
          id: { fingerprint: 'multisig-fp', accountIndex: 0 },
          bitcoin: {
            type: 'fixedAddress',
            address: 'tb1qvz04jt55sy7a4e9fg447gm2zlmnjck3d4yhelq',
            paymentType: 'p2wsh',
            multisig: { threshold: 2, signerCount: 3 },
          },
        },
      });

      expect(requestedAddress).toEqual('tb1qvz04jt55sy7a4e9fg447gm2zlmnjck3d4yhelq');
    });
  });
});
