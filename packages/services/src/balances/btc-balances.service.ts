import { btcCryptoAsset } from '@leather.io/constants';
import { AccountAddresses, BtcCryptoAssetBalance, UtxoId } from '@leather.io/models';
import {
  aggregateBtcCryptoAssetBalances,
  baseCurrencyAmountInQuote,
  createBtcCryptoAssetBalance,
  createMoney,
} from '@leather.io/utils';

import { SettingsService } from '../infrastructure/settings/settings.service';
import { MarketDataService } from '../market-data/market-data.service';
import { UtxosService } from '../utxos/utxos.service';
import { sumUtxoValues } from '../utxos/utxos.utils';

export interface BtcBalance {
  btc: BtcCryptoAssetBalance;
  fiat: BtcCryptoAssetBalance;
}

export interface BtcAccountBalance extends BtcBalance {
  account: AccountAddresses;
}

export interface BtcAccountBalanceRequest {
  account: AccountAddresses;
  unprotectedUtxos: UtxoId[];
}

export interface BtcBalancesService {
  getBtcAccountBalance(
    request: BtcAccountBalanceRequest,
    signal?: AbortSignal
  ): Promise<BtcAccountBalance>;
  getBtcAggregateBalance(
    requests: BtcAccountBalanceRequest[],
    signal?: AbortSignal
  ): Promise<BtcBalance>;
}

const btcCryptoAssetZeroBalance = createBtcCryptoAssetBalance(createMoney(0, 'BTC'));

export function createBtcBalancesService(
  settingsService: SettingsService,
  utxosService: UtxosService,
  marketDataService: MarketDataService
): BtcBalancesService {
  /**
   * Gets cumulative BTC balance of requested Bitcoin accounts list, denominated in both BTC and fiat.
   */
  async function getBtcAggregateBalance(
    balanceRequests: BtcAccountBalanceRequest[],
    signal?: AbortSignal
  ) {
    const accountBalances = await Promise.all(
      balanceRequests.map(req => getBtcAccountBalance(req, signal))
    );

    const cumulativeBtcBalance =
      accountBalances.length > 0
        ? aggregateBtcCryptoAssetBalances(accountBalances.map(r => r.btc))
        : btcCryptoAssetZeroBalance;

    const cumulativeFiatBalance =
      accountBalances.length > 0
        ? aggregateBtcCryptoAssetBalances(accountBalances.map(r => r.fiat))
        : createBtcCryptoAssetBalance(createMoney(0, settingsService.getSettings().fiatCurrency));

    return {
      btc: cumulativeBtcBalance,
      fiat: cumulativeFiatBalance,
    };
  }

  /**
   * Gets BTC balance for given account, denominated in both BTC and fiat.
   *
   * Balance reflects combined balance of all taproot (m/86') and segwit (m/84') addresses under provided account index.
   *
   * A list of selectively unprotected UTXOs provided on the request will move the UTXO values from protected to available balance.
   */
  async function getBtcAccountBalance(request: BtcAccountBalanceRequest, signal?: AbortSignal) {
    const utxos = await utxosService.getAccountUtxos(
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

    const btcMarketData = await marketDataService.getMarketData(btcCryptoAsset, signal);

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
      fiat: createBtcCryptoAssetBalance(
        baseCurrencyAmountInQuote(totalBalance, btcMarketData),
        baseCurrencyAmountInQuote(inboundBalance, btcMarketData),
        baseCurrencyAmountInQuote(outboundBalance, btcMarketData),
        baseCurrencyAmountInQuote(protectedBalance, btcMarketData),
        baseCurrencyAmountInQuote(uneconomicalBalance, btcMarketData),
        baseCurrencyAmountInQuote(unspendableBalance, btcMarketData)
      ),
    };
  }

  return {
    getBtcAccountBalance,
    getBtcAggregateBalance,
  };
}
