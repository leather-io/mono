import BigNumber from 'bignumber.js';
import { injectable } from 'inversify';
import { isNonNullish } from 'remeda';

import { stxAsset } from '@leather.io/constants';
import {
  type BitflowBffApiSwapQuote,
  CryptoAssetProtocols,
  type FungibleAssetId,
  type SwapExecutionData,
  type SwapProviderAsset,
  type SwapProviderId,
  type SwappableFungibleCryptoAsset,
  isSwappableAsset,
} from '@leather.io/models';
import { createMoney, getAssetId } from '@leather.io/utils';

import { FungibleAssetService } from '../assets/fungible-asset.service';
import {
  BitflowBffApiClient,
  type BitflowBffApiExecutionStep,
  type BitflowBffApiQuoteResponse,
  type BitflowBffApiSwapSimpleParameter,
  type BitflowBffApiToken,
} from '../infrastructure/api/bitflow/bitflow-bff-api.client';
import { LeatherApiClient } from '../infrastructure/api/leather/leather-api.client';
import {
  convertBffApiPostConditions,
  convertBffApiSimpleSwapToFunctionArgs,
  parseSwapContractAddress,
} from './bitflow-bff-api-swap-provider.utils';
import {
  type GetSwapExecutionDataParams,
  type GetSwapQuotesParams,
  type GetTargetProviderAssetsParams,
  SwapProviderService,
} from './swap-provider.interface';
import { mapToStacksProtocol } from './swap.utils';

@injectable()
export class BitflowBffApiSwapProviderService implements SwapProviderService {
  providerId: SwapProviderId = 'bitflow-bff-api';

  constructor(
    private readonly bitflowBffApiClient: BitflowBffApiClient,
    private readonly leatherApiClient: LeatherApiClient,
    private readonly fungibleAssetService: FungibleAssetService
  ) {}

  async getBaseProviderAssets(signal?: AbortSignal): Promise<SwapProviderAsset[]> {
    const tokens = await this.bitflowBffApiClient.getTokens(signal);
    return tokens.map(token => this.mapTokenToSwapAsset(token));
  }

  async getTargetProviderAssets(
    { baseProviderAsset }: GetTargetProviderAssetsParams,
    signal?: AbortSignal
  ): Promise<SwapProviderAsset[]> {
    const [allAssets, pairsResponse] = await Promise.all([
      this.getBaseProviderAssets(signal),
      this.bitflowBffApiClient.getPairs(baseProviderAsset.providerAssetId, signal),
    ]);
    const validOutputTokens = new Set(pairsResponse.pairs.map(pair => pair.output_token));
    return allAssets.filter(asset => validOutputTokens.has(asset.providerAssetId));
  }

  async getSwapQuotes(
    params: GetSwapQuotesParams,
    signal?: AbortSignal
  ): Promise<BitflowBffApiSwapQuote[]> {
    const { baseAsset, baseProviderAsset, targetAsset, targetProviderAsset, baseAmount } = params;
    try {
      const [quoteResponse, swapDexMap] = await Promise.all([
        this.bitflowBffApiClient.getQuote(
          {
            inputToken: baseProviderAsset.providerAssetId,
            outputToken: targetProviderAsset.providerAssetId,
            amountIn: baseAmount.amount.integerValue(BigNumber.ROUND_DOWN).toFixed(0),
          },
          signal
        ),
        this.leatherApiClient.fetchSwapDexes({ signal }),
      ]);

      if (!quoteResponse.success) return [];

      const targetAmount = createMoney(
        new BigNumber(quoteResponse.amount_out).integerValue(BigNumber.ROUND_DOWN),
        targetAsset.symbol,
        targetAsset.decimals
      );

      const assetPath = await this.getAssetPathFromExecutionSteps(
        quoteResponse.execution_path,
        signal
      );

      const dexEntry = swapDexMap['bitflow'];

      return [
        {
          providerId: 'bitflow-bff-api',
          executionType: 'stacks-contract-call',
          providerQuoteData: {
            bitflowBffApiQuote: quoteResponse,
          },
          baseAsset,
          targetAsset,
          baseAmount,
          targetAmount,
          dexPath: dexEntry
            ? quoteResponse.execution_path.map(() => mapToStacksProtocol(dexEntry))
            : [],
          assetPath,
          isExecutable: true,
          executionConstraints: [],
          createdAt: new Date(),
        },
      ];
    } catch {
      return [];
    }
  }

  async getSwapExecutionData(
    { request, quote, slippagePercentage }: GetSwapExecutionDataParams,
    signal?: AbortSignal
  ): Promise<SwapExecutionData> {
    if (quote.providerId !== 'bitflow-bff-api') {
      throw new Error('Invalid quote provider id');
    }

    const stxAddress = request.account.stacks?.stxAddress;
    if (!stxAddress) {
      throw new Error('Stacks address required for swap execution');
    }

    const quoteResponse = quote.providerQuoteData.bitflowBffApiQuote as BitflowBffApiQuoteResponse;

    const inputToken = quoteResponse.route_path[0];
    const outputToken = quoteResponse.route_path[quoteResponse.route_path.length - 1];

    const swapResponse = await this.bitflowBffApiClient.getSwapParams(
      {
        quote: quoteResponse,
        inputToken,
        outputToken,
        amountIn: quote.baseAmount.amount.integerValue(BigNumber.ROUND_DOWN).toFixed(0),
        slippageTolerance: slippagePercentage.times(100).toNumber(),
      },
      signal
    );

    if (!swapResponse.success) {
      throw new Error('Bitflow BFF API swap params unavailable');
    }

    const { contractAddress, contractName } = parseSwapContractAddress(swapResponse.swap_contract);
    const functionArgs = convertBffApiSimpleSwapToFunctionArgs(
      swapResponse.swap_parameters as BitflowBffApiSwapSimpleParameter[]
    );
    const postConditions = convertBffApiPostConditions(swapResponse.post_conditions, stxAddress);

    return {
      executionType: 'stacks-contract-call',
      providerId: 'bitflow-bff-api',
      quote,
      contractAddress,
      contractName,
      functionName: swapResponse.function_name,
      functionArgs,
      postConditions,
    };
  }

  private mapTokenToSwapAsset(token: BitflowBffApiToken): SwapProviderAsset {
    if (token.symbol === stxAsset.symbol) {
      return {
        providerId: this.providerId,
        providerAssetId: token.contract_address,
        assetId: getAssetId(stxAsset),
      };
    }
    return {
      providerId: this.providerId,
      providerAssetId: token.contract_address,
      assetId: {
        protocol: CryptoAssetProtocols.sip10,
        id: `${token.contract_address}::${token.asset_name}`,
      },
    };
  }

  private async getAssetPathFromExecutionSteps(
    executionPath: BitflowBffApiExecutionStep[],
    signal?: AbortSignal
  ): Promise<SwappableFungibleCryptoAsset[]> {
    if (executionPath.length === 0) return [];

    const allAssets = await this.getBaseProviderAssets(signal);

    const tokenTraits: string[] = [executionPath[0].x_token_trait];
    for (const step of executionPath) {
      const lastToken = tokenTraits[tokenTraits.length - 1];
      if (step.x_token_trait === lastToken) {
        tokenTraits.push(step.y_token_trait);
      } else {
        tokenTraits.push(step.x_token_trait);
      }
    }

    const promises = tokenTraits
      .map(trait => allAssets.find(a => a.providerAssetId === trait))
      .filter(isNonNullish)
      .map(a => this.fungibleAssetService.getAsset(a.assetId as FungibleAssetId, signal));

    const results = await Promise.allSettled(promises);
    return results
      .map(result => (result.status === 'fulfilled' ? result.value : null))
      .filter(isNonNullish)
      .filter(isSwappableAsset);
  }
}
