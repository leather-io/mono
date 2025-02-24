import { Utxo, UtxoId } from '@leather.io/models';
import { isDefined } from '@leather.io/utils';

import { BestInSlotApiClient } from '../infrastructure/api/best-in-slot/best-in-slot-api.client';
import { LeatherApiClient } from '../infrastructure/api/leather/leather-api.client';
import { BitcoinAccountServiceRequest } from '../shared/bitcoin.types';
import { BitcoinTransactionsService } from '../transactions/bitcoin-transactions.service';
import {
  filterMatchesAnyUtxoId,
  filterOutMatchesAnyUtxoId,
  getOutboundUtxos,
  getUtxoIdFromOutpoint,
  getUtxoIdFromSatpoint,
  isUnconfirmedUtxo,
  isUneconomicalUtxo,
  selectUniqueUtxoIds,
} from './utxos.utils';

export interface UtxoTotals {
  confirmed: Utxo[];
  inbound: Utxo[];
  outbound: Utxo[];
  protected: Utxo[];
  uneconomical: Utxo[];
  unspendable: Utxo[];
  available: Utxo[];
}

export interface UtxosService {
  getAccountUtxos(request: BitcoinAccountServiceRequest, signal?: AbortSignal): Promise<UtxoTotals>;
  getDescriptorUtxos(
    descriptor: string,
    unprotectedUtxoIds?: UtxoId[],
    signal?: AbortSignal
  ): Promise<UtxoTotals>;
  getDescriptorProtectedUtxos(taprootDescriptor: string, signal?: AbortSignal): Promise<Utxo[]>;
}

export function createUtxosService(
  leatherApiClient: LeatherApiClient,
  bisApiClient: BestInSlotApiClient,
  bitcoinTransactionsService: BitcoinTransactionsService
): UtxosService {
  /**
   * Retrieve categorized UTXO lists for given Bitcoin account.
   *
   * An optional list of unprotected UTXOs can be provided on request to selectively move UTXO values from protected to available.
   */
  async function getAccountUtxos(request: BitcoinAccountServiceRequest, signal?: AbortSignal) {
    const [nativeSegwitUtxos, taprootUtxos] = await Promise.all([
      getDescriptorUtxos(request.account.nativeSegwitDescriptor, [], signal),
      getDescriptorUtxos(request.account.taprootDescriptor, request.unprotectedUtxos, signal),
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
  async function getDescriptorUtxos(
    descriptor: string,
    unprotectedUtxoIds: UtxoId[] = [],
    signal?: AbortSignal
  ) {
    const [leatherApiUtxos, totalProtectedUtxos, btcTxs] = await Promise.all([
      leatherApiClient.fetchUtxos(descriptor, signal),
      getDescriptorProtectedUtxos(descriptor, signal),
      bitcoinTransactionsService.getDescriptorTransactions(descriptor, signal),
    ]);
    const outboundUtxos = getOutboundUtxos(btcTxs);
    const protectedUtxos = totalProtectedUtxos.filter(
      filterOutMatchesAnyUtxoId(unprotectedUtxoIds)
    );
    const unconfirmedUtxos = leatherApiUtxos.filter(isUnconfirmedUtxo);
    const confirmedUtxos = [
      ...leatherApiUtxos.filter(filterOutMatchesAnyUtxoId(unconfirmedUtxos)),
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
   * Retrieve protected UTXOs (those w/ inscriptions or runes) for given Bitcoin taproot xpub descriptor.
   */
  async function getDescriptorProtectedUtxos(taprootDescriptor: string, signal?: AbortSignal) {
    if (!taprootDescriptor.toLocaleLowerCase().startsWith('tr(')) return [];

    const [utxos, inscriptions, runeOutputs] = await Promise.all([
      leatherApiClient.fetchUtxos(taprootDescriptor, signal),
      bisApiClient.fetchInscriptions(taprootDescriptor, signal),
      bisApiClient.fetchRunesValidOutputs(taprootDescriptor, signal),
    ]);
    const inscribedUtxoIds = inscriptions
      .map(inscription => getUtxoIdFromSatpoint(inscription.satpoint))
      .filter(isDefined);
    const runesUtxoIds = runeOutputs.map(r => getUtxoIdFromOutpoint(r.output)).filter(isDefined);

    return utxos.filter(filterMatchesAnyUtxoId([...inscribedUtxoIds, ...runesUtxoIds]));
  }

  return {
    getAccountUtxos,
    getDescriptorUtxos,
    getDescriptorProtectedUtxos,
  };
}
