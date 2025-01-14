import { RuneCryptoAssetInfo } from '@leather.io/models';

import { BestInSlotApiClient } from '../infrastructure/api/best-in-slot/best-in-slot-api.client';
import { createRuneCryptoAssetInfo } from './rune-asset.utils';

export interface RuneAssetService {
  getAssetInfo(runeName: string, signal?: AbortSignal): Promise<RuneCryptoAssetInfo>;
}

export function createRuneAssetService(bisApiClient: BestInSlotApiClient): RuneAssetService {
  /**
   * Gets full asset information for given Rune by name.
   */
  async function getAssetInfo(runeName: string, signal?: AbortSignal) {
    const tickerInfo = await bisApiClient.fetchRuneTickerInfo(runeName, signal);

    return createRuneCryptoAssetInfo(
      tickerInfo.rune_name,
      tickerInfo.spaced_rune_name,
      tickerInfo.decimals,
      tickerInfo.symbol
    );
  }
  return {
    getAssetInfo,
  };
}
