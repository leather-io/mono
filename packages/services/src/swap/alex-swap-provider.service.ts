import { injectable } from 'inversify';
import { isNonNullish } from 'remeda';

import { stxAsset } from '@leather.io/constants';
import {
  type AlexSdkSwapQuote,
  SwapExecutionData,
  SwapProviderAsset,
  SwapProviderId,
  type SwappableFungibleCryptoAsset,
  isSwappableAsset,
} from '@leather.io/models';
import {
  convertAmountToFractionalUnit,
  createMoney,
  getAssetId,
  initBigNumber,
} from '@leather.io/utils';

import { FungibleAssetService } from '../assets/fungible-asset.service';
import {
  type AlexSdkAMMRoute,
  AlexSdkClient,
  type AlexSdkTokenInfo,
} from '../infrastructure/api/alex/alex-sdk.client';
import { LeatherApiClient } from '../infrastructure/api/leather/leather-api.client';
import {
  SwapProviderService,
  type SwapProviderServiceGetSwapExecutionDataParams,
  type SwapProviderServiceGetSwapQuotesParams,
  type SwapProviderServiceGetTargetAssetParams,
} from './swap-provider.interface';
import { calculateMinToReceiveAmount } from './swap.utils';

@injectable()
export class AlexSwapProviderService implements SwapProviderService {
  providerId: SwapProviderId = 'alex-sdk';

  constructor(
    private readonly alexSdkClient: AlexSdkClient,
    private readonly leatherApiClient: LeatherApiClient,
    private readonly fungibleAssetService: FungibleAssetService
  ) {}

  async getBaseSwapAssets(): Promise<SwapProviderAsset[]> {
    return this.getSwapAssets();
  }

  async getTargetAssets({
    baseProviderAsset,
  }: SwapProviderServiceGetTargetAssetParams): Promise<SwapProviderAsset[]> {
    const targetAssets = await this.getSwapAssets();
    return targetAssets.filter(
      asset => asset.providerAssetId !== baseProviderAsset.providerAssetId
    );
  }

  private async getSwapAssets(): Promise<SwapProviderAsset[]> {
    const alexSwappableTokens = await this.alexSdkClient.fetchSwappableCurrency();
    return alexSwappableTokens.map(token => this.mapSwapAsset(token));
  }

  private mapSwapAsset = (token: AlexSdkTokenInfo): SwapProviderAsset => {
    return {
      providerId: this.providerId,
      providerAssetId: token.id,
      assetId:
        token.name === stxAsset.symbol
          ? getAssetId(stxAsset)
          : {
              protocol: 'sip10',
              id: token.underlyingToken,
            },
    };
  };

  async getSwapQuotes(
    {
      baseAsset,
      baseProviderAsset,
      targetAsset,
      targetProviderAsset,
      baseAmount,
    }: SwapProviderServiceGetSwapQuotesParams,
    signal?: AbortSignal
  ): Promise<AlexSdkSwapQuote[]> {
    try {
      const route = await this.alexSdkClient.getRoute(
        baseProviderAsset.providerAssetId,
        targetProviderAsset.providerAssetId
      );

      const baseUnit = convertAmountToFractionalUnit(
        initBigNumber(baseAmount),
        baseAsset.decimals
      ).toNumber();

      const [amountTo, swapDexMap] = await Promise.all([
        this.alexSdkClient.getAmountTo(
          baseProviderAsset.providerAssetId,
          targetProviderAsset.providerAssetId,
          BigInt(baseUnit),
          route
        ),
        this.leatherApiClient.fetchSwapDexes({ signal }),
      ]);
      const amountToNum = Number(amountTo);

      return [
        {
          providerId: 'alex-sdk',
          executionType: 'stacks-contract-call',
          providerQuoteData: {
            baseProviderAssetId: baseProviderAsset.providerAssetId,
            targetProviderAssetId: targetProviderAsset.providerAssetId,
            alexSdkAmmRoute: route,
          },
          baseAmount,
          targetAmount: amountToNum,
          quote: createMoney(amountToNum, targetAsset.symbol, targetAsset.decimals),
          dexPath: route.map(() => swapDexMap['alex']),
          assetPath:
            route.length > 1
              ? await this.getAssetPathAssets(route, signal)
              : [baseAsset, targetAsset],
        },
      ];
    } catch {
      return [];
    }
  }

  private async getAssetPathAssets(
    route: AlexSdkAMMRoute,
    signal?: AbortSignal
  ): Promise<SwappableFungibleCryptoAsset[]> {
    const alexSwappableTokens = await this.alexSdkClient.fetchSwappableCurrency();

    const pathTokens = [
      // take both (from + neighbour) tokens from first route pool
      alexSwappableTokens.find(t => t.id === route[0].from),
      alexSwappableTokens.find(t => t.id === route[0].neighbour),
      // combine with neighbour token of successive pools
      ...(route.length > 1
        ? route.slice(1).map(segment => alexSwappableTokens.find(t => t.id === segment.neighbour))
        : []),
    ].filter(isNonNullish);

    const pathAssets = await Promise.all(
      pathTokens.map(a =>
        a.name === 'STX'
          ? Promise.resolve(stxAsset)
          : this.fungibleAssetService.getAsset({ protocol: 'sip10', id: a.underlyingToken }, signal)
      )
    );

    return pathAssets.filter(isSwappableAsset);
  }

  async getSwapExecutionData({
    request,
    quote,
    slippage,
  }: SwapProviderServiceGetSwapExecutionDataParams): Promise<SwapExecutionData> {
    if (quote.providerId !== 'alex-sdk') {
      throw new Error('Invalid quote provider id');
    }

    const minToAmount = calculateMinToReceiveAmount(quote.quote, slippage);

    const swapTx = await this.alexSdkClient.getSwapTx(
      request.account.stacks!.stxAddress,
      quote.providerQuoteData.baseProviderAssetId,
      quote.providerQuoteData.targetProviderAssetId,
      BigInt(quote.quote.amount.toNumber()),
      BigInt(minToAmount.amount.toNumber())
    );

    return {
      executionType: 'stacks-contract-call',
      providerId: 'alex-sdk',
      contractAddress: swapTx.contractAddress,
      contractName: swapTx.contractName,
      functionName: swapTx.functionName,
      functionArgs: swapTx.functionArgs,
      postConditions: swapTx.postConditions,
    };
  }
}
