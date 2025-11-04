import { principalCV, standardPrincipalCV } from '@stacks/transactions';
import { injectable } from 'inversify';

import { stxAsset } from '@leather.io/constants';
import { FungibleCryptoAsset, Money } from '@leather.io/models';
import { getStacksContractName } from '@leather.io/stacks';
import {
  baseCurrencyAmountInQuote,
  createMoney,
  initBigNumber,
  subtractMoney,
  sumMoney,
} from '@leather.io/utils';

import { FungibleAssetService } from '../../assets/fungible-asset.service';
import { HiroStacksApiClient } from '../../infrastructure/api/hiro/hiro-stacks-api.client';
import { LeatherApiClient } from '../../infrastructure/api/leather/leather-api.client';
import { MarketDataService } from '../../market/market-data.service';
import {
  parseZestGetUserAssetsReadResponseCV,
  parseZestGetZTokenBalanceResponseCV,
  parseZestProtocolGetUserAssetBorrowBalanceResponseCV,
} from './zest-borrow.utils';

export interface ZestBorrowPosition {
  totalValue: Money;
  supplyValue: Money;
  borrowValue: Money;
  ltvPercentage: number;
  borrowAssets: ZestBorrowAsset[];
  supplyAssets: ZestBorrowAsset[];
}

export interface ZestBorrowAsset {
  asset: FungibleCryptoAsset;
  apy: number;
  balance: Money;
  balanceQuote: Money;
}

const zestProductionAddress = 'SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N';

@injectable()
export class ZestBorrowService {
  constructor(
    private readonly hiroStacksApiClient: HiroStacksApiClient,
    private readonly fungibleAssetService: FungibleAssetService,
    private readonly marketDataService: MarketDataService,
    private readonly leatherApiClient: LeatherApiClient
  ) {}

  public async getBorrowPosition(
    address: string,
    signal: AbortSignal
  ): Promise<ZestBorrowPosition> {
    const userAssets = await this.callGetUserAssetsRead(address, signal);
    const borrowPositions = await Promise.all(
      userAssets.borrowedAssetPrincipals.map(async assetPrincipal =>
        this.getAssetBorrowPosition(address, assetPrincipal, signal)
      )
    );
    const supplyPositions = await Promise.all(
      userAssets.suppliedAssetPrincipals.map(async assetPrincipal =>
        this.getAssetSupplyPosition(address, assetPrincipal, signal)
      )
    );
    const supplyValue = sumMoney(supplyPositions.map(p => p.balanceQuote));
    const borrowValue = sumMoney(borrowPositions.map(p => p.balanceQuote));
    return {
      totalValue: subtractMoney(supplyValue, borrowValue),
      supplyValue,
      borrowValue,
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
    signal: AbortSignal
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
    signal: AbortSignal
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

  private async getZestAsset(assetPrincipal: string, signal: AbortSignal) {
    if (assetPrincipal.endsWith('.wstx')) {
      return stxAsset;
    }
    return this.fungibleAssetService.getAsset({ protocol: 'sip10', id: assetPrincipal }, signal);
  }

  private async callGetUserAssetsRead(address: string, signal: AbortSignal) {
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
    signal: AbortSignal
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
    signal: AbortSignal
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
