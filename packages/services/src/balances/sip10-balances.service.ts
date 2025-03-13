import { CryptoAssetBalance, Sip10CryptoAssetInfo } from '@leather.io/models';
import {
  aggregateBaseCryptoAssetBalances,
  baseCurrencyAmountInQuote,
  createBaseCryptoAssetBalance,
  createMoney,
} from '@leather.io/utils';

import { Sip10AssetService } from '../assets/sip10-asset.service';
import { HiroStacksApiClient } from '../infrastructure/api/hiro/hiro-stacks-api.client';
import { SettingsService } from '../infrastructure/settings/settings.service';
import { MarketDataService } from '../market-data/market-data.service';
import { combineSip10Balances, sortByAvailableFiatBalance } from './sip10-balances.utils';

export interface Sip10Balance {
  asset: Sip10CryptoAssetInfo;
  fiat: CryptoAssetBalance;
  crypto: CryptoAssetBalance;
}

export interface Sip10AggregateBalance {
  fiat: CryptoAssetBalance;
  sip10s: Sip10Balance[];
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
  settingsService: SettingsService,
  stacksApiClient: HiroStacksApiClient,
  marketDataService: MarketDataService,
  sip10TokensService: Sip10AssetService
): Sip10BalancesService {
  /**
   * Gets combined SIP10 token balances of provided Stacks address list. Includes cumulative fiat value.
   */
  async function getSip10AggregateBalance(addresses: string[], signal?: AbortSignal) {
    const addressBalances = await Promise.all(
      addresses.map(address => getSip10AddressBalance(address, signal))
    );

    const cumulativeFiatBalance =
      addressBalances.length > 0
        ? aggregateBaseCryptoAssetBalances(addressBalances.map(r => r.fiat))
        : createBaseCryptoAssetBalance(createMoney(0, settingsService.getSettings().fiatCurrency));

    return {
      fiat: cumulativeFiatBalance,
      sip10s: combineSip10Balances(addressBalances).sort(sortByAvailableFiatBalance),
    };
  }

  /**
   * Gets all SIP10 balances for given address. Includes cumulative fiat value.
   */
  async function getSip10AddressBalance(address: string, signal?: AbortSignal) {
    const fungibleTokens = (await stacksApiClient.getAddressBalances(address, signal))
      .fungible_tokens;

    const sip10Balances = (
      await Promise.allSettled(
        Object.keys(fungibleTokens)
          .filter(tokenId => Number(fungibleTokens[tokenId]?.balance ?? 0) !== 0)
          .map(tokenId =>
            getSip10TokenBalance(tokenId, Number(fungibleTokens[tokenId]?.balance ?? 0), signal)
          )
      )
    )
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value);

    const cumulativeFiatBalance =
      sip10Balances.length > 0
        ? aggregateBaseCryptoAssetBalances(sip10Balances.map(b => b.fiat))
        : createBaseCryptoAssetBalance(createMoney(0, settingsService.getSettings().fiatCurrency));

    return {
      address,
      fiat: cumulativeFiatBalance,
      sip10s: sip10Balances.sort(sortByAvailableFiatBalance),
    };
  }

  async function getSip10TokenBalance(
    tokenId: string,
    amount: number,
    signal?: AbortSignal
  ): Promise<Sip10Balance> {
    const asset = await sip10TokensService.getAssetInfo(tokenId, signal);
    const totalBalance = createMoney(amount, asset.symbol, asset.decimals);
    const marketData = await marketDataService.getSip10MarketData(asset);

    return {
      asset,
      fiat: createBaseCryptoAssetBalance(baseCurrencyAmountInQuote(totalBalance, marketData)),
      crypto: createBaseCryptoAssetBalance(totalBalance),
    };
  }

  return {
    getSip10AddressBalance,
    getSip10AggregateBalance,
  };
}
