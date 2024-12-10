import { BtcCryptoAssetBalance } from '@leather.io/models';
import {
  baseCurrencyAmountInQuote,
  createBtcCryptoAssetBalance,
  createMoney,
  isDefined,
  sumNumbers,
} from '@leather.io/utils';

import { LeatherApiClient, LeatherApiUtxo } from '../infrastructure/api/leather/leather-api.client';
import { MarketDataService } from '../market-data/market-data.service';
import { hasUneconomicalBalance, removeExistingUtxos } from './btc-balances.utils';

export interface BtcBalance {
  balanceBtc: BtcCryptoAssetBalance;
  balanceUsd: BtcCryptoAssetBalance;
}

export interface BtcBalancesService {
  getBtcBalance(descriptors: string[], signal?: AbortSignal): Promise<BtcBalance>;
}

export function createBtcBalancesService(
  leatherApiClient: LeatherApiClient,
  marketDataService: MarketDataService
): BtcBalancesService {
  /**
   * Retrieves cumulative BTC balance of a list of descriptors (denominated in both BTC and USD).
   */
  async function getBtcBalance(descriptors: string[], signal?: AbortSignal) {
    const utxoPromises = descriptors.map(descriptor =>
      leatherApiClient.fetchUtxos(descriptor, signal)
    );
    const totalUtxos = (await Promise.all(utxoPromises)).flat().filter(isDefined);
    const totalBalanceBtc = createMoney(
      sumNumbers(totalUtxos.map(utxo => Number(utxo.value))).toNumber(),
      'BTC'
    );
    // TODO: fetch inbound utxos
    const inboundUtxos = await getInboundUtxos(descriptors);
    const inboundBalanceBtc = createMoney(
      sumNumbers(inboundUtxos.map(utxo => Number(utxo.value))).toNumber(),
      'BTC'
    );
    // TODO: fetch outbound utxos
    const outboundUtxos = await getOutboundUtxos(descriptors);
    const outboundBalanceBtc = createMoney(
      sumNumbers(outboundUtxos.map(utxo => Number(utxo.value))).toNumber(),
      'BTC'
    );
    // TODO: fetch protected utxos
    const protectedUtxos = await getProtectedUtxos(descriptors);
    const protectedBalanceBtc = createMoney(
      sumNumbers(protectedUtxos.map(utxo => Number(utxo.value))).toNumber(),
      'BTC'
    );
    const uneconomicalUtxos = removeExistingUtxos(totalUtxos, protectedUtxos).filter(
      hasUneconomicalBalance
    );
    const uneconomicalBalanceBtc = createMoney(
      sumNumbers(uneconomicalUtxos.map(utxo => Number(utxo.value))).toNumber(),
      'BTC'
    );

    const btcMarketData = await marketDataService.getBtcMarketData(signal);
    return {
      balanceBtc: createBtcCryptoAssetBalance(
        totalBalanceBtc,
        inboundBalanceBtc,
        outboundBalanceBtc,
        protectedBalanceBtc,
        uneconomicalBalanceBtc
      ),
      balanceUsd: createBtcCryptoAssetBalance(
        baseCurrencyAmountInQuote(totalBalanceBtc, btcMarketData),
        baseCurrencyAmountInQuote(inboundBalanceBtc, btcMarketData),
        baseCurrencyAmountInQuote(outboundBalanceBtc, btcMarketData),
        baseCurrencyAmountInQuote(protectedBalanceBtc, btcMarketData),
        baseCurrencyAmountInQuote(uneconomicalBalanceBtc, btcMarketData)
      ),
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/require-await
  async function getInboundUtxos(_descriptors: string[]): Promise<LeatherApiUtxo[]> {
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/require-await
  async function getOutboundUtxos(_descriptors: string[]): Promise<LeatherApiUtxo[]> {
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/require-await
  async function getProtectedUtxos(_descriptors: string[]): Promise<LeatherApiUtxo[]> {
    return [];
  }

  return {
    getBtcBalance,
  };
}
