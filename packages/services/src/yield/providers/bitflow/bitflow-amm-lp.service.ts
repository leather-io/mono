import { injectable } from 'inversify';
import { isNonNullish } from 'remeda';

import { stxAsset } from '@leather.io/constants';
import {
  type AccountAddresses,
  type BitflowAmmLpPool,
  type BitflowAmmLpPosition,
  FungibleCryptoAsset,
  Money,
  type YieldProduct,
  YieldProductCategories,
  type YieldProductCategory,
  type YieldProductKey,
  YieldProductKeys,
  type YieldProvider,
  type YieldProviderKey,
  YieldProviderKeys,
} from '@leather.io/models';
import { getPrincipalFromAssetString } from '@leather.io/stacks';
import { baseCurrencyAmountInQuote, createMoney, initBigNumber, sumMoney } from '@leather.io/utils';

import type { FungibleAssetService } from '../../../assets/fungible-asset.service';
import type { HiroStacksApiClient } from '../../../infrastructure/api/hiro/hiro-stacks-api.client';
import type {
  LeatherApiBitflowPool,
  LeatherApiClient,
} from '../../../infrastructure/api/leather/leather-api.client';
import type { MarketDataService } from '../../../market/market-data.service';
import type { YieldProductService } from '../../yield-product.interface';
import { calculatePoolUnderlyingTokenBalance } from './bitflow.utils';

export interface BitflowPosition {
  totalValue: Money;
}

@injectable()
export class BitflowAmmLpService implements YieldProductService {
  providerKey: YieldProviderKey = YieldProviderKeys.bitflow;
  productKey: YieldProductKey = YieldProductKeys.bitflowAmmLp;
  productCategory: YieldProductCategory = YieldProductCategories.AMM;

  constructor(
    private readonly leatherApiClient: LeatherApiClient,
    private readonly fungibleAssetService: FungibleAssetService,
    private readonly hiroStacksApiClient: HiroStacksApiClient,
    private readonly marketDataService: MarketDataService
  ) {}

  getProvider(): Promise<YieldProvider> {
    return Promise.resolve({
      key: this.providerKey,
      name: 'Bitflow',
      logo: '',
      url: '',
    });
  }

  getProduct(): Promise<YieldProduct> {
    return Promise.resolve({
      key: this.productKey,
      provider: this.providerKey,
      category: this.productCategory,
      name: 'Bitflow AMM Liquidity Pools',
      url: '',
    });
  }
  async getAccountPosition(
    account: AccountAddresses,
    signal?: AbortSignal
  ): Promise<BitflowAmmLpPosition | null> {
    const pools = account.stacks
      ? await this.getBitflowAmmLpPools(account.stacks?.stxAddress, signal)
      : [];
    return pools.length > 0
      ? {
          provider: YieldProviderKeys.bitflow,
          product: YieldProductKeys.bitflowAmmLp,
          totalBalance: sumMoney(pools.map(p => p.lpToken.balanceQuote)),
          pools,
          updatedAtBlockHeight: 0,
          updatedAt: new Date(),
        }
      : null;
  }

  private async getBitflowAmmLpPools(
    address: string,
    signal?: AbortSignal
  ): Promise<BitflowAmmLpPool[]> {
    const [ftTokensBalances, poolMap] = await Promise.all([
      this.hiroStacksApiClient.getAddressFtBalances(address, { signal }),
      this.leatherApiClient.fetchBitflowPoolMap({ signal }),
    ]);
    const calls = [];
    for (const ftBalance of ftTokensBalances.results) {
      const principal = getPrincipalFromAssetString(ftBalance.token);
      if (poolMap[principal]) {
        calls.push(
          this.getBitflowAmmLpPool(Number(ftBalance.balance ?? 0), poolMap[principal], signal)
        );
      }
    }
    return (await Promise.all(calls)).filter(isNonNullish);
  }

  private async getBitflowPoolAsset(
    principal: string,
    signal?: AbortSignal
  ): Promise<FungibleCryptoAsset> {
    return principal === stxAsset.symbol
      ? stxAsset
      : await this.fungibleAssetService.getAsset({ protocol: 'sip10', id: principal }, signal);
  }

  private async getBitflowAmmLpPool(
    lpTokenBalance: number,
    pool: LeatherApiBitflowPool,
    signal?: AbortSignal
  ): Promise<BitflowAmmLpPool | null> {
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
