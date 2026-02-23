import { principalCV, standardPrincipalCV } from '@stacks/transactions';
import { inject, injectable } from 'inversify';

import { stxAsset } from '@leather.io/constants';
import {
  type AccountAddresses,
  type StacksProtocol,
  type StacksProtocolId,
  type YieldProduct,
  YieldProductCategories,
  type YieldProductCategory,
  type YieldProductKey,
  type ZestBorrowAsset,
  type ZestBorrowMarketPosition,
} from '@leather.io/models';
import { getStacksContractName } from '@leather.io/stacks';
import {
  baseCurrencyAmountInQuote,
  createMoney,
  initBigNumber,
  subtractMoney,
  sumMoney,
} from '@leather.io/utils';

import { FungibleAssetService } from '../../../assets/fungible-asset.service';
import { HiroStacksApiClient } from '../../../infrastructure/api/hiro/hiro-stacks-api.client';
import { LeatherApiClient } from '../../../infrastructure/api/leather/leather-api.client';
import type { SettingsService } from '../../../infrastructure/settings/settings.service';
import { Types } from '../../../inversify.types';
import { MarketDataService } from '../../../market/market-data.service';
import { YieldProductService } from '../../yield.service';
import {
  parseZestGetUserAssetsReadResponseCV,
  parseZestGetZTokenBalanceResponseCV,
  parseZestProtocolGetUserAssetBorrowBalanceResponseCV,
} from './zest-borrow.utils';
import { zestProductionAddress } from './zest.constants';

@injectable()
export class ZestBorrowService implements YieldProductService {
  providerKey: StacksProtocolId = 'zest';
  productKey: YieldProductKey = 'zest-borrow-market';
  productCategory: YieldProductCategory = 'lending';

  constructor(
    private readonly hiroStacksApiClient: HiroStacksApiClient,
    private readonly fungibleAssetService: FungibleAssetService,
    private readonly marketDataService: MarketDataService,
    private readonly leatherApiClient: LeatherApiClient,
    @inject(Types.SettingsService) private readonly settingsService: SettingsService
  ) {}

  getProvider(): Promise<StacksProtocol> {
    return Promise.resolve({
      id: this.providerKey,
      name: 'Zest',
      logo: '',
      url: '',
    });
  }

  getProduct(): Promise<YieldProduct> {
    return Promise.resolve({
      key: this.productKey,
      provider: this.providerKey,
      category: YieldProductCategories.LENDING,
      name: 'Zest Borrow',
      url: '',
    });
  }

  async getAccountPositions(
    account: AccountAddresses,
    signal?: AbortSignal
  ): Promise<ZestBorrowMarketPosition[]> {
    if (!account.stacks) {
      return [];
    }

    const positionAssets = await this.callGetUserAssetsRead(account.stacks.stxAddress, signal);

    const borrowPositions = await Promise.all(
      positionAssets.borrowedAssetPrincipals.map(async assetPrincipal =>
        this.getAssetBorrowPosition(account.stacks!.stxAddress, assetPrincipal, signal)
      )
    );

    const supplyPositions = await Promise.all(
      positionAssets.suppliedAssetPrincipals.map(async assetPrincipal =>
        this.getAssetSupplyPosition(account.stacks!.stxAddress, assetPrincipal, signal)
      )
    );

    if (borrowPositions.length === 0 && supplyPositions.length === 0) {
      return [];
    }

    const supplyValue = supplyPositions.length
      ? sumMoney(supplyPositions.map(p => p.balanceQuote))
      : createMoney(0, this.settingsService.getSettings().quoteCurrency);

    const borrowValue = borrowPositions.length
      ? sumMoney(borrowPositions.map(p => p.balanceQuote))
      : createMoney(0, this.settingsService.getSettings().quoteCurrency);

    return [
      {
        id: this.productKey,
        provider: 'zest',
        product: 'zest-borrow-market',
        totalBalance: subtractMoney(supplyValue, borrowValue),
        apy: 0,
        supplyBalance: supplyValue,
        borrowBalance: borrowValue,
        ltvPercentage: initBigNumber(borrowValue.amount)
          .dividedBy(initBigNumber(supplyValue.amount))
          .times(100)
          .toNumber(),
        borrowAssets: borrowPositions,
        supplyAssets: supplyPositions,
      },
    ];
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
      balance: assetCompoundedBalance,
      balanceQuote: baseCurrencyAmountInQuote(assetCompoundedBalance, marketData),
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
      balance: assetBalance,
      balanceQuote: baseCurrencyAmountInQuote(assetBalance, marketData),
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
