import { BtcCryptoAssetBalance } from '@leather.io/models';
import {
  aggregateBtcCryptoAssetBalances,
  baseCurrencyAmountInQuote,
  createBtcCryptoAssetBalance,
  createMoney,
} from '@leather.io/utils';

import { MarketDataService } from '../market-data/market-data.service';
import { BitcoinAccountIdentifier, BitcoinAccountServiceRequest } from '../shared/bitcoin.types';
import { UtxosService } from '../utxos/utxos.service';
import { sumUtxoValues } from '../utxos/utxos.utils';

export interface BtcAccountBalance {
  account: BitcoinAccountIdentifier;
  btc: BtcCryptoAssetBalance;
  usd: BtcCryptoAssetBalance;
}

export interface BtcAggregateBalance {
  btc: BtcCryptoAssetBalance;
  usd: BtcCryptoAssetBalance;
  accountBalances: BtcAccountBalance[];
}

export interface BtcBalancesService {
  getBtcAccountBalance(
    request: BitcoinAccountServiceRequest,
    signal?: AbortSignal
  ): Promise<BtcAccountBalance>;
  getBtcAggregateBalance(
    requests: BitcoinAccountServiceRequest[],
    signal?: AbortSignal
  ): Promise<BtcAggregateBalance>;
}

export function createBtcBalancesService(
  utxosService: UtxosService,
  marketDataService: MarketDataService
): BtcBalancesService {
  /**
   * Retrieves a cumulative balance of all requested accounts.
   * Includes full balance information for each individual account.
   */
  async function getBtcAggregateBalance(
    balanceRequests: BitcoinAccountServiceRequest[],
    signal?: AbortSignal
  ) {
    const accountBalances = await Promise.all(
      balanceRequests.map(req => getBtcAccountBalance(req, signal))
    );
    return {
      btc: aggregateBtcCryptoAssetBalances(accountBalances.map(bal => bal.btc)),
      usd: aggregateBtcCryptoAssetBalances(accountBalances.map(bal => bal.usd)),
      accountBalances,
    };
  }

  /**
   * Retrieves BTC balance of an account (denominated in both BTC and USD).
   *
   * Balance reflects combined balance of all taproot (m/86') and segwit (m/84') addresses under account index.
   * A list of protected UTXOs can be provided on request to selectively move UTXO values from protected to available balance.
   */
  async function getBtcAccountBalance(request: BitcoinAccountServiceRequest, signal?: AbortSignal) {
    const utxos = await utxosService.getAccountUtxos(request, signal);

    const totalBalance = createMoney(sumUtxoValues(utxos.confirmed), 'BTC');
    const inboundBalance = createMoney(sumUtxoValues(utxos.inbound), 'BTC');
    const outboundBalance = createMoney(sumUtxoValues(utxos.outbound), 'BTC');
    const protectedBalance = createMoney(sumUtxoValues(utxos.protected), 'BTC');
    const uneconomicalBalance = createMoney(sumUtxoValues(utxos.uneconomical), 'BTC');
    const unspendableBalance = createMoney(sumUtxoValues(utxos.unspendable), 'BTC');

    const btcMarketData = await marketDataService.getBtcMarketData(signal);
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
      usd: createBtcCryptoAssetBalance(
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
