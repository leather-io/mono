import { inject, injectable } from 'inversify';

import { btcCryptoAsset } from '@leather.io/constants';
import { AccountAddresses, BtcCryptoAssetBalance, UtxoId } from '@leather.io/models';
import {
  aggregateBtcCryptoAssetBalances,
  baseCurrencyAmountInQuote,
  createBtcCryptoAssetBalance,
  createMoney,
} from '@leather.io/utils';

import type { SettingsService } from '../infrastructure/settings/settings.service';
import { Types } from '../inversify.types';
import { MarketDataService } from '../market-data/market-data.service';
import { UtxosService } from '../utxos/utxos.service';
import { sumUtxoValues } from '../utxos/utxos.utils';

export interface BtcBalance {
  btc: BtcCryptoAssetBalance;
  quote: BtcCryptoAssetBalance;
}

export interface BtcAccountBalance extends BtcBalance {
  account: AccountAddresses;
}

export interface BtcAccountBalanceRequest {
  account: AccountAddresses;
  unprotectedUtxos: UtxoId[];
}

const btcCryptoAssetZeroBalance = createBtcCryptoAssetBalance(createMoney(0, 'BTC'));

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
    balanceRequests: BtcAccountBalanceRequest[],
    signal?: AbortSignal
  ): Promise<BtcBalance> {
    const accountBalances = await Promise.all(
      balanceRequests.map(req => this.getBtcAccountBalance(req, signal))
    );

    const cumulativeBtcBalance =
      accountBalances.length > 0
        ? aggregateBtcCryptoAssetBalances(accountBalances.map(r => r.btc))
        : btcCryptoAssetZeroBalance;

    const cumulativeQuoteBalance =
      accountBalances.length > 0
        ? aggregateBtcCryptoAssetBalances(accountBalances.map(r => r.quote))
        : createBtcCryptoAssetBalance(
            createMoney(0, this.settingsService.getSettings().quoteCurrency)
          );

    return {
      btc: cumulativeBtcBalance,
      quote: cumulativeQuoteBalance,
    };
  }

  /**
   * Gets BTC balance for given account, denominated in both BTC and quote currency.
   *
   * Balance reflects combined balance of all taproot (m/86') and segwit (m/84') addresses under provided account index.
   *
   * A list of selectively unprotected UTXOs provided on the request will move the UTXO values from protected to available balance.
   */
  public async getBtcAccountBalance(
    request: BtcAccountBalanceRequest,
    signal?: AbortSignal
  ): Promise<BtcAccountBalance> {
    const utxos = await this.utxosService.getAccountUtxos(
      request.account,
      request.unprotectedUtxos,
      signal
    );

    const totalBalance = createMoney(sumUtxoValues(utxos.confirmed), 'BTC');
    const inboundBalance = createMoney(sumUtxoValues(utxos.inbound), 'BTC');
    const outboundBalance = createMoney(sumUtxoValues(utxos.outbound), 'BTC');
    const protectedBalance = createMoney(sumUtxoValues(utxos.protected), 'BTC');
    const uneconomicalBalance = createMoney(sumUtxoValues(utxos.uneconomical), 'BTC');
    const unspendableBalance = createMoney(sumUtxoValues(utxos.unspendable), 'BTC');

    const btcMarketData = await this.marketDataService.getMarketData(btcCryptoAsset, signal);

    return {
      account: request.account,
      btc: createBtcCryptoAssetBalance(
        totalBalance,
        inboundBalance,
        outboundBalance,
        protectedBalance,
        uneconomicalBalance,
        unspendableBalance
      ),
      quote: createBtcCryptoAssetBalance(
        baseCurrencyAmountInQuote(totalBalance, btcMarketData),
        baseCurrencyAmountInQuote(inboundBalance, btcMarketData),
        baseCurrencyAmountInQuote(outboundBalance, btcMarketData),
        baseCurrencyAmountInQuote(protectedBalance, btcMarketData),
        baseCurrencyAmountInQuote(uneconomicalBalance, btcMarketData),
        baseCurrencyAmountInQuote(unspendableBalance, btcMarketData)
      ),
    };
  }
}
