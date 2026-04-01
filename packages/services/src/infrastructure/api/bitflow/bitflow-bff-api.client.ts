import { inject, injectable } from 'inversify';
import createClient from 'openapi-fetch';

import { Types } from '../../../inversify.types';
import { HttpCacheService } from '../../cache/http-cache.service';
import type { Environment } from '../../environment';
import type { components, paths } from './bitflow-bff-api.types';

const bitflowBffApiBaseUrl = 'https://bff.bitflowapis.finance';

interface BitflowBffApiQuoteParams {
  inputToken: string;
  outputToken: string;
  amountIn: string;
  slippageTolerance?: number;
}

interface BitflowBffApiSwapParams {
  quote: BitflowBffApiQuoteResponse;
  inputToken: string;
  outputToken: string;
  amountIn: string;
  slippageTolerance?: number;
}

export type BitflowBffApiToken = components['schemas']['TokenInfo'];
type BitflowBffApiPairsResponse = components['schemas']['PairsResponse'];
export type BitflowBffApiExecutionStep = components['schemas']['ExecutionStep'];
export type BitflowBffApiQuoteResponse = components['schemas']['QuoteResponse'];
export type BitflowBffApiSwapSimpleParameter = components['schemas']['SwapSimpleParameter'];
export type BitflowBffApiPostCondition = components['schemas']['PostCondition'];
type BitflowBffApiSwapResponse = components['schemas']['SwapResponse'];

@injectable()
export class BitflowBffApiClient {
  private readonly client;

  constructor(
    @inject(Types.Environment) env: Environment,
    @inject(Types.CacheService) private readonly cacheService: HttpCacheService
  ) {
    this.client = createClient<paths>({ baseUrl: bitflowBffApiBaseUrl });
    const apiKey = env.bitflow?.bitflowApiKey;
    if (apiKey) {
      this.client.use({
        onRequest({ request }) {
          request.headers.set('X-API-Key', apiKey);
          return request;
        },
      });
    }
  }

  async getTokens(signal?: AbortSignal): Promise<BitflowBffApiToken[]> {
    return this.cacheService.fetchWithCache(['bitflow-bff-api-tokens'], async () => {
      const { data } = await this.client.GET('/api/quotes/v1/tokens', { signal });
      return data?.tokens ?? [];
    });
  }

  async getPairs(inputToken: string, signal?: AbortSignal): Promise<BitflowBffApiPairsResponse> {
    return this.cacheService.fetchWithCache(['bitflow-bff-api-pairs', inputToken], async () => {
      const { data } = await this.client.GET('/api/quotes/v1/pairs', {
        params: { query: { input_token: inputToken } },
        signal,
      });
      return data!;
    });
  }

  async getQuote(
    params: BitflowBffApiQuoteParams,
    signal?: AbortSignal
  ): Promise<BitflowBffApiQuoteResponse> {
    return this.cacheService.fetchWithCache(
      ['bitflow-bff-api-quote', params.inputToken, params.outputToken, params.amountIn],
      async () => {
        const { data } = await this.client.POST('/api/quotes/v1/quote', {
          body: {
            input_token: params.inputToken,
            output_token: params.outputToken,
            amount_in: params.amountIn,
            amm_strategy: 'best',
            slippage_tolerance: params.slippageTolerance ?? null,
          },
          signal,
        });
        return data!;
      }
    );
  }

  async getSwapParams(
    params: BitflowBffApiSwapParams,
    signal?: AbortSignal
  ): Promise<BitflowBffApiSwapResponse> {
    const { data } = await this.client.POST('/api/quotes/v1/swap', {
      body: {
        execution_path: params.quote.execution_path,
        amount_in: params.amountIn,
        amount_out: params.quote.amount_out,
        input_token: params.inputToken,
        output_token: params.outputToken,
        input_token_decimals: params.quote.input_token_decimals,
        output_token_decimals: params.quote.output_token_decimals,
        slippage_tolerance: params.slippageTolerance ?? params.quote.slippage_tolerance,
        swap_parameters_type: 'simple',
      },
      signal,
    });
    return data!;
  }
}
