import { injectable } from 'inversify';

import type { StampAsset } from '@leather.io/models';

import { StampchainApiClient } from '../infrastructure/api/stampchain/stampchain-api.client';
import { AccountRequest } from '../types';
import { createStampAsset, sortByBlockHeight } from './collectibles.utils';

@injectable()
export class StampsService {
  constructor(private readonly stampchainApiClient: StampchainApiClient) {}

  public async getAccountStamps(
    request: AccountRequest,
    signal?: AbortSignal
  ): Promise<StampAsset[]> {
    if (
      !request.account.bitcoin?.zeroIndexNativeSegwitPayerAddress ||
      request.exclusions?.nativeSegwitAddresses
    )
      return [];

    try {
      const stamps = await this.stampchainApiClient.getStampsByAddress(
        request.account.bitcoin.zeroIndexNativeSegwitPayerAddress,
        { signal }
      );

      return stamps
        .map(stamp =>
          createStampAsset({
            stamp: stamp.stamp,
            stampUrl: stamp.stamp_url,
            blockHeight: stamp.block_index ?? 0,
          })
        )
        .sort(sortByBlockHeight);
    } catch {
      return [];
    }
  }
}
