import { describe, expect, it } from 'vitest';

import { AccountAddresses } from '@leather.io/models';

import { LeatherApiClient } from '../infrastructure/api/leather/leather-api.client';
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
        {} as unknown as SettingsService
      );
      const mockAccount: AccountAddresses = {
        id: { fingerprint: 'multisig-fp', accountIndex: 0 },
        bitcoin: { type: 'fixedAddress', address: 'bc1qmultisig', paymentType: 'p2wsh' },
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
    });
  });
});
