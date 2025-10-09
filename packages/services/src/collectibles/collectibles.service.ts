import { NonFungibleTokenHolding } from '@stacks/stacks-blockchain-api-types';
import axios from 'axios';
import { inject, injectable } from 'inversify';

import {
  bitcoinNetworkModeToCoreNetworkMode,
  deriveAddressIndexKeychainFromAccount,
  getTaprootPayment,
} from '@leather.io/bitcoin';
import { deriveKeychainFromXpub } from '@leather.io/crypto';
import {
  AccountAddresses,
  BitcoinAddressInfo,
  InscriptionAsset,
  NonFungibleCryptoAsset,
  Sip9Asset,
  StampAsset,
} from '@leather.io/models';
import { createInscriptionAsset, isDefined } from '@leather.io/utils';

import { Types } from '../inversify.types';
import { Sip9AssetService } from '../assets/sip9-asset.service';
import { BestInSlotApiClient } from '../infrastructure/api/best-in-slot/best-in-slot-api.client';
import { HiroStacksApiClient } from '../infrastructure/api/hiro/hiro-stacks-api.client';
import { selectBitcoinNetworkMode } from '../infrastructure/settings/settings.selectors';
import type { SettingsService } from '../infrastructure/settings/settings.service';
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
    private readonly sip9AssetsService: Sip9AssetService,
    @inject(Types.SettingsService) private readonly settingsService: SettingsService
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
        .map(a =>
          Promise.all([
            this.getInscriptionsWithBlockHeight(a.bitcoin!, signal),
            this.getStampsWithBlockHeight(a.bitcoin!, signal),
          ]).then(([inscriptions, stamps]) => [...inscriptions, ...stamps])
        )
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
    console.log('[getAccountCollectibles] called with account:', JSON.stringify(account, null, 2));
    console.log('[getAccountCollectibles] account.bitcoin exists?', !!account.bitcoin);
    const [bitcoinInscriptions, bitcoinStamps, stacksCollectibles] = await Promise.all([
      account.bitcoin
        ? this.getInscriptionsWithBlockHeight(account.bitcoin, signal)
        : Promise.resolve([]),
      account.bitcoin
        ? this.getStampsWithBlockHeight(account.bitcoin, signal)
        : Promise.resolve([]),
      account.stacks
        ? this.getSip9sWithBlockHeight(account.stacks.stxAddress, signal)
        : Promise.resolve([]),
    ]);
    console.log('[getAccountCollectibles] bitcoinInscriptions:', bitcoinInscriptions.length);
    console.log('[getAccountCollectibles] bitcoinStamps:', bitcoinStamps.length);
    console.log('[getAccountCollectibles] stacksCollectibles:', stacksCollectibles.length);
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

  private deriveAddressFromDescriptor(descriptor: string, network: 'mainnet' | 'testnet') {
    try {
      const xpubMatch = descriptor.match(/tr\(([^)]+)\)/);
      if (!xpubMatch) return null;

      const xpub = xpubMatch[1];
      const accountKeychain = deriveKeychainFromXpub(xpub);
      const addressIndexKeychain = deriveAddressIndexKeychainFromAccount(accountKeychain)(0);

      if (!addressIndexKeychain.publicKey) return null;

      const payment = getTaprootPayment(addressIndexKeychain.publicKey, network);
      return payment.address ?? null;
    } catch (error) {
      console.error('[deriveAddressFromDescriptor] error:', error);
      return null;
    }
  }

  private async getStampsWithBlockHeight(
    btcAddressInfo: BitcoinAddressInfo,
    signal?: AbortSignal
  ): Promise<{ asset: StampAsset; blockHeight: number }[]> {
    console.log('[getStampsWithBlockHeight] called with descriptor:', btcAddressInfo.taprootDescriptor);
    try {
      const bitcoinNetworkMode = selectBitcoinNetworkMode(this.settingsService.getSettings());
      const network = bitcoinNetworkModeToCoreNetworkMode(bitcoinNetworkMode);
      console.log('[getStampsWithBlockHeight] network mode:', bitcoinNetworkMode, 'network:', network);

      const taprootAddress = this.deriveAddressFromDescriptor(
        btcAddressInfo.taprootDescriptor,
        network
      );

      console.log('[getStampsWithBlockHeight] derived taproot address:', taprootAddress);

      if (!taprootAddress) {
        console.log('[getStampsWithBlockHeight] no taproot address derived, returning empty array');
        return [];
      }

      console.log('[getStampsWithBlockHeight] fetching stamps for address:', taprootAddress);
      const response = await axios.get<{
        data: { stamps: Array<{ stamp: number; stamp_url: string; block_index?: number }> };
      }>(`https://stampchain.io/api/v2/balance/${taprootAddress}`, { signal });

      console.log('stamps response', response.data);
      return response.data.data.stamps.map(stamp => ({
        asset: createStampAsset(stamp),
        blockHeight: stamp.block_index ?? 0,
      }));
    } catch (error) {
      console.error('error getting stamps with block height', error);
      return [];
    }
  }
}
