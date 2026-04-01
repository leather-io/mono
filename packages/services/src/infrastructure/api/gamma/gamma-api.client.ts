import axios from 'axios';
import { inject, injectable } from 'inversify';
import { z } from 'zod';

import { GAMMA_API_URL } from '@leather.io/constants';

import { Types } from '../../../inversify.types';
import type { HttpCacheService } from '../../cache/http-cache.service';
import { ApiRequestOptions } from '../types';
import { gammaCollectionMetadataSchema, gammaNftMetadataSchema } from './gamma-api.schema';

type GammaNftMetadata = z.infer<typeof gammaNftMetadataSchema>;
type GammaCollectionMetadata = z.infer<typeof gammaCollectionMetadataSchema>;

@injectable()
export class GammaApiClient {
  constructor(@inject(Types.CacheService) private readonly cache: HttpCacheService) {}

  public async getStacksNft(
    contractPrincipal: string,
    tokenId: number,
    { signal, skipCache }: ApiRequestOptions = {}
  ): Promise<GammaNftMetadata | null> {
    async function fetchFn() {
      try {
        const res = await axios.get(
          `${GAMMA_API_URL}/get-stacks-nft?id=${contractPrincipal}_${tokenId}`,
          {
            signal,
          }
        );

        return gammaNftMetadataSchema.parse(res.data);
      } catch (error) {
        if (axios.isAxiosError(error)) return null;
        throw error;
      }
    }
    return skipCache
      ? await fetchFn()
      : await this.cache.fetchWithCache(
          ['gamma-api-get-stacks-nft', contractPrincipal, tokenId],
          fetchFn
        );
  }

  public async getStacksCollection(
    contractPrincipal: string,
    { signal, skipCache }: ApiRequestOptions = {}
  ): Promise<GammaCollectionMetadata | null> {
    async function fetchFn() {
      try {
        const res = await axios.get(
          `${GAMMA_API_URL}/get-stacks-collection?contract_id_or_slug=${contractPrincipal}`,
          {
            signal,
          }
        );
        return gammaCollectionMetadataSchema.parse(res.data);
      } catch (error) {
        if (axios.isAxiosError(error)) return null;
        throw error;
      }
    }
    return skipCache
      ? await fetchFn()
      : await this.cache.fetchWithCache(
          ['gamma-api-get-stacks-collection', contractPrincipal],
          fetchFn
        );
  }
}
