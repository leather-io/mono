import { NonFungibleTokenHolding } from '@stacks/stacks-blockchain-api-types';
import { injectable } from 'inversify';

import {
  AccountAddresses,
  InscriptionCryptoAssetInfo,
  NonFungibleCryptoAssetInfo,
  Sip9CryptoAssetInfo,
} from '@leather.io/models';
import { createInscriptionCryptoAssetInfo, isDefined } from '@leather.io/utils';

import { Sip9AssetService } from '../assets/sip9-asset.service';
import { BestInSlotApiClient } from '../infrastructure/api/best-in-slot/best-in-slot-api.client';
import { HiroStacksApiClient } from '../infrastructure/api/hiro/hiro-stacks-api.client';
import { mapBisInscriptionToCreateInscriptionData, sortByBlockHeight } from './collectibles.utils';

@injectable()
export class CollectiblesService {
  constructor(
    private readonly bisApiClient: BestInSlotApiClient,
    private readonly stacksApiClient: HiroStacksApiClient,
    private readonly sip9AssetsService: Sip9AssetService
  ) {}

  public async getTotalCollectibles(
    accounts: AccountAddresses[],
    signal?: AbortSignal
  ): Promise<NonFungibleCryptoAssetInfo[]> {
    const stacksCollectibles = await Promise.all(
      accounts
        .filter(a => a.stacks)
        .map(a => this.getSip9sWithBlockHeight(a.stacks!.stxAddress, signal))
    );
    const bitcoinCollectibles = await Promise.all(
      accounts
        .filter(a => a.bitcoin)
        .map(a => this.getInscriptionsWithBlockHeight(a.bitcoin!.taprootDescriptor, signal))
    );
    return [
      ...stacksCollectibles
        .flat()
        .sort(sortByBlockHeight)
        .map(c => c.asset),
      ...bitcoinCollectibles
        .flat()
        .sort(sortByBlockHeight)
        .map(c => c.asset),
    ];
  }

  public async getAccountCollectibles(
    account: AccountAddresses,
    signal?: AbortSignal
  ): Promise<NonFungibleCryptoAssetInfo[]> {
    const [bitcoinCollectibles, stacksCollectibles] = await Promise.all([
      account.bitcoin
        ? this.getInscriptionsWithBlockHeight(account.bitcoin.taprootDescriptor, signal)
        : Promise.resolve([]),
      account.stacks
        ? this.getSip9sWithBlockHeight(account.stacks.stxAddress, signal)
        : Promise.resolve([]),
    ]);
    return [
      ...stacksCollectibles.sort(sortByBlockHeight).map(c => c.asset),
      ...bitcoinCollectibles.sort(sortByBlockHeight).map(c => c.asset),
    ];
  }

  private async getSip9sWithBlockHeight(
    stxAddress: string,
    signal?: AbortSignal
  ): Promise<{ asset: Sip9CryptoAssetInfo; blockHeight: number }[]> {
    try {
      const nftHoldings = await this.stacksApiClient.getNftHoldings(stxAddress, signal);
      const BATCH_SIZE = 6;
      const sip9s = [];
      for (let i = 0; i < nftHoldings.length; i += BATCH_SIZE) {
        const results = await Promise.all(
          nftHoldings
            .slice(i, i + BATCH_SIZE)
            .map(holding =>
              this.getOptionalSip9AssetInfo(holding, signal).then(asset =>
                asset ? { asset, blockHeight: holding.block_height } : undefined
              )
            )
        );
        sip9s.push(...results.filter(isDefined));
      }
      return sip9s;
    } catch {
      return [];
    }
  }

  private async getOptionalSip9AssetInfo(
    holding: NonFungibleTokenHolding,
    signal?: AbortSignal
  ): Promise<Sip9CryptoAssetInfo | undefined> {
    try {
      return await this.sip9AssetsService.getAssetInfo(
        holding.asset_identifier,
        holding.value.hex,
        signal
      );
    } catch {
      return;
    }
  }

  private async getInscriptionsWithBlockHeight(
    taprootDescriptor: string,
    signal?: AbortSignal
  ): Promise<{ asset: InscriptionCryptoAssetInfo; blockHeight: number }[]> {
    try {
      const bisInscriptions = await this.bisApiClient.fetchInscriptions(taprootDescriptor, signal);
      return bisInscriptions.map(inscription => ({
        asset: createInscriptionCryptoAssetInfo(
          mapBisInscriptionToCreateInscriptionData(inscription)
        ),
        blockHeight: inscription.last_transfer_block_height ?? inscription.genesis_height,
      }));
    } catch {
      return [];
    }
  }
}
