import { injectable } from 'inversify';

import { RuneAsset } from '@leather.io/models';

import { LeatherApiClient } from '../infrastructure/api/leather/leather-api.client';
import { createRuneAsset } from './rune-asset.utils';

@injectable()
export class RuneAssetService {
  constructor(private readonly leatherApiClient: LeatherApiClient) {}

  /**
   * Gets full asset information for given Rune by name.
   */
  public async getAsset(runeName: string, signal?: AbortSignal): Promise<RuneAsset> {
    const runeMap = await this.leatherApiClient.fetchRuneMap(signal);
    const rune = runeMap[runeName]
      ? runeMap[runeName]
      : await this.leatherApiClient.fetchRune(runeName, signal);

    return createRuneAsset(runeName, rune.spacedRuneName, rune.decimals, rune.symbol);
  }
}
