import { NonFungibleTokenHolding } from '@stacks/stacks-blockchain-api-types';

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

export interface CollectiblesService {
  getTotalCollectibles(
    accounts: AccountAddresses[],
    signal?: AbortSignal
  ): Promise<NonFungibleCryptoAssetInfo[]>;
  getAccountCollectibles(
    account: AccountAddresses,
    signal?: AbortSignal
  ): Promise<NonFungibleCryptoAssetInfo[]>;
}

export function createCollectiblesService(
  bisApiClient: BestInSlotApiClient,
  stacksApiClient: HiroStacksApiClient,
  sip9AssetsService: Sip9AssetService
): CollectiblesService {
  async function getTotalCollectibles(accounts: AccountAddresses[], signal?: AbortSignal) {
    const stacksCollectibles = await Promise.all(
      accounts.filter(a => a.stacks).map(a => getSip9sWithBlockHeight(a.stacks!.stxAddress, signal))
    );
    const bitcoinCollectibles = await Promise.all(
      accounts
        .filter(a => a.bitcoin)
        .map(a => getInscriptionsWithBlockHeight(a.bitcoin!.taprootDescriptor, signal))
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

  async function getAccountCollectibles(account: AccountAddresses, signal?: AbortSignal) {
    const [bitcoinCollectibles, stacksCollectibles] = await Promise.all([
      account.bitcoin
        ? getInscriptionsWithBlockHeight(account.bitcoin.taprootDescriptor, signal)
        : Promise.resolve([]),
      account.stacks
        ? getSip9sWithBlockHeight(account.stacks.stxAddress, signal)
        : Promise.resolve([]),
    ]);
    return [
      ...stacksCollectibles.sort(sortByBlockHeight).map(c => c.asset),
      ...bitcoinCollectibles.sort(sortByBlockHeight).map(c => c.asset),
    ];
  }

  async function getSip9sWithBlockHeight(
    stxAddress: string,
    signal?: AbortSignal
  ): Promise<{ asset: Sip9CryptoAssetInfo; blockHeight: number }[]> {
    try {
      const nftHoldings = await stacksApiClient.getNonFungibleHoldings(stxAddress, signal);
      const BATCH_SIZE = 6;
      const sip9s = [];
      for (let i = 0; i < nftHoldings.length; i += BATCH_SIZE) {
        const results = await Promise.all(
          nftHoldings
            .slice(i, i + BATCH_SIZE)
            .map(holding =>
              getOptionalSip9AssetInfo(holding, signal).then(asset =>
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

  async function getOptionalSip9AssetInfo(
    holding: NonFungibleTokenHolding,
    signal?: AbortSignal
  ): Promise<Sip9CryptoAssetInfo | undefined> {
    try {
      return await sip9AssetsService.getAssetInfo(
        holding.asset_identifier,
        holding.value.hex,
        signal
      );
    } catch {
      return;
    }
  }

  async function getInscriptionsWithBlockHeight(
    taprootDescriptor: string,
    signal?: AbortSignal
  ): Promise<{ asset: InscriptionCryptoAssetInfo; blockHeight: number }[]> {
    try {
      const bisInscriptions = await bisApiClient.fetchInscriptions(taprootDescriptor, signal);
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

  return {
    getTotalCollectibles,
    getAccountCollectibles,
  };
}
