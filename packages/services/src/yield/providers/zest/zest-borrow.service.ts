import { principalCV, standardPrincipalCV } from '@stacks/transactions';
import { injectable } from 'inversify';

import { stxAsset } from '@leather.io/constants';
import {
  type AccountAddresses,
  type YieldProduct,
  YieldProductCategories,
  type YieldProductCategory,
  type YieldProductKey,
  YieldProductKeys,
  type YieldProvider,
  type YieldProviderKey,
  YieldProviderKeys,
  type ZestBorrowAsset,
  type ZestBorrowPosition,
} from '@leather.io/models';
import { getStacksContractName } from '@leather.io/stacks';
import {
  baseCurrencyAmountInQuote,
  createMoney,
  initBigNumber,
  subtractMoney,
  sumMoney,
} from '@leather.io/utils';

import type { FungibleAssetService } from '../../../assets/fungible-asset.service';
import type { HiroStacksApiClient } from '../../../infrastructure/api/hiro/hiro-stacks-api.client';
import type { LeatherApiClient } from '../../../infrastructure/api/leather/leather-api.client';
import type { MarketDataService } from '../../../market/market-data.service';
import type { YieldProductService } from '../../yield-product.interface';
import {
  parseZestGetUserAssetsReadResponseCV,
  parseZestGetZTokenBalanceResponseCV,
  parseZestProtocolGetUserAssetBorrowBalanceResponseCV,
} from './zest.utils';

const zestProductionAddress = 'SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N';

@injectable()
export class ZestBorrowService implements YieldProductService {
  providerKey: YieldProviderKey = YieldProviderKeys.zest;
  productKey: YieldProductKey = YieldProductKeys.zestBorrow;
  productCategory: YieldProductCategory = YieldProductCategories.LENDING;

  constructor(
    private readonly hiroStacksApiClient: HiroStacksApiClient,
    private readonly fungibleAssetService: FungibleAssetService,
    private readonly marketDataService: MarketDataService,
    private readonly leatherApiClient: LeatherApiClient
  ) {}

  getProvider(): Promise<YieldProvider> {
    return Promise.resolve({
      key: this.providerKey,
      name: 'Zest',
      logo: '',
      url: '',
    });
  }

  getProduct(): Promise<YieldProduct> {
    return Promise.resolve({
      key: this.productKey,
      provider: this.providerKey,
      category: this.productCategory,
      name: 'Zest Borrow Markets',
      url: '',
    });
  }

  async getAccountPosition(
    account: AccountAddresses,
    signal?: AbortSignal
  ): Promise<ZestBorrowPosition | null> {
    if (!account.stacks) {
      return null;
    }

    const userAssets = await this.callGetUserAssetsRead(account.stacks.stxAddress, signal);
    const borrowPositions = await Promise.all(
      userAssets.borrowedAssetPrincipals.map(async assetPrincipal =>
        this.getAssetBorrowPosition(account.stacks!.stxAddress, assetPrincipal, signal)
      )
    );
    const supplyPositions = await Promise.all(
      userAssets.suppliedAssetPrincipals.map(async assetPrincipal =>
        this.getAssetSupplyPosition(account.stacks!.stxAddress, assetPrincipal, signal)
      )
    );
    const supplyValue = sumMoney(supplyPositions.map(p => p.balanceQuote));
    const borrowValue = sumMoney(borrowPositions.map(p => p.balanceQuote));

    return {
      provider: YieldProviderKeys.zest,
      product: YieldProductKeys.zestBorrow,
      updatedAtBlockHeight: 0,
      updatedAt: new Date(),
      totalBalance: subtractMoney(supplyValue, borrowValue),
      supplyBalance: supplyValue,
      borrowBalance: borrowValue,
      ltvPercentage: initBigNumber(borrowValue.amount)
        .dividedBy(initBigNumber(supplyValue.amount))
        .times(100)
        .toNumber(),
      borrowAssets: borrowPositions,
      supplyAssets: supplyPositions,
    };
  }

  private async getAssetBorrowPosition(
    address: string,
    assetPrincipal: string,
    signal?: AbortSignal
  ): Promise<ZestBorrowAsset> {
    const [borrowBalance, reserve, asset] = await Promise.all([
      this.callGetUserBorrowBalance(address, assetPrincipal, signal),
      this.leatherApiClient.fetchZestReserve(assetPrincipal, { signal }),
      this.getZestAsset(assetPrincipal, signal),
    ]);
    const marketData = await this.marketDataService.getMarketData(asset, signal);
    const assetCompoundedBalance = createMoney(
      borrowBalance.compoundedBalance,
      asset.symbol,
      asset.decimals
    );
    return {
      asset,
      apy: reserve.borrowRate,
      balanceQuote: baseCurrencyAmountInQuote(assetCompoundedBalance, marketData),
      balance: assetCompoundedBalance,
    };
  }

  private async getAssetSupplyPosition(
    address: string,
    assetPrincipal: string,
    signal?: AbortSignal
  ): Promise<ZestBorrowAsset> {
    const [reserve, asset] = await Promise.all([
      this.leatherApiClient.fetchZestReserve(assetPrincipal, { signal }),
      this.getZestAsset(assetPrincipal, signal),
    ]);
    const [zTokenBalance, marketData] = await Promise.all([
      this.callZTokenGetBalance(reserve.zTokenPrincipal, address, signal),
      this.marketDataService.getMarketData(asset, signal),
    ]);
    const assetBalance = createMoney(zTokenBalance, asset.symbol, asset.decimals);
    return {
      asset,
      apy: reserve.supplyRate,
      balanceQuote: baseCurrencyAmountInQuote(assetBalance, marketData),
      balance: assetBalance,
    };
  }

  private async getZestAsset(assetPrincipal: string, signal?: AbortSignal) {
    if (assetPrincipal.endsWith('.wstx')) {
      return stxAsset;
    }
    return this.fungibleAssetService.getAsset({ protocol: 'sip10', id: assetPrincipal }, signal);
  }

  private async callGetUserAssetsRead(address: string, signal?: AbortSignal) {
    const response = await this.hiroStacksApiClient.callReadOnlyFunction(
      {
        contractAddress: zestProductionAddress,
        contractName: 'pool-reserve-data',
        functionName: 'get-user-assets-read',
        functionArgs: [standardPrincipalCV(address)],
      },
      { signal }
    );
    return parseZestGetUserAssetsReadResponseCV(response);
  }

  private async callGetUserBorrowBalance(
    address: string,
    assetPrincipal: string,
    signal?: AbortSignal
  ) {
    const response = await this.hiroStacksApiClient.callReadOnlyFunction(
      {
        contractAddress: zestProductionAddress,
        contractName: 'pool-0-reserve-v2-0',
        functionName: 'get-user-borrow-balance',
        functionArgs: [standardPrincipalCV(address), principalCV(assetPrincipal)],
      },
      { signal }
    );
    return parseZestProtocolGetUserAssetBorrowBalanceResponseCV(response);
  }

  private async callZTokenGetBalance(
    zTokenPrincipal: string,
    address: string,
    signal?: AbortSignal
  ): Promise<bigint> {
    const contractName = getStacksContractName(zTokenPrincipal);
    const response = await this.hiroStacksApiClient.callReadOnlyFunction(
      {
        contractAddress: zestProductionAddress,
        contractName,
        functionName: 'get-balance',
        functionArgs: [standardPrincipalCV(address)],
      },
      { signal }
    );
    return parseZestGetZTokenBalanceResponseCV(response);
  }
}
