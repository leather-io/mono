import { principalCV, standardPrincipalCV } from '@stacks/transactions';
import { inject, injectable } from 'inversify';
import { isNonNullish } from 'remeda';

import {
  type AccountAddresses,
  type GraniteV1CollateralAsset,
  type GraniteV1Position,
  type YieldProduct,
  YieldProductCategories,
  type YieldProductCategory,
  type YieldProductKey,
  YieldProductKeys,
  type YieldProvider,
  type YieldProviderKey,
  YieldProviderKeys,
} from '@leather.io/models';
import { baseCurrencyAmountInQuote, createMoney, subtractMoney, sumMoney } from '@leather.io/utils';

import type { FungibleAssetService } from '../../../assets/fungible-asset.service';
import type { HiroStacksApiClient } from '../../../infrastructure/api/hiro/hiro-stacks-api.client';
import type { LeatherApiClient } from '../../../infrastructure/api/leather/leather-api.client';
import type { SettingsService } from '../../../infrastructure/settings/settings.service';
import { Types } from '../../../inversify.types';
import type { MarketDataService } from '../../../market/market-data.service';
import type { YieldProductService } from '../../yield-product.interface';
import {
  parseGraniteProtocolGetBalanceResponseCV,
  parseGraniteProtocolGetUserCollateralResponseCV,
  parseGraniteProtocolGetUserPositionResponseCV,
} from './granite.utils';

const graniteProductionAddress = 'SP35E2BBMDT2Y1HB0NTK139YBGYV3PAPK3WA8BRNA';
const aeusdcAssetPrincipal = 'SP3Y2ZSH8P7D50B0VBTSX11S7XSG24M1VB9YFQA4K.token-aeusdc';

@injectable()
export class GraniteV1Service implements YieldProductService {
  providerKey: YieldProviderKey = YieldProviderKeys.granite;
  productKey: YieldProductKey = YieldProductKeys.graniteV1;
  productCategory: YieldProductCategory = YieldProductCategories.LENDING;

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
      name: 'Granite aeUSDC Market V1',
      url: '',
    });
  }

  async getAccountPosition(
    account: AccountAddresses,
    signal?: AbortSignal
  ): Promise<GraniteV1Position | null> {
    if (!account.stacks) {
      return null;
    }

    const aeusdcAsset = await this.fungibleAssetService.getAsset(
      { protocol: 'sip10', id: aeusdcAssetPrincipal },
      signal
    );
    const [userPosition, v1Balance, aeusdcMarketData, marketRates] = await Promise.all([
      this.callStateV1GetUserPosition(account.stacks.stxAddress, signal),
      this.callStateV1GetBalance(account.stacks.stxAddress, signal),
      this.marketDataService.getMarketData(aeusdcAsset, signal),
      this.leatherApiClient.fetchGraniteMarket(aeusdcAssetPrincipal, { signal }),
    ]);

    const earnBalance = createMoney(v1Balance, aeusdcAsset.symbol, aeusdcAsset.decimals);
    const earnBalanceQuote = baseCurrencyAmountInQuote(earnBalance, aeusdcMarketData);

    const borrowBalance = createMoney(
      userPosition?.borrowedAmount ?? 0,
      aeusdcAsset.symbol,
      aeusdcAsset.decimals
    );

    if (!earnBalance.amount.isGreaterThan(0) && !borrowBalance.amount.isGreaterThan(0)) {
      return null;
    }

    const borrowBalanceQuote = baseCurrencyAmountInQuote(borrowBalance, aeusdcMarketData);

    const collateral = (
      await Promise.all(
        (userPosition?.collaterals ?? []).map(collateralPrincipal =>
          this.getCollateralAsset(account.stacks!.stxAddress, collateralPrincipal, signal)
        )
      )
    ).filter(isNonNullish);

    const collateralBalance =
      collateral.length > 0
        ? sumMoney(collateral.map(a => a.balanceQuote))
        : createMoney(0, this.settingsService.getSettings().quoteCurrency);

    return {
      provider: YieldProviderKeys.granite,
      product: YieldProductKeys.graniteV1,
      updatedAtBlockHeight: 0,
      updatedAt: new Date(),
      totalBalance: subtractMoney(
        sumMoney([earnBalanceQuote, collateralBalance]),
        borrowBalanceQuote
      ),
      collateralBalance,
      aeusdcMarket: {
        asset: aeusdcAsset,
        earnApy: marketRates.earnApy,
        borrowApy: marketRates.borrowApy,
      },
      ...(earnBalance.amount.isGreaterThan(0) && {
        earn: { balance: earnBalance, balanceQuote: earnBalanceQuote },
      }),
      ...(borrowBalance.amount.isGreaterThan(0) && {
        borrow: { balance: borrowBalance, balanceQuote: borrowBalanceQuote },
      }),
      collateral: collateral,
    };
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
      asset: asset,
      balanceQuote: baseCurrencyAmountInQuote(collateralAssetValue, marketData),
      balance: collateralAssetValue,
    };
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

  private async callStateV1GetBalance(address: string, signal?: AbortSignal) {
    const response = await this.hiroStacksApiClient.callReadOnlyFunction(
      {
        contractAddress: graniteProductionAddress,
        contractName: 'state-v1',
        functionName: 'get-balance',
        functionArgs: [standardPrincipalCV(address)],
      },
      { signal }
    );
    return parseGraniteProtocolGetBalanceResponseCV(response);
  }
}
