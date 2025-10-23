import { injectable } from 'inversify';

import { OwnedUtxo } from '@leather.io/models';
import { hasBitcoinAddress } from '@leather.io/utils';

import { BestInSlotApiClient } from '../infrastructure/api/best-in-slot/best-in-slot-api.client';
import { LeatherApiClient } from '../infrastructure/api/leather/leather-api.client';
import { BitcoinTransactionsService } from '../transactions/bitcoin-transactions.service';
import { AccountRequest, AccountRequestUtxoProtectionOptions } from '../types/request.types';
import {
  createOwnedUtxo,
  filterMatchesAnyUtxoId,
  filterOutMatchesAnyUtxoId,
  getInscriptionProtectedUtxoIds,
  getOutboundUtxos,
  getRuneProtectedUtxoIds,
  isUnconfirmedUtxo,
  isUneconomicalUtxo,
  selectUniqueUtxoIds,
} from './utxos.utils';

export interface UtxoTotals {
  confirmed: OwnedUtxo[];
  inbound: OwnedUtxo[];
  outbound: OwnedUtxo[];
  protected: OwnedUtxo[];
  uneconomical: OwnedUtxo[];
  unspendable: OwnedUtxo[];
  available: OwnedUtxo[];
}

const emptyUtxos: UtxoTotals = {
  confirmed: [],
  inbound: [],
  outbound: [],
  protected: [],
  uneconomical: [],
  unspendable: [],
  available: [],
};

@injectable()
export class UtxosService {
  constructor(
    private readonly leatherApiClient: LeatherApiClient,
    private readonly bisApiClient: BestInSlotApiClient,
    private readonly bitcoinTransactionsService: BitcoinTransactionsService
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
      uneconomical: [...nativeSegwitUtxos.uneconomical, ...taprootUtxos.uneconomical],
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
      this.getTotalUtxos(descriptor, fingerprint, signal),
      this.getDescriptorProtectedUtxos(fingerprint, descriptor, protections, signal),
      this.bitcoinTransactionsService.getDescriptorTransactions(descriptor, signal),
    ]);
    const outboundUtxos = getOutboundUtxos(btcTxs, fingerprint);
    const unconfirmedUtxos = totalUtxos.filter(isUnconfirmedUtxo);
    const confirmedUtxos = [
      ...totalUtxos.filter(filterOutMatchesAnyUtxoId(unconfirmedUtxos)),
      ...outboundUtxos,
    ];
    const uneconomicalUtxos = confirmedUtxos.filter(isUneconomicalUtxo);
    const unspendableUtxos = selectUniqueUtxoIds([
      ...outboundUtxos,
      ...protectedUtxos,
      ...uneconomicalUtxos,
    ]);
    const availableUtxos = confirmedUtxos.filter(filterOutMatchesAnyUtxoId(unspendableUtxos));
    return {
      confirmed: confirmedUtxos,
      inbound: unconfirmedUtxos,
      outbound: outboundUtxos,
      protected: protectedUtxos,
      uneconomical: uneconomicalUtxos,
      unspendable: unspendableUtxos,
      available: availableUtxos,
    };
  }

  private async getDescriptorProtectedUtxos(
    fingerprint: string,
    descriptor: string,
    { discardedInscriptions = [], discardRunes = false }: AccountRequestUtxoProtectionOptions,
    signal?: AbortSignal
  ): Promise<OwnedUtxo[]> {
    const [utxos, inscriptions, runeOutputs] = await Promise.all([
      this.getTotalUtxos(descriptor, fingerprint, signal),
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

  private async getTotalUtxos(
    descriptor: string,
    fingerprint: string,
    signal?: AbortSignal
  ): Promise<OwnedUtxo[]> {
    const utxos = await this.leatherApiClient.fetchUtxos(descriptor, { signal });
    return utxos.map(utxo => createOwnedUtxo(utxo, fingerprint));
  }
}
