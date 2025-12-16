import axios from 'axios';
import { inject, injectable } from 'inversify';
import PQueue from 'p-queue';
import { z } from 'zod';

import { Types } from '../../../inversify.types';
import type { HttpCacheService } from '../../cache/http-cache.service';
import { ApiRequestOptions } from '../types';
import { gammaCollectionMetadataSchema, gammaNftMetadataSchema } from './gamma-api.schema';

export type GammaNftMetadata = z.infer<typeof gammaNftMetadataSchema>;
export type GammaCollectionMetadata = z.infer<typeof gammaCollectionMetadataSchema>;

const defaultGammaApiUrl = 'https://gamma.io/api';

function getGammaApiUrl() {
  if (typeof process === 'undefined') return defaultGammaApiUrl;
  if (!process.env) return defaultGammaApiUrl;
  const overriddenUrl = process.env.NEXT_PUBLIC_GAMMA_API_URL;
  if (!overriddenUrl || overriddenUrl.trim() === '') return defaultGammaApiUrl;
  return overriddenUrl;
}

const GAMMA_API_URL = getGammaApiUrl();

const gammaApiLimiter = new PQueue({
  interval: 1000,
  intervalCap: 5,
  timeout: 60000,
});

@injectable()
export class GammaApiClient {
  constructor(@inject(Types.CacheService) private readonly cache: HttpCacheService) {}

  public async getStacksNft(
    contractPrincipal: string,
    tokenId: number,
    { signal, skipCache }: ApiRequestOptions = {}
  ): Promise<GammaNftMetadata> {
    const fetchFn = async () => {
      const res = await axios.get(
        `${GAMMA_API_URL}/get-stacks-nft?id=${contractPrincipal}_${tokenId}`,
        {
          signal,
        }
      );

      return gammaNftMetadataSchema.parse(res.data);
    };
    return skipCache
      ? await gammaApiLimiter.add(fetchFn)
      : await this.cache.fetchWithCache(
          ['gamma-api-get-stacks-nft', contractPrincipal, tokenId],
          () => gammaApiLimiter.add(fetchFn)
        );
  }

  public async getStacksCollection(
    contractPrincipal: string,
    { signal, skipCache }: ApiRequestOptions = {}
  ): Promise<GammaCollectionMetadata> {
    const fetchFn = async () => {
      const res = await axios.get(
        `${GAMMA_API_URL}/get-stacks-collection?contract_id_or_slug=${contractPrincipal}`,
        {
          signal,
        }
      );
      return gammaCollectionMetadataSchema.parse(res.data);
    };
    return skipCache
      ? await gammaApiLimiter.add(fetchFn)
      : await this.cache.fetchWithCache(
          ['gamma-api-get-stacks-collection', contractPrincipal],
          () => gammaApiLimiter.add(fetchFn)
        );
  }
}
