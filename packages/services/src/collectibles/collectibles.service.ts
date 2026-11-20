import { injectable } from 'inversify';
import { partition } from 'remeda';

import { NonFungibleCryptoAsset, bnsV1AssetIdentifiers } from '@leather.io/models';

import { AccountRequest } from '../types';
import { Sip9sService } from './sip9s.service';

@injectable()
export class CollectiblesService {
  constructor(private readonly sip9sService: Sip9sService) {}

  public async getAccountCollectibles(
    request: AccountRequest,
    signal?: AbortSignal
  ): Promise<NonFungibleCryptoAsset[]> {
    const sip9s = await this.sip9sService.getAccountSip9s(request, signal);
    const [bnsV1Names, otherSip9s] = partition(sip9s, sip9 =>
      bnsV1AssetIdentifiers.includes(sip9.assetId)
    );
    return [...otherSip9s, ...bnsV1Names];
  }
}
