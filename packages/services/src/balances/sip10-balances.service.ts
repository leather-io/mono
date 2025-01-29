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
import { getAggregateSip10Balances } from './sip10-balances.utils';

export interface Sip10AssetBalance {
  asset: Sip10CryptoAssetInfo;
  usd: CryptoAssetBalance;
  sip10: CryptoAssetBalance;
}

export interface Sip10AddressBalance {
  address: string;
  usd: CryptoAssetBalance;
  sip10s: Sip10AssetBalance[];
}

export interface Sip10AggregateBalance {
  usd: CryptoAssetBalance;
  aggregateBalances: Sip10AssetBalance[];
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
    console.log('WAXXXXXX', addresses, addressBalances);
    const totalUsdBalance = aggregateBaseCryptoAssetBalances([
      baseCryptoAssetZeroBalanceUsd,
      ...addressBalances.map(r => r.usd),
    ]);
    console.log('tiofaidh ar la', totalUsdBalance);
    return {
      usd: totalUsdBalance,
      aggregateBalances: getAggregateSip10Balances(addressBalances),
    };
  }

  /**
   * Gets all SIP10 balances for given address. Includes both cumulative and individual USD values.
   */
  async function getSip10AddressBalance(address: string, signal?: AbortSignal) {
    const fungibleTokens = (await stacksApiClient.getAddressBalances(address, signal))
      .fungible_tokens;
    const balances = await Promise.all(
      Object.keys(fungibleTokens).map(tokenId => {
        return getSip10TokenBalance(tokenId, Number(fungibleTokens[tokenId]?.balance ?? 0), signal);
      })
    );
    console.log('getSip10AddressBalance', address, balances.length);

    return {
      address,
      usd: aggregateBaseCryptoAssetBalances(balances.map(b => b.usd)),
      sip10s: balances,
    };
  }

  async function getSip10TokenBalance(
    tokenId: string,
    amount: number,
    signal?: AbortSignal
  ): Promise<Sip10AssetBalance> {
    const tokenInfo = await sip10TokensService.getAssetInfo(tokenId, signal);
    const totalBalance = createMoney(amount, tokenInfo?.symbol ?? '', tokenInfo?.decimals ?? 0);
    const marketData = await marketDataService.getSip10MarketData(tokenInfo);
    return {
      asset: tokenInfo,
      sip10: createBaseCryptoAssetBalance(totalBalance),
      usd: createBaseCryptoAssetBalance(baseCurrencyAmountInQuote(totalBalance, marketData)),
    };
  }

  return {
    getSip10AddressBalance,
    getSip10AggregateBalance,
  };
}
