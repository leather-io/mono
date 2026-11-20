import { injectable } from 'inversify';
import { isNonNullish } from 'remeda';

import { type Sip9Asset, bnsV1AssetIdentifiers } from '@leather.io/models';

import { Sip9AssetService } from '../assets/sip9-asset.service';
import { createBnsV1Sip9Asset } from '../assets/sip9-asset.utils';
import { HiroStacksApiClient } from '../infrastructure/api/hiro/hiro-stacks-api.client';
import type { HiroPrincipalNftBalance } from '../infrastructure/api/hiro/hiro-stacks-api.types';
import { AccountRequest } from '../types';
import { isLpToken } from './collectibles.utils';

const bnsArchiveAssetIdentifier = 'SP2JMM3PH9AGMASBD11SHG4HWDS6CTY9MGN6CW48G.BNS-V2::BNS-V2';

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
      const nftHoldings = await this.stacksApiClient.getPrincipalNftBalances(
        request.account.stacks.stxAddress,
        { maxPages: 10 },
        { signal }
      );

      const results = await Promise.all(
        nftHoldings
          .filter(h => !isLpToken(h.asset_identifier))
          .filter(h => h.asset_identifier !== bnsArchiveAssetIdentifier)
          .map(holding => this.getOptionalSip9Asset(holding, signal))
      );
      return results.filter(isNonNullish).filter(sip9 => sip9.name !== 'BNS - Archive');
    } catch {
      return [];
    }
  }

  private async getOptionalSip9Asset(
    holding: HiroPrincipalNftBalance,
    signal?: AbortSignal
  ): Promise<Sip9Asset | null> {
    try {
      if (bnsV1AssetIdentifiers.includes(holding.asset_identifier)) {
        return createBnsV1Sip9Asset(holding.asset_identifier, holding.value.hex);
      }
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
