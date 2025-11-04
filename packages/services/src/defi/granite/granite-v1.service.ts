import { principalCV, standardPrincipalCV } from '@stacks/transactions';
import { inject, injectable } from 'inversify';
import { isNonNullish } from 'remeda';

import { FungibleCryptoAsset, Money } from '@leather.io/models';
import { baseCurrencyAmountInQuote, createMoney, subtractMoney, sumMoney } from '@leather.io/utils';

import { FungibleAssetService } from '../../assets/fungible-asset.service';
import { HiroStacksApiClient } from '../../infrastructure/api/hiro/hiro-stacks-api.client';
import { LeatherApiClient } from '../../infrastructure/api/leather/leather-api.client';
import type { SettingsService } from '../../infrastructure/settings/settings.service';
import { Types } from '../../inversify.types';
import { MarketDataService } from '../../market/market-data.service';
import {
  parseGraniteProtocolGetBalanceResponseCV,
  parseGraniteProtocolGetUserCollateralResponseCV,
  parseGraniteProtocolGetUserPositionResponseCV,
} from './granite-v1.utils';

export interface GraniteV1Position {
  totalValue: Money;
  collateralValue: Money;
  aeusdcMarket: GraniteV1Market;
  earn?: {
    balance: Money;
    balanceQuote: Money;
  };
  borrow?: {
    balance: Money;
    balanceQuote: Money;
  };
  collateral: GraniteV1CollateralAsset[];
}

export interface GraniteV1Market {
  asset: FungibleCryptoAsset;
  earnApy: number;
  borrowApy: number;
}

export interface GraniteV1CollateralAsset {
  asset: FungibleCryptoAsset;
  balance: Money;
  balanceQuote: Money;
}

const graniteProductionAddress = 'SP35E2BBMDT2Y1HB0NTK139YBGYV3PAPK3WA8BRNA';
const aeusdcAssetPrincipal = 'SP3Y2ZSH8P7D50B0VBTSX11S7XSG24M1VB9YFQA4K.token-aeusdc';

@injectable()
export class GraniteV1Service {
  constructor(
    private readonly hiroStacksApiClient: HiroStacksApiClient,
    private readonly fungibleAssetService: FungibleAssetService,
    private readonly marketDataService: MarketDataService,
    private readonly leatherApiClient: LeatherApiClient,
    @inject(Types.SettingsService) private readonly settingsService: SettingsService
  ) {}

  public async getV1Position(address: string, signal: AbortSignal): Promise<GraniteV1Position> {
    const aeusdcAsset = await this.fungibleAssetService.getAsset(
      { protocol: 'sip10', id: aeusdcAssetPrincipal },
      signal
    );
    const [userPosition, v1Balance, aeusdcMarketData, marketRates] = await Promise.all([
      this.callStateV1GetUserPosition(address, signal),
      this.callStateV1GetBalance(address, signal),
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
    const borrowBalanceQuote = baseCurrencyAmountInQuote(borrowBalance, aeusdcMarketData);

    const collateral = (
      await Promise.all(
        (userPosition?.collaterals ?? []).map(collateralPrincipal =>
          this.getCollateralAsset(address, collateralPrincipal, signal)
        )
      )
    ).filter(isNonNullish);

    const collateralValue =
      collateral.length > 0
        ? sumMoney(collateral.map(a => a.balanceQuote))
        : createMoney(0, this.settingsService.getSettings().quoteCurrency);

    return {
      totalValue: subtractMoney(sumMoney([earnBalanceQuote, collateralValue]), borrowBalanceQuote),
      collateralValue,
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
    signal: AbortSignal
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

  private async callStateV1GetUserPosition(address: string, signal: AbortSignal) {
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
    signal: AbortSignal
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

  private async callStateV1GetBalance(address: string, signal: AbortSignal) {
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
