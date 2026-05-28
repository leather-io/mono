import { inject, injectable } from 'inversify';

import { btcAsset } from '@leather.io/constants';
import { AccountAddresses, BtcBalance } from '@leather.io/models';
import {
  aggregateBtcBalances,
  baseCurrencyAmountInQuote,
  createBtcBalance,
  createMoney,
} from '@leather.io/utils';

import type { SettingsService } from '../infrastructure/settings/settings.service';
import { Types } from '../inversify.types';
import { MarketDataService } from '../market/market-data.service';
import { AccountRequest } from '../types/request.types';
import { UtxosService } from '../utxos/utxos.service';
import { sumUtxoValues } from '../utxos/utxos.utils';

export interface QuotedBtcBalance {
  btc: BtcBalance;
  quote: BtcBalance;
}

export interface AccountQuotedBtcBalance extends QuotedBtcBalance {
  account: AccountAddresses;
}

const btcAssetZeroBalance = createBtcBalance(createMoney(0, 'BTC'));

@injectable()
export class BtcBalancesService {
  constructor(
    @inject(Types.SettingsService) private readonly settingsService: SettingsService,
    private readonly utxosService: UtxosService,
    private readonly marketDataService: MarketDataService
  ) {}
  /**
   * Gets cumulative BTC balance of requested Bitcoin accounts list, denominated in both BTC and quote currency.
   */
  public async getBtcAggregateBalance(
    balanceRequests: AccountRequest[],
    signal?: AbortSignal
  ): Promise<QuotedBtcBalance> {
    const accountBalances = await Promise.all(
      balanceRequests.map(req => this.getBtcAccountBalance(req, signal))
    );

    const cumulativeBtcBalance =
      accountBalances.length > 0
        ? aggregateBtcBalances(accountBalances.map(r => r.btc))
        : btcAssetZeroBalance;

    const cumulativeQuoteBalance =
      accountBalances.length > 0
        ? aggregateBtcBalances(accountBalances.map(r => r.quote))
        : createBtcBalance(createMoney(0, this.settingsService.getSettings().quoteCurrency));

    return {
      btc: cumulativeBtcBalance,
      quote: cumulativeQuoteBalance,
    };
  }

  /**
   * Gets BTC balance for given account, denominated in both BTC and quote currency.
   *
   * Balance reflects combined balance of all taproot (m/86') and segwit (m/84') addresses under provided account index.
   */
  public async getBtcAccountBalance(
    request: AccountRequest,
    signal?: AbortSignal
  ): Promise<AccountQuotedBtcBalance> {
    const utxos = await this.utxosService.getAccountUtxos(request, signal);

    const totalBalance = createMoney(sumUtxoValues(utxos.confirmed), 'BTC');
    const inboundBalance = createMoney(sumUtxoValues(utxos.inbound), 'BTC');
    const outboundBalance = createMoney(sumUtxoValues(utxos.outbound), 'BTC');
    const dustBalance = createMoney(sumUtxoValues(utxos.dust), 'BTC');
    const unspendableBalance = createMoney(sumUtxoValues(utxos.unspendable), 'BTC');

    const btcMarketData = await this.marketDataService.getMarketData(btcAsset, signal);

    return {
      account: request.account,
      btc: createBtcBalance(
        totalBalance,
        inboundBalance,
        outboundBalance,
        dustBalance,
        unspendableBalance
      ),
      quote: createBtcBalance(
        baseCurrencyAmountInQuote(totalBalance, btcMarketData),
        baseCurrencyAmountInQuote(inboundBalance, btcMarketData),
        baseCurrencyAmountInQuote(outboundBalance, btcMarketData),
        baseCurrencyAmountInQuote(dustBalance, btcMarketData),
        baseCurrencyAmountInQuote(unspendableBalance, btcMarketData)
      ),
    };
  }
}
