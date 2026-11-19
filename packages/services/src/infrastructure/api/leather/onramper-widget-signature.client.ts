import { inject, injectable } from 'inversify';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

import { LEATHER_API_URL_PRODUCTION, LEATHER_API_URL_STAGING } from '@leather.io/constants';

import { Types } from '../../../inversify.types';
import type { Environment } from '../../environment';
import { leatherApiPriorities } from '../../rate-limiter/leather-rate-limiter';
import { RateLimiterService, RateLimiterType } from '../../rate-limiter/rate-limiter.service';
import { LeatherApiError, readLeatherApiErrorData } from './leather-api.error';

const onramperWidgetSignaturePath = '/v1/onramp/widget-signature';

const onramperWidgetSignatureSchema = z.object({
  sigV2: z.string().startsWith('v2:'),
  sigV2Timestamp: z.string(),
  sigV2Nonce: z.string(),
  sigV2Fields: z.string(),
  endUserIpHash: z.string().regex(/^[0-9a-f]{64}$/),
});

export type OnramperWidgetSignature = z.infer<typeof onramperWidgetSignatureSchema>;

@injectable()
export class OnramperWidgetSignatureClient {
  private readonly baseUrl: string;
  private readonly clientId = uuidv4();

  constructor(
    @inject(Types.Environment) env: Environment,
    private readonly rateLimiter: RateLimiterService
  ) {
    this.baseUrl =
      env.environment === 'production'
        ? LEATHER_API_URL_PRODUCTION
        : (env.leatherApiUrl ?? LEATHER_API_URL_STAGING);
  }

  async signWidgetParams(
    params: Record<string, string>,
    signal?: AbortSignal
  ): Promise<OnramperWidgetSignature> {
    const response = await this.rateLimiter.add(
      RateLimiterType.Leather,
      () =>
        fetch(`${this.baseUrl}${onramperWidgetSignaturePath}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Client-ID': this.clientId },
          body: JSON.stringify({ params }),
          signal,
        }),
      { priority: leatherApiPriorities.onramperWidgetSignature, signal }
    );
    if (!response.ok) {
      throw new LeatherApiError(
        response.url,
        response.status,
        response.statusText,
        await readLeatherApiErrorData(response)
      );
    }
    const body: unknown = await response.json();
    const result = onramperWidgetSignatureSchema.safeParse(body);
    if (!result.success) {
      throw new LeatherApiError(response.url, response.status, response.statusText, {
        error: 'Unexpected widget signature response',
      });
    }
    return result.data;
  }
}
