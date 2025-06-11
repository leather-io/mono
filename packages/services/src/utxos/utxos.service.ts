import { injectable } from 'inversify';

import { AccountAddresses, OwnedUtxo, UtxoId } from '@leather.io/models';
import { hasBitcoinAddress, isDefined } from '@leather.io/utils';

import { BestInSlotApiClient } from '../infrastructure/api/best-in-slot/best-in-slot-api.client';
import { LeatherApiClient } from '../infrastructure/api/leather/leather-api.client';
import { BitcoinTransactionsService } from '../transactions/bitcoin-transactions.service';
import {
  filterMatchesAnyUtxoId,
  filterOutMatchesAnyUtxoId,
  getOutboundUtxos,
  getUtxoIdFromOutpoint,
  getUtxoIdFromSatpoint,
  isUnconfirmedUtxo,
  isUneconomicalUtxo,
  mapLeatherApiUtxoToOwnedUtxo,
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
    account: AccountAddresses,
    unprotectedUtxos: UtxoId[],
    signal?: AbortSignal
  ): Promise<UtxoTotals> {
    if (!hasBitcoinAddress(account)) return emptyUtxos;

    const [nativeSegwitUtxos, taprootUtxos] = await Promise.all([
      this.getDescriptorUtxos(
        account.id.fingerprint,
        account.bitcoin.nativeSegwitDescriptor,
        [],
        signal
      ),
      this.getDescriptorUtxos(
        account.id.fingerprint,
        account.bitcoin.taprootDescriptor,
        unprotectedUtxos,
        signal
      ),
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
    unprotectedUtxoIds: UtxoId[],
    signal?: AbortSignal
  ): Promise<UtxoTotals> {
    const [ownedUtxos, totalProtectedUtxos, btcTxs] = await Promise.all([
      this.getOwnedUtxos(descriptor, fingerprint, signal),
      this.getDescriptorProtectedUtxos(fingerprint, descriptor, signal),
      this.bitcoinTransactionsService.getDescriptorTransactions(descriptor, signal),
    ]);
    const outboundUtxos = getOutboundUtxos(btcTxs, fingerprint);
    const protectedUtxos = totalProtectedUtxos.filter(
      filterOutMatchesAnyUtxoId(unprotectedUtxoIds)
    );
    const unconfirmedUtxos = ownedUtxos.filter(isUnconfirmedUtxo);
    const confirmedUtxos = [
      ...ownedUtxos.filter(filterOutMatchesAnyUtxoId(unconfirmedUtxos)),
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

  /**
   * Retrieve protected UTXOs (those w/ inscriptions or runes) for given Bitcoin account xpub descriptor.
   */
  public async getDescriptorProtectedUtxos(
    fingerprint: string,
    descriptor: string,
    signal?: AbortSignal
  ): Promise<OwnedUtxo[]> {
    const [utxos, inscriptions, runeOutputs] = await Promise.all([
      this.getOwnedUtxos(descriptor, fingerprint, signal),
      this.bisApiClient.fetchInscriptions(descriptor, signal),
      this.bisApiClient.fetchRunesValidOutputs(descriptor, signal),
    ]);
    const inscribedUtxoIds = inscriptions
      .map(inscription => getUtxoIdFromSatpoint(inscription.satpoint))
      .filter(isDefined);
    const runesUtxoIds = runeOutputs.map(r => getUtxoIdFromOutpoint(r.output)).filter(isDefined);

    return utxos.filter(filterMatchesAnyUtxoId([...inscribedUtxoIds, ...runesUtxoIds]));
  }

  private async getOwnedUtxos(
    descriptor: string,
    fingerprint: string,
    signal?: AbortSignal
  ): Promise<OwnedUtxo[]> {
    const utxos = await this.leatherApiClient.fetchUtxos(descriptor, signal);
    return utxos.map(utxo => mapLeatherApiUtxoToOwnedUtxo(utxo, fingerprint));
  }
}
