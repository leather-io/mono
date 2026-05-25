import { injectable } from 'inversify';

import type { InscriptionAsset } from '@leather.io/models';
import { createInscriptionAsset } from '@leather.io/utils';

import { BestInSlotApiClient } from '../infrastructure/api/best-in-slot/best-in-slot-api.client';
import { AccountRequest } from '../types';
import {
  mapBisInscriptionToCreateInscriptionData,
  sortBisInscriptionByBlockHeight,
} from './collectibles.utils';

@injectable()
export class InscriptionsService {
  constructor(private readonly bisApiClient: BestInSlotApiClient) {}

  public async getAccountInscriptions(
    request: AccountRequest,
    signal?: AbortSignal
  ): Promise<InscriptionAsset[]> {
    if (!request.account.bitcoin) return [];
    if (!request.protections?.isOrdinalsActive) return [];

    try {
      const [taprootInscriptions, nativeSegwitInscriptions] = await Promise.all([
        request.exclusions?.nativeSegwitAddresses
          ? Promise.resolve([])
          : this.bisApiClient.fetchInscriptions(request.account.bitcoin.nativeSegwitDescriptor, {
              signal,
              isOrdinalsActive: request.protections?.isOrdinalsActive,
            }),
        request.exclusions?.taprootAddresses
          ? Promise.resolve([])
          : this.bisApiClient.fetchInscriptions(request.account.bitcoin.taprootDescriptor, {
              signal,
              isOrdinalsActive: request.protections?.isOrdinalsActive,
            }),
      ]);

      return [...nativeSegwitInscriptions, ...taprootInscriptions]
        .sort(sortBisInscriptionByBlockHeight)
        .map(mapBisInscriptionToCreateInscriptionData)
        .map(createInscriptionAsset);
    } catch {
      return [];
    }
  }
}
