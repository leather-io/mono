import { injectable } from 'inversify';

import { RuneCryptoAssetInfo } from '@leather.io/models';

import { BestInSlotApiClient } from '../infrastructure/api/best-in-slot/best-in-slot-api.client';
import { createRuneCryptoAssetInfo } from './rune-asset.utils';

@injectable()
export class RuneAssetService {
  constructor(private readonly bisApiClient: BestInSlotApiClient) {}

  /**
   * Gets full asset information for given Rune by name.
   */
  public async getAssetInfo(runeName: string, signal?: AbortSignal): Promise<RuneCryptoAssetInfo> {
    const tickerInfo = await this.bisApiClient.fetchRuneTickerInfo(runeName, signal);

    return createRuneCryptoAssetInfo(
      tickerInfo.rune_name,
      tickerInfo.spaced_rune_name,
      tickerInfo.decimals,
      tickerInfo.symbol
    );
  }
}
