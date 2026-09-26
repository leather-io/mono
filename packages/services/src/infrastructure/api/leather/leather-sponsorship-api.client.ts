import { inject, injectable } from 'inversify';
import { v4 as uuidv4 } from 'uuid';
import type { ZodType } from 'zod';

import { LEATHER_API_URL_PRODUCTION, LEATHER_API_URL_STAGING } from '@leather.io/constants';

import { Types } from '../../../inversify.types';
import type { Environment } from '../../environment';
import { leatherApiPriorities } from '../../rate-limiter/leather-rate-limiter';
import { RateLimiterService, RateLimiterType } from '../../rate-limiter/rate-limiter.service';
import type { ApiRequestOptions } from '../types';
import { LeatherApiError, readLeatherApiErrorData } from './leather-api.error';
import {
  type SbtcSponsorshipQuoteRequest,
  type SbtcSponsorshipQuoteResponse,
  type SbtcSponsorshipSubmitRequest,
  type SbtcSponsorshipSubmitResponse,
  sbtcSponsorshipQuoteResponseSchema,
  sbtcSponsorshipSubmitResponseSchema,
} from './leather-sponsorship-api.types';

const leatherSponsorshipApiPath = '/v1/sponsorship';
const sbtcSponsorshipQuotePath = '/quote';
const sbtcSponsorshipSubmitPath = '/submit';

function getLeatherApiBaseUrl(env: Environment) {
  if (env.environment === 'production') return LEATHER_API_URL_PRODUCTION;
  return env.leatherApiUrl ?? LEATHER_API_URL_STAGING;
}

function getSponsorshipApiBaseUrl(env: Environment) {
  if (env.sponsorshipApiUrl) return env.sponsorshipApiUrl.replace(/\/+$/, '');
  return `${getLeatherApiBaseUrl(env)}${leatherSponsorshipApiPath}`;
}

@injectable()
export class LeatherSponsorshipApiClient {
  private readonly baseUrl: string;
  private readonly clientId = uuidv4();

  constructor(
    @inject(Types.Environment) env: Environment,
    private readonly rateLimiter: RateLimiterService
  ) {
    this.baseUrl = getSponsorshipApiBaseUrl(env);
  }

  private async post<T>(
    path: string,
    body: unknown,
    responseSchema: ZodType<T>,
    signal?: AbortSignal
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Client-ID': this.clientId },
      body: JSON.stringify(body),
      signal,
    });
    if (!response.ok) {
      throw new LeatherApiError(
        response.url,
        response.status,
        response.statusText,
        await readLeatherApiErrorData(response)
      );
    }
    return responseSchema.parse(await response.json());
  }

  async fetchQuote(
    body: SbtcSponsorshipQuoteRequest,
    { signal }: ApiRequestOptions = {}
  ): Promise<SbtcSponsorshipQuoteResponse> {
    return this.rateLimiter.add(
      RateLimiterType.Leather,
      () => this.post(sbtcSponsorshipQuotePath, body, sbtcSponsorshipQuoteResponseSchema, signal),
      { priority: leatherApiPriorities.sbtcSponsorshipQuote, signal }
    );
  }

  async submitTransaction(
    body: SbtcSponsorshipSubmitRequest,
    { signal }: ApiRequestOptions = {}
  ): Promise<SbtcSponsorshipSubmitResponse> {
    return this.rateLimiter.add(
      RateLimiterType.Leather,
      () => this.post(sbtcSponsorshipSubmitPath, body, sbtcSponsorshipSubmitResponseSchema, signal),
      { priority: leatherApiPriorities.sbtcSponsorshipSubmit, signal }
    );
  }
}
