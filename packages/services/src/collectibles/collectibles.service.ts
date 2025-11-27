import { injectable } from 'inversify';

import { NonFungibleCryptoAsset } from '@leather.io/models';

import type { AccountRequest } from '../types';
import { InscriptionsService } from './inscriptions.service';
import { Sip9sService } from './sip9s.service';
import { StampsService } from './stamps.service';

@injectable()
export class CollectiblesService {
  constructor(
    private readonly inscriptionsService: InscriptionsService,
    private readonly stampsService: StampsService,
    private readonly sip9sService: Sip9sService
  ) {}

  public async getAccountCollectibles(
    request: AccountRequest,
    signal?: AbortSignal
  ): Promise<NonFungibleCryptoAsset[]> {
    const [inscriptions, stamps, stacksCollectibles] = await Promise.all([
      this.inscriptionsService.getAccountInscriptions(request, signal),
      this.stampsService.getAccountStamps(request, signal),
      this.sip9sService.getAccountSip9s(request, signal),
    ]);
    return [...stacksCollectibles, ...inscriptions, ...stamps];
  }
}
