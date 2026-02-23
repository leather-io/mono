import { injectable } from 'inversify';
import { isNonNullish } from 'remeda';

import { stxAsset } from '@leather.io/constants';
import {
  type AccountAddresses,
  type BitflowAmmLpPosition,
  FungibleCryptoAsset,
  Money,
  type StacksProtocol,
  type StacksProtocolId,
  type YieldProduct,
  type YieldProductCategory,
  type YieldProductKey,
} from '@leather.io/models';
import { getPrincipalFromAssetString } from '@leather.io/stacks';
import { baseCurrencyAmountInQuote, createMoney, initBigNumber } from '@leather.io/utils';

import { FungibleAssetService } from '../../../assets/fungible-asset.service';
import { HiroStacksApiClient } from '../../../infrastructure/api/hiro/hiro-stacks-api.client';
import type {
  LeatherApiBitflowPool,
  LeatherApiClient,
} from '../../../infrastructure/api/leather/leather-api.client';
import { MarketDataService } from '../../../market/market-data.service';
import { YieldProductService } from '../../yield.service';
import { calculatePoolUnderlyingTokenBalance } from './bitflow.utils';

export interface BitflowPosition {
  totalValue: Money;
}

@injectable()
export class BitflowAmmLpService implements YieldProductService {
  providerKey: StacksProtocolId = 'bitflow';
  productKey: YieldProductKey = 'bitflow-amm-lp';
  productCategory: YieldProductCategory = 'amm';

  constructor(
    private readonly leatherApiClient: LeatherApiClient,
    private readonly fungibleAssetService: FungibleAssetService,
    private readonly hiroStacksApiClient: HiroStacksApiClient,
    private readonly marketDataService: MarketDataService
  ) {}

  getProvider(): Promise<StacksProtocol> {
    return Promise.resolve({
      id: this.providerKey,
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
  async getAccountPositions(
    account: AccountAddresses,
    signal?: AbortSignal
  ): Promise<BitflowAmmLpPosition[]> {
    if (!account.stacks) {
      return [];
    }
    const [ftTokensBalances, poolMap] = await Promise.all([
      this.hiroStacksApiClient.getAddressFtBalances(account.stacks.stxAddress, { signal }),
      this.leatherApiClient.fetchBitflowPoolMap({ signal }),
    ]);
    const calls = [];
    for (const ftBalance of ftTokensBalances.results) {
      const principal = getPrincipalFromAssetString(ftBalance.token);
      if (poolMap[principal]) {
        calls.push(
          this.getBitflowAmmLpPosition(Number(ftBalance.balance ?? 0), poolMap[principal], signal)
        );
      }
    }
    return (await Promise.all(calls)).filter(isNonNullish);
  }

  private async getBitflowAmmLpPosition(
    lpTokenBalance: number,
    pool: LeatherApiBitflowPool,
    signal?: AbortSignal
  ): Promise<BitflowAmmLpPosition | null> {
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

      const totalBalance = baseCurrencyAmountInQuote(lpAssetBalance, lpTokenMarketData);

      return {
        provider: 'bitflow',
        product: 'bitflow-amm-lp',
        id: `${this.productKey}-${pool.poolToken.principal}`,
        apy: pool.avgApy,
        totalBalance,
        poolSharePercentage: initBigNumber(lpTokenBalance)
          .dividedBy(initBigNumber(pool.totalShares))
          .toNumber(),
        lpToken: {
          asset: lpTokenAsset,
          balance: lpAssetBalance,
          balanceQuote: totalBalance,
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

  private async getBitflowPoolAsset(
    principal: string,
    signal?: AbortSignal
  ): Promise<FungibleCryptoAsset> {
    return principal === stxAsset.symbol
      ? stxAsset
      : await this.fungibleAssetService.getAsset({ protocol: 'sip10', id: principal }, signal);
  }
}
