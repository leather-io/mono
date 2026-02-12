import type { NonFungibleTokenHolding } from '@stacks/stacks-blockchain-api-types';
import { injectable } from 'inversify';
import { isNonNullish } from 'remeda';

import type { Sip9Asset } from '@leather.io/models';

import { Sip9AssetService } from '../assets/sip9-asset.service';
import { HiroStacksApiClient } from '../infrastructure/api/hiro/hiro-stacks-api.client';
import { AccountRequest } from '../types';
import { sortByBlockHeight } from './collectibles.utils';

@injectable()
export class Sip9sService {
  constructor(
    private readonly stacksApiClient: HiroStacksApiClient,
    private readonly sip9AssetsService: Sip9AssetService
  ) {}

  public async getAccountSip9s(
    request: AccountRequest,
    signal?: AbortSignal
  ): Promise<Sip9Asset[]> {
    if (!request.account.stacks) return [];

    try {
      const nftHoldings = await this.stacksApiClient.getNftHoldings(
        request.account.stacks.stxAddress,
        { signal }
      );

      const results = await Promise.all(
        nftHoldings
          .map(holding => ({ holding, blockHeight: holding.block_height }))
          .sort(sortByBlockHeight)
          .map(h => this.getOptionalSip9Asset(h.holding, signal))
      );
      return results
        .filter(isNonNullish)
        .filter(sip9 => sip9.name !== 'BNS - Archive')
        .filter(sip9 => sip9.content.contentUrl !== '');
    } catch {
      return [];
    }
  }

  private async getOptionalSip9Asset(
    holding: NonFungibleTokenHolding,
    signal?: AbortSignal
  ): Promise<Sip9Asset | null> {
    try {
      return await this.sip9AssetsService.getAsset(
        holding.asset_identifier,
        holding.value.hex,
        signal
      );
    } catch {
      return null;
    }
  }
}
