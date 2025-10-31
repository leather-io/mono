import { NonFungibleTokenHolding } from '@stacks/stacks-blockchain-api-types';
import { injectable } from 'inversify';

import {
  AccountAddresses,
  BitcoinAddressInfo,
  InscriptionAsset,
  NonFungibleCryptoAsset,
  Sip9Asset,
  StampAsset,
} from '@leather.io/models';
import { createInscriptionAsset, isDefined } from '@leather.io/utils';

import { Sip9AssetService } from '../assets/sip9-asset.service';
import { BestInSlotApiClient } from '../infrastructure/api/best-in-slot/best-in-slot-api.client';
import { HiroStacksApiClient } from '../infrastructure/api/hiro/hiro-stacks-api.client';
import { StampchainApiClient } from '../infrastructure/api/stampchain/stampchain-api.client';
import {
  createStampAsset,
  mapBisInscriptionToCreateInscriptionData,
  sortByBlockHeight,
} from './collectibles.utils';

@injectable()
export class CollectiblesService {
  constructor(
    private readonly bisApiClient: BestInSlotApiClient,
    private readonly stacksApiClient: HiroStacksApiClient,
    private readonly stampchainApiClient: StampchainApiClient,
    private readonly sip9AssetsService: Sip9AssetService
  ) {}

  public async getTotalCollectibles(
    accounts: AccountAddresses[],
    signal?: AbortSignal
  ): Promise<NonFungibleCryptoAsset[]> {
    const stacksCollectibles = await Promise.all(
      accounts
        .filter(a => a.stacks)
        .map(a => this.getSip9sWithBlockHeight(a.stacks!.stxAddress, signal))
    );
    const bitcoinCollectibles = await Promise.all(
      accounts
        .filter(a => a.bitcoin)
        .map(async a => {
          const inscriptions = await this.getInscriptionsWithBlockHeight(a.bitcoin!, signal);
          const stamps = a.bitcoin!.zeroIndexNativeSegwitPayerAddress
            ? await this.getStampsByAddress(a.bitcoin!.zeroIndexNativeSegwitPayerAddress, signal)
            : [];
          return [...inscriptions, ...stamps];
        })
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
  ): Promise<NonFungibleCryptoAsset[]> {
    const [bitcoinInscriptions, bitcoinStamps, stacksCollectibles] = await Promise.all([
      account.bitcoin
        ? this.getInscriptionsWithBlockHeight(account.bitcoin, signal)
        : Promise.resolve([]),
      account.bitcoin?.zeroIndexNativeSegwitPayerAddress
        ? this.getStampsByAddress(account.bitcoin.zeroIndexNativeSegwitPayerAddress, signal)
        : Promise.resolve([]),
      account.stacks
        ? this.getSip9sWithBlockHeight(account.stacks.stxAddress, signal)
        : Promise.resolve([]),
    ]);
    return [
      ...stacksCollectibles.sort(sortByBlockHeight).map(c => c.asset),
      ...bitcoinInscriptions.sort(sortByBlockHeight).map(c => c.asset),
      ...bitcoinStamps.sort(sortByBlockHeight).map(c => c.asset),
    ];
  }

  private async getSip9sWithBlockHeight(
    stxAddress: string,
    signal?: AbortSignal
  ): Promise<{ asset: Sip9Asset; blockHeight: number }[]> {
    try {
      const nftHoldings = await this.stacksApiClient.getNftHoldings(stxAddress, { signal });
      const results = await Promise.all(
        nftHoldings.map(holding =>
          this.getOptionalSip9Asset(holding, signal).then(asset =>
            asset ? { asset, blockHeight: holding.block_height } : undefined
          )
        )
      );
      // We need to filter out the BNS - Archive asset
      return results.filter(isDefined).filter(result => result.asset.name !== 'BNS - Archive');
    } catch {
      return [];
    }
  }

  private async getOptionalSip9Asset(
    holding: NonFungibleTokenHolding,
    signal?: AbortSignal
  ): Promise<Sip9Asset | undefined> {
    try {
      return await this.sip9AssetsService.getAsset(
        holding.asset_identifier,
        holding.value.hex,
        signal
      );
    } catch {
      return;
    }
  }

  private async getInscriptionsWithBlockHeight(
    btcAddressInfo: BitcoinAddressInfo,
    signal?: AbortSignal
  ): Promise<{ asset: InscriptionAsset; blockHeight: number }[]> {
    try {
      const [taprootInscriptions, nativeSegwitInscriptions] = await Promise.all([
        this.bisApiClient.fetchInscriptions(btcAddressInfo.taprootDescriptor, { signal }),
        this.bisApiClient.fetchInscriptions(btcAddressInfo.nativeSegwitDescriptor, { signal }),
      ]);
      return [...nativeSegwitInscriptions, ...taprootInscriptions].map(inscription => ({
        asset: createInscriptionAsset(mapBisInscriptionToCreateInscriptionData(inscription)),
        blockHeight: inscription.last_transfer_block_height ?? inscription.genesis_height,
      }));
    } catch {
      return [];
    }
  }

  private async getStampsByAddress(
    address: string,
    signal?: AbortSignal
  ): Promise<{ asset: StampAsset; blockHeight: number }[]> {
    try {
      const stamps = await this.stampchainApiClient.getStampsByAddress(address, { signal });

      return stamps.map(stamp => ({
        asset: createStampAsset({
          stamp: stamp.stamp,
          stampUrl: stamp.stamp_url,
          blockHeight: stamp.block_index ?? 0,
        }),
        blockHeight: stamp.block_index ?? 0,
      }));
    } catch {
      return [];
    }
  }
}
