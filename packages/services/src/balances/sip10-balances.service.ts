import { CryptoAssetBalance, Sip10CryptoAssetInfo } from '@leather.io/models';
import {
  aggregateBaseCryptoAssetBalances,
  baseCurrencyAmountInQuote,
  createBaseCryptoAssetBalance,
  createMoney,
} from '@leather.io/utils';

import { Sip10AssetService } from '../assets/sip10-asset.service';
import { HiroStacksApiClient } from '../infrastructure/api/hiro/hiro-stacks-api.client';
import { MarketDataService } from '../market-data/market-data.service';
import { baseCryptoAssetZeroBalanceUsd } from './constants';
import { aggregateSip10AddressBalances } from './sip10-balances.utils';

export interface Sip10AssetBalance {
  asset: Sip10CryptoAssetInfo;
  usd: CryptoAssetBalance;
  crypto: CryptoAssetBalance;
}

export interface Sip10AggregateBalance {
  usd: CryptoAssetBalance;
  sip10s: Sip10AssetBalance[];
}

export interface Sip10AddressBalance extends Sip10AggregateBalance {
  address: string;
}

export interface Sip10BalancesService {
  getSip10AddressBalance(address: string, signal?: AbortSignal): Promise<Sip10AddressBalance>;
  getSip10AggregateBalance(
    addresses: string[],
    signal?: AbortSignal
  ): Promise<Sip10AggregateBalance>;
}

export function createSip10BalancesService(
  stacksApiClient: HiroStacksApiClient,
  marketDataService: MarketDataService,
  sip10TokensService: Sip10AssetService
): Sip10BalancesService {
  /**
   * Gets the cumulative SIP10 balance (denominated in USD) of a list of Stacks addresses. Includes full balance information for each individual address.
   */
  async function getSip10AggregateBalance(addresses: string[], signal?: AbortSignal) {
    const addressBalances = await Promise.all(
      addresses.map(address => getSip10AddressBalance(address, signal))
    );
    const totalUsdBalance = aggregateBaseCryptoAssetBalances([
      baseCryptoAssetZeroBalanceUsd,
      ...addressBalances.map(r => r.usd),
    ]);
    return {
      usd: totalUsdBalance,
      sip10s: aggregateSip10AddressBalances(addressBalances),
    };
  }

  /**
   * Gets all SIP10 balances for given address. Includes both cumulative and individual USD values.
   */
  async function getSip10AddressBalance(address: string, signal?: AbortSignal) {
    const fungibleTokens = (await stacksApiClient.getAddressBalances(address, signal))
      .fungible_tokens;
    const sip10Balances = await Promise.all(
      Object.keys(fungibleTokens).map(tokenId => {
        return getSip10TokenBalance(tokenId, Number(fungibleTokens[tokenId]?.balance ?? 0), signal);
      })
    );
    return {
      address,
      usd: aggregateBaseCryptoAssetBalances([
        baseCryptoAssetZeroBalanceUsd,
        ...sip10Balances.map(b => b.usd),
      ]),
      sip10s: sip10Balances,
    };
  }

  async function getSip10TokenBalance(
    tokenId: string,
    amount: number,
    signal?: AbortSignal
  ): Promise<Sip10AssetBalance> {
    const tokenInfo = await sip10TokensService.getAssetInfo(tokenId, signal);
    const totalBalance = createMoney(amount, tokenInfo.symbol, tokenInfo.decimals);
    const marketData = await marketDataService.getSip10MarketData(tokenInfo);
    return {
      asset: tokenInfo,
      usd: createBaseCryptoAssetBalance(baseCurrencyAmountInQuote(totalBalance, marketData)),
      crypto: createBaseCryptoAssetBalance(totalBalance),
    };
  }

  return {
    getSip10AddressBalance,
    getSip10AggregateBalance,
  };
}
