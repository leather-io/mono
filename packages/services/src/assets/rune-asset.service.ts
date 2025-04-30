import { injectable } from 'inversify';

import { RuneCryptoAssetInfo } from '@leather.io/models';

import { LeatherApiClient } from '../infrastructure/api/leather/leather-api.client';
import { createRuneCryptoAssetInfo } from './rune-asset.utils';

@injectable()
export class RuneAssetService {
  constructor(private readonly leatherApiClient: LeatherApiClient) {}

  /**
   * Gets full asset information for given Rune by name.
   */
  public async getAssetInfo(runeName: string, signal?: AbortSignal): Promise<RuneCryptoAssetInfo> {
    const runeMap = await this.leatherApiClient.fetchRuneMap(signal);
    const rune = runeMap[runeName]
      ? runeMap[runeName]
      : await this.leatherApiClient.fetchRune(runeName, signal);

    return createRuneCryptoAssetInfo(runeName, rune.spacedRuneName, rune.decimals, rune.symbol);
  }
}
