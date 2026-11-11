import { injectable } from 'inversify';
import { partition } from 'remeda';

import {
  NonFungibleCryptoAsset,
  type Sip9Asset,
  bnsAssetIdentifiers,
  bnsV1AssetIdentifiers,
} from '@leather.io/models';
import { getStacksAssetStringParts } from '@leather.io/stacks';

import { type BnsNameTransferBlocker, BnsService } from '../bns/bns.service';
import { HiroStacksApiClient } from '../infrastructure/api/hiro/hiro-stacks-api.client';
import { AccountRequest } from '../types';
import { isSip9TransferCompatible } from './collectibles.utils';
import { Sip9sService } from './sip9s.service';

export type CollectibleTransferBlocker = 'unsupported-contract' | BnsNameTransferBlocker;

@injectable()
export class CollectiblesService {
  constructor(
    private readonly sip9sService: Sip9sService,
    private readonly bnsService: BnsService,
    private readonly stacksApiClient: HiroStacksApiClient
  ) {}

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

  public async getCollectibleTransferBlocker(
    asset: Sip9Asset,
    signal?: AbortSignal
  ): Promise<CollectibleTransferBlocker | null> {
    const { contractAddress, contractName, contractAssetName } = getStacksAssetStringParts(
      asset.assetId
    );
    const contractInterface = await this.stacksApiClient.getContractInterface(
      contractAddress,
      contractName,
      { signal }
    );
    if (!isSip9TransferCompatible(contractInterface, contractAssetName)) {
      return 'unsupported-contract';
    }
    if (bnsAssetIdentifiers.includes(asset.assetId)) {
      return this.bnsService.getBnsNameTransferBlocker(asset.tokenId, signal);
    }
    return null;
  }
}
