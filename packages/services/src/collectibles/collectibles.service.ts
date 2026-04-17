import { injectable } from 'inversify';

import { NonFungibleCryptoAsset } from '@leather.io/models';

import { BnsService } from '../bns/bns.service';
import { AccountRequest } from '../types';
import { InscriptionsService } from './inscriptions.service';
import { Sip9sService } from './sip9s.service';

@injectable()
export class CollectiblesService {
  constructor(
    private readonly inscriptionsService: InscriptionsService,
    private readonly sip9sService: Sip9sService,
    private readonly bnsService: BnsService
  ) {}

  public async getAccountCollectibles(
    request: AccountRequest,
    signal?: AbortSignal
  ): Promise<NonFungibleCryptoAsset[]> {
    const [inscriptions, stacksCollectibles, bnsNames] = await Promise.all([
      this.inscriptionsService.getAccountInscriptions(request, signal),
      this.sip9sService.getAccountSip9s(request, signal),
      this.bnsService.getAccountBnsNames(request, signal),
    ]);

    const bnsNameSet = new Set(bnsNames.map(n => n.fullName));
    const filteredSip9s = stacksCollectibles.filter(sip9 => !bnsNameSet.has(sip9.name));

    return [...filteredSip9s, ...inscriptions];
  }
}
