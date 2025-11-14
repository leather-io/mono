import { principalCV, standardPrincipalCV } from '@stacks/transactions';
import { inject, injectable } from 'inversify';
import { isNonNullish } from 'remeda';

import type {
  AccountAddresses,
  GraniteV1BorrowPosition,
  GraniteV1CollateralAsset,
  YieldProduct,
  YieldProductCategory,
  YieldProductKey,
  YieldProvider,
  YieldProviderKey,
} from '@leather.io/models';
import { baseCurrencyAmountInQuote, createMoney, subtractMoney, sumMoney } from '@leather.io/utils';

import { FungibleAssetService } from '../../../assets/fungible-asset.service';
import { HiroStacksApiClient } from '../../../infrastructure/api/hiro/hiro-stacks-api.client';
import { LeatherApiClient } from '../../../infrastructure/api/leather/leather-api.client';
import type { SettingsService } from '../../../infrastructure/settings/settings.service';
import { Types } from '../../../inversify.types';
import { MarketDataService } from '../../../market/market-data.service';
import { YieldProductService } from '../../yield.service';
import {
  parseGraniteProtocolGetUserCollateralResponseCV,
  parseGraniteProtocolGetUserPositionResponseCV,
} from './granite-v1.utils';
import { aeusdcAssetPrincipal, graniteProductionAddress } from './granite.constants';

@injectable()
export class GraniteV1BorrowService implements YieldProductService {
  providerKey: YieldProviderKey = 'granite';
  productKey: YieldProductKey = 'granite-v1-borrow';
  productCategory: YieldProductCategory = 'lending';

  constructor(
    private readonly hiroStacksApiClient: HiroStacksApiClient,
    private readonly fungibleAssetService: FungibleAssetService,
    private readonly marketDataService: MarketDataService,
    private readonly leatherApiClient: LeatherApiClient,
    @inject(Types.SettingsService) private readonly settingsService: SettingsService
  ) {}

  getProvider(): Promise<YieldProvider> {
    return Promise.resolve({
      key: this.providerKey,
      name: 'Granite',
      logo: '',
      url: '',
    });
  }

  getProduct(): Promise<YieldProduct> {
    return Promise.resolve({
      key: this.productKey,
      provider: this.providerKey,
      category: this.productCategory,
      name: 'Granite V1 Borrow',
      url: '',
    });
  }

  async getAccountPositions(
    account: AccountAddresses,
    signal?: AbortSignal
  ): Promise<GraniteV1BorrowPosition[]> {
    if (!account.stacks) {
      return [];
    }

    const aeusdcAsset = await this.fungibleAssetService.getAsset(
      { protocol: 'sip10', id: aeusdcAssetPrincipal },
      signal
    );
    const [userPosition, aeusdcMarketData, marketRates] = await Promise.all([
      this.callStateV1GetUserPosition(account.stacks.stxAddress, signal),
      this.marketDataService.getMarketData(aeusdcAsset, signal),
      this.leatherApiClient.fetchGraniteMarket(aeusdcAssetPrincipal, { signal }),
    ]);

    const borrowBalance = createMoney(
      userPosition?.borrowedAmount ?? 0,
      aeusdcAsset.symbol,
      aeusdcAsset.decimals
    );

    if (!borrowBalance.amount.isGreaterThan(0)) {
      return [];
    }

    const borrowBalanceQuote = baseCurrencyAmountInQuote(borrowBalance, aeusdcMarketData);

    const collateral = (
      await Promise.all(
        (userPosition?.collaterals ?? []).map(collateralPrincipal =>
          this.getCollateralAsset(account.stacks!.stxAddress, collateralPrincipal, signal)
        )
      )
    ).filter(isNonNullish);

    const collateralBalanceQuote =
      collateral.length > 0
        ? sumMoney(collateral.map(a => a.balanceQuote))
        : createMoney(0, this.settingsService.getSettings().quoteCurrency);

    return [
      {
        id: this.productKey,
        provider: 'granite',
        product: 'granite-v1-borrow',
        totalBalance: subtractMoney(collateralBalanceQuote, borrowBalanceQuote),
        apy: marketRates.borrowApy,
        marketAsset: aeusdcAsset,
        marketAssetBorrowBalance: borrowBalance,
        marketAssetBorrowBalanceQuote: borrowBalanceQuote,
        collateral,
        collateralBalanceQuote,
      },
    ];
  }

  private async callStateV1GetUserPosition(address: string, signal?: AbortSignal) {
    const response = await this.hiroStacksApiClient.callReadOnlyFunction(
      {
        contractAddress: graniteProductionAddress,
        contractName: 'state-v1',
        functionName: 'get-user-position',
        functionArgs: [standardPrincipalCV(address)],
      },
      { signal }
    );
    return parseGraniteProtocolGetUserPositionResponseCV(response);
  }

  private async getCollateralAsset(
    address: string,
    collateralPrincipal: string,
    signal?: AbortSignal
  ): Promise<GraniteV1CollateralAsset | null> {
    const [collateralRawAmount, asset] = await Promise.all([
      this.callStateV1GetUserCollateral(address, collateralPrincipal, signal),
      this.fungibleAssetService.getAsset({ protocol: 'sip10', id: collateralPrincipal }, signal),
    ]);
    if (collateralRawAmount === null || asset === null || !asset) {
      return null;
    }
    const marketData = await this.marketDataService.getMarketData(asset, signal);
    const collateralAssetValue = createMoney(collateralRawAmount, asset.symbol, asset.decimals);
    return {
      asset,
      balanceQuote: baseCurrencyAmountInQuote(collateralAssetValue, marketData),
      balance: collateralAssetValue,
    };
  }

  private async callStateV1GetUserCollateral(
    address: string,
    collateralPrincipal: string,
    signal?: AbortSignal
  ) {
    const response = await this.hiroStacksApiClient.callReadOnlyFunction(
      {
        contractAddress: graniteProductionAddress,
        contractName: 'state-v1',
        functionName: 'get-user-collateral',
        functionArgs: [standardPrincipalCV(address), principalCV(collateralPrincipal)],
      },
      { signal }
    );
    return parseGraniteProtocolGetUserCollateralResponseCV(response);
  }
}
