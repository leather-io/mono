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

const GAMMA_API_URL = 'https://gamma.io/api';

const gammaApiLimiter = new PQueue({
  interval: 1000,
  intervalCap: 5,
  timeout: 60000,
});

async function runWithGammaLimiter<T>(fn: () => Promise<T>): Promise<T> {
  const result = await gammaApiLimiter.add(fn);
  if (result === undefined) {
    throw new Error('Gamma rate limited call undefined');
  }
  return result;
}

@injectable()
export class GammaApiClient {
  constructor(@inject(Types.CacheService) private readonly cache: HttpCacheService) {}

  public async getStacksNft(
    contractPrincipal: string,
    tokenId: number,
    { signal, skipCache }: ApiRequestOptions = {}
  ): Promise<GammaNftMetadata> {
    async function fetchFn(): Promise<GammaNftMetadata> {
      const res = await axios.get(
        `${GAMMA_API_URL}/get-stacks-nft?id=${contractPrincipal}_${tokenId}`,
        {
          signal,
        }
      );

      return gammaNftMetadataSchema.parse(res.data);
    }
    return skipCache
      ? await runWithGammaLimiter(fetchFn)
      : await this.cache.fetchWithCache(
          ['gamma-api-get-stacks-nft', contractPrincipal, tokenId],
          () => runWithGammaLimiter(fetchFn)
        );
  }

  public async getStacksCollection(
    contractPrincipal: string,
    { signal, skipCache }: ApiRequestOptions = {}
  ): Promise<GammaCollectionMetadata> {
    async function fetchFn(): Promise<GammaCollectionMetadata> {
      const res = await axios.get(
        `${GAMMA_API_URL}/get-stacks-collection?contract_id_or_slug=${contractPrincipal}`,
        {
          signal,
        }
      );
      return gammaCollectionMetadataSchema.parse(res.data);
    }
    return skipCache
      ? await runWithGammaLimiter(fetchFn)
      : await this.cache.fetchWithCache(
          ['gamma-api-get-stacks-collection', contractPrincipal],
          () => runWithGammaLimiter(fetchFn)
        );
  }
}
