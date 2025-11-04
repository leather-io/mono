import { inject, injectable } from 'inversify';
import { isNonNullish } from 'remeda';

import { stxAsset } from '@leather.io/constants';
import { FungibleCryptoAsset, Money } from '@leather.io/models';
import { getPrincipalFromAssetString } from '@leather.io/stacks';
import { baseCurrencyAmountInQuote, createMoney, initBigNumber, sumMoney } from '@leather.io/utils';

import { FungibleAssetService } from '../../assets/fungible-asset.service';
import { HiroStacksApiClient } from '../../infrastructure/api/hiro/hiro-stacks-api.client';
import {
  LeatherApiBitflowPool,
  LeatherApiClient,
} from '../../infrastructure/api/leather/leather-api.client';
import type { SettingsService } from '../../infrastructure/settings/settings.service';
import { Types } from '../../inversify.types';
import { MarketDataService } from '../../market/market-data.service';
import { calculatePoolUnderlyingTokenBalance } from './bitflow.utils';

export interface BitflowPosition {
  totalValue: Money;
  pools: BitflowLpPosition[];
}

export interface BitflowLpPosition {
  apy: number;
  poolSharePercentage: number;
  lpToken: {
    asset: FungibleCryptoAsset;
    balance: Money;
    balanceQuote: Money;
  };
  tokenX: {
    asset: FungibleCryptoAsset;
    balance: Money;
    balanceQuote: Money;
  };
  tokenY: {
    asset: FungibleCryptoAsset;
    balance: Money;
    balanceQuote: Money;
  };
}

@injectable()
export class BitflowService {
  constructor(
    @inject(Types.SettingsService) private readonly settingsService: SettingsService,
    private readonly leatherApiClient: LeatherApiClient,
    private readonly fungibleAssetService: FungibleAssetService,
    private readonly hiroStacksApiClient: HiroStacksApiClient,
    private readonly marketDataService: MarketDataService
  ) {}

  public async getProtocolPosition(address: string, signal: AbortSignal): Promise<BitflowPosition> {
    const pools = await this.getBitflowLpPositions(address, signal);
    return {
      totalValue:
        pools.length > 0
          ? sumMoney(pools.map(p => p.lpToken.balanceQuote))
          : createMoney(0, this.settingsService.getSettings().quoteCurrency),
      pools,
    };
  }

  private async getBitflowLpPositions(
    address: string,
    signal: AbortSignal
  ): Promise<BitflowLpPosition[]> {
    const [ftTokensBalances, poolMap] = await Promise.all([
      this.hiroStacksApiClient.getAddressFtBalances(address, { signal }),
      this.leatherApiClient.fetchBitflowPoolMap({ signal }),
    ]);
    const calls = [];
    for (const ftBalance of ftTokensBalances.results) {
      const principal = getPrincipalFromAssetString(ftBalance.token);
      if (poolMap[principal]) {
        calls.push(
          this.getBitflowLpPosition(Number(ftBalance.balance ?? 0), poolMap[principal], signal)
        );
      }
    }
    return (await Promise.all(calls)).filter(isNonNullish);
  }

  private async getBitflowPoolAsset(
    principal: string,
    signal: AbortSignal
  ): Promise<FungibleCryptoAsset> {
    return principal === stxAsset.symbol
      ? stxAsset
      : await this.fungibleAssetService.getAsset({ protocol: 'sip10', id: principal }, signal);
  }

  private async getBitflowLpPosition(
    lpTokenBalance: number,
    pool: LeatherApiBitflowPool,
    signal: AbortSignal
  ): Promise<BitflowLpPosition | null> {
    try {
      const [tokenXAsset, tokenYAsset, lpTokenAsset] = await Promise.all([
        this.getBitflowPoolAsset(pool.tokenXPrincipal, signal),
        this.getBitflowPoolAsset(pool.tokenYPrincipal, signal),
        this.fungibleAssetService.getAsset(
          { protocol: 'sip10', id: pool.poolToken.principal },
          signal
        ),
      ]);

      const tokenXBalance = calculatePoolUnderlyingTokenBalance(
        initBigNumber(lpTokenBalance),
        initBigNumber(pool.balanceTokenX),
        initBigNumber(pool.totalShares)
      );
      const tokenYBalance = calculatePoolUnderlyingTokenBalance(
        initBigNumber(lpTokenBalance),
        initBigNumber(pool.balanceTokenY),
        initBigNumber(pool.totalShares)
      );
      const [tokenXMarketData, tokenYMarketData, lpTokenMarketData] = await Promise.all([
        this.marketDataService.getMarketData(tokenXAsset, signal),
        this.marketDataService.getMarketData(tokenYAsset, signal),
        this.marketDataService.getMarketData(lpTokenAsset, signal),
      ]);
      const lpAssetBalance = createMoney(
        lpTokenBalance,
        lpTokenAsset.symbol,
        lpTokenAsset.decimals
      );
      const assetXBalance = createMoney(tokenXBalance, tokenXAsset.symbol, tokenXAsset.decimals);
      const assetYBalance = createMoney(tokenYBalance, tokenYAsset.symbol, tokenYAsset.decimals);
      return {
        apy: pool.avgApy,
        poolSharePercentage: initBigNumber(lpTokenBalance)
          .dividedBy(initBigNumber(pool.totalShares))
          .toNumber(),
        lpToken: {
          asset: lpTokenAsset,
          balance: lpAssetBalance,
          balanceQuote: baseCurrencyAmountInQuote(lpAssetBalance, lpTokenMarketData),
        },
        tokenX: {
          asset: tokenXAsset,
          balance: assetXBalance,
          balanceQuote: baseCurrencyAmountInQuote(assetXBalance, tokenXMarketData),
        },
        tokenY: {
          asset: tokenYAsset,
          balance: assetYBalance,
          balanceQuote: baseCurrencyAmountInQuote(assetYBalance, tokenYMarketData),
        },
      };
    } catch {
      return null;
    }
  }
}
