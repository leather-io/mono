import { initBigNumber } from '@leather.io/utils';

import { SettingsService } from '../infrastructure/settings/settings.service';
import { MarketDataService } from '../market/market-data.service';
import { AccountRequest } from '../types';
import { UtxosService } from '../utxos/utxos.service';
import { BtcBalancesService } from './btc-balances.service';

describe(BtcBalancesService.name, () => {
  const confirmedUtxo = {
    txid: 'a',
    vout: 0,
    value: 100_000_000,
    height: 800_000,
    address: 'bc1qpayer',
    path: "m/84'/0'/0'/0/0",
    keyOrigin: "deadbeef/84'/0'/0'/0/0",
  };
  const lockedUtxo = { txid: 'lock-a', vout: 1, value: 200_000_000 };

  const mockSettingsService = {
    getSettings: () => ({ quoteCurrency: 'USD' }),
  } as unknown as SettingsService;

  const mockUtxosService = {
    getAccountUtxos: vi.fn().mockResolvedValue({
      confirmed: [confirmedUtxo],
      inbound: [],
      outbound: [],
      dust: [],
      unspendable: [],
      available: [confirmedUtxo],
      locked: [lockedUtxo],
    }),
  } as unknown as UtxosService;

  const mockMarketDataService = {
    getMarketData: vi.fn().mockResolvedValue({
      pair: { base: 'BTC', quote: 'USD' },
      price: { amount: initBigNumber(100), symbol: 'USD', decimals: 2 },
    }),
  } as unknown as MarketDataService;

  const service = new BtcBalancesService(
    mockSettingsService,
    mockUtxosService,
    mockMarketDataService
  );

  const request: AccountRequest = {
    account: {
      id: { fingerprint: 'deadbeef', accountIndex: 0 },
      bitcoin: { type: 'hd', taprootDescriptor: 'tr(...)', nativeSegwitDescriptor: 'wpkh(...)' },
    },
  };

  describe('getBtcAccountBalance', () => {
    it('adds locked utxos to total balance and reports them as locked balance', async () => {
      const balance = await service.getBtcAccountBalance(request);

      expect(balance.btc.totalBalance.amount).toEqual(initBigNumber(300_000_000));
      expect(balance.btc.lockedBalance.amount).toEqual(initBigNumber(200_000_000));
      expect(balance.btc.availableBalance.amount).toEqual(initBigNumber(100_000_000));
    });

    it('quotes locked balance alongside total balance', async () => {
      const balance = await service.getBtcAccountBalance(request);

      expect(balance.quote.totalBalance.amount).toEqual(initBigNumber(300));
      expect(balance.quote.lockedBalance.amount).toEqual(initBigNumber(200));
    });
  });
});
