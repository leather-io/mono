import { inject, injectable } from 'inversify';

import { OwnedUtxo } from '@leather.io/models';
import { hasBitcoinAddress } from '@leather.io/utils';

import { BestInSlotApiClient } from '../infrastructure/api/best-in-slot/best-in-slot-api.client';
import { LeatherApiClient } from '../infrastructure/api/leather/leather-api.client';
import { MempoolApiClient } from '../infrastructure/api/mempool/mempool-api.client';
import { selectBitcoinNetworkMode } from '../infrastructure/settings/settings.selectors';
import type { SettingsService } from '../infrastructure/settings/settings.service';
import { Types } from '../inversify.types';
import { BitcoinTransactionsService } from '../transactions/bitcoin-transactions.service';
import { AccountRequest, AccountRequestUtxoProtectionOptions } from '../types/request.types';
import {
  createOwnedUtxoFromLeather,
  createOwnedUtxoFromMempool,
  filterMatchesAnyUtxoId,
  getInscriptionProtectedUtxoIds,
  getRuneProtectedUtxoIds,
  getUtxoTotals,
} from './utxos.utils';

export interface UtxoTotals {
  confirmed: OwnedUtxo[];
  inbound: OwnedUtxo[];
  outbound: OwnedUtxo[];
  protected: OwnedUtxo[];
  dust: OwnedUtxo[];
  unspendable: OwnedUtxo[];
  available: OwnedUtxo[];
}

const emptyUtxos: UtxoTotals = {
  confirmed: [],
  inbound: [],
  outbound: [],
  protected: [],
  dust: [],
  unspendable: [],
  available: [],
};

@injectable()
export class UtxosService {
  constructor(
    private readonly leatherApiClient: LeatherApiClient,
    private readonly bisApiClient: BestInSlotApiClient,
    private readonly mempoolApiClient: MempoolApiClient,
    private readonly bitcoinTransactionsService: BitcoinTransactionsService,
    @inject(Types.SettingsService) private readonly settings: SettingsService
  ) {}
  /**
   * Retrieve categorized UTXO lists for given Bitcoin account.
   *
   * An optional list of unprotected UTXOs can be provided on request to selectively move UTXO values from protected to available.
   */
  public async getAccountUtxos(
    { account, protections, exclusions }: AccountRequest,
    signal?: AbortSignal
  ): Promise<UtxoTotals> {
    if (!hasBitcoinAddress(account)) return emptyUtxos;

    const [nativeSegwitUtxos, taprootUtxos] = await Promise.all([
      !exclusions?.nativeSegwitAddresses
        ? this.getDescriptorUtxos(
            account.id.fingerprint,
            account.bitcoin.nativeSegwitDescriptor,
            protections,
            signal
          )
        : Promise.resolve(emptyUtxos),
      !exclusions?.taprootAddresses
        ? this.getDescriptorUtxos(
            account.id.fingerprint,
            account.bitcoin.taprootDescriptor,
            protections,
            signal
          )
        : Promise.resolve(emptyUtxos),
    ]);
    return {
      confirmed: [...nativeSegwitUtxos.confirmed, ...taprootUtxos.confirmed],
      inbound: [...nativeSegwitUtxos.inbound, ...taprootUtxos.inbound],
      outbound: [...nativeSegwitUtxos.outbound, ...taprootUtxos.outbound],
      protected: [...nativeSegwitUtxos.protected, ...taprootUtxos.protected],
      dust: [...nativeSegwitUtxos.dust, ...taprootUtxos.dust],
      unspendable: [...nativeSegwitUtxos.unspendable, ...taprootUtxos.unspendable],
      available: [...nativeSegwitUtxos.available, ...taprootUtxos.available],
    };
  }

  /**
   * Retrieve categorized UTXO lists for given Bitcoin xpub descriptor.
   *
   * An optional list of unprotected UTXOs can be provided on request to selectively move UTXO values from protected to available.
   */
  public async getDescriptorUtxos(
    fingerprint: string,
    descriptor: string,
    protections: AccountRequestUtxoProtectionOptions = {},
    signal?: AbortSignal
  ): Promise<UtxoTotals> {
    const [totalUtxos, protectedUtxos, btcTxs] = await Promise.all([
      this.getDescriptorTotalUtxos(descriptor, fingerprint, signal),
      this.getDescriptorProtectedUtxos(fingerprint, descriptor, protections, signal),
      this.bitcoinTransactionsService.getDescriptorTransactions(descriptor, signal),
    ]);
    return getUtxoTotals(fingerprint, totalUtxos, protectedUtxos, btcTxs);
  }

  private async getDescriptorProtectedUtxos(
    fingerprint: string,
    descriptor: string,
    { discardedInscriptions = [], discardRunes = false }: AccountRequestUtxoProtectionOptions,
    signal?: AbortSignal
  ): Promise<OwnedUtxo[]> {
    const networkMode = selectBitcoinNetworkMode(this.settings.getSettings());
    if (networkMode === 'regtest') {
      return []; // short-circuit on regtest mode
    }
    const [utxos, inscriptions, runeOutputs] = await Promise.all([
      this.getDescriptorTotalUtxos(descriptor, fingerprint, signal),
      this.bisApiClient.fetchInscriptions(descriptor, { signal }),
      this.bisApiClient.fetchRunesValidOutputs(descriptor, { signal }),
    ]);
    const inscriptionProtectedUtxoIds = getInscriptionProtectedUtxoIds(
      inscriptions,
      discardedInscriptions
    );
    const runesProtectedUtxoIds = getRuneProtectedUtxoIds(runeOutputs, discardRunes);
    return utxos.filter(
      filterMatchesAnyUtxoId([...inscriptionProtectedUtxoIds, ...runesProtectedUtxoIds])
    );
  }

  private async getDescriptorTotalUtxos(
    descriptor: string,
    fingerprint: string,
    signal?: AbortSignal
  ): Promise<OwnedUtxo[]> {
    const networkMode = selectBitcoinNetworkMode(this.settings.getSettings());
    if (networkMode === 'regtest') {
      const mempoolApiUtxos = await this.mempoolApiClient.fetchDescriptorUtxos(descriptor, {
        signal,
      });
      return mempoolApiUtxos.map(utxo => createOwnedUtxoFromMempool(utxo, fingerprint));
    }
    const leatherApiUtxos = await this.leatherApiClient.fetchUtxos(descriptor, { signal });
    return leatherApiUtxos.map(utxo => createOwnedUtxoFromLeather(utxo, fingerprint));
  }
}
