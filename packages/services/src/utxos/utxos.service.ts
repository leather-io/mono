import { Utxo, UtxoId } from '@leather.io/models';
import { isDefined } from '@leather.io/utils';

import { BestInSlotApiClient } from '../infrastructure/api/best-in-slot/best-in-slot-api.client';
import { LeatherApiClient } from '../infrastructure/api/leather/leather-api.client';
import { BitcoinAccountServiceRequest } from '../shared/bitcoin.types';
import {
  filterMatchesAnyUtxoId,
  filterOutMatchesAnyUtxoId,
  getUtxoIdFromOutpoint,
  getUtxoIdFromSatpoint,
  isInboundUtxo,
  isUneconomicalUtxo,
  selectUniqueUtxoIds,
} from './utxos.utils';

export interface UtxoTotals {
  total: Utxo[];
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
  bisApiClient: BestInSlotApiClient
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
      total: [...nativeSegwitUtxos.total, ...taprootUtxos.total],
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
    const [totalUtxos, totalProtectedUtxos] = await Promise.all([
      leatherApiClient.fetchUtxos(descriptor, signal),
      getDescriptorProtectedUtxos(descriptor, signal),
    ]);
    const protectedUtxos = totalProtectedUtxos.filter(
      filterOutMatchesAnyUtxoId(unprotectedUtxoIds)
    );
    const inboundUtxos = totalUtxos.filter(isInboundUtxo);
    const outboundUtxos: Utxo[] = [];
    const confirmedUtxos = totalUtxos.filter(filterOutMatchesAnyUtxoId(inboundUtxos));
    const uneconomicalUtxos = confirmedUtxos
      .filter(utxo => !isInboundUtxo(utxo))
      .filter(isUneconomicalUtxo);
    const unspendableUtxos = selectUniqueUtxoIds([
      ...outboundUtxos,
      ...protectedUtxos,
      ...uneconomicalUtxos,
    ]);
    const availableUtxos = confirmedUtxos.filter(filterOutMatchesAnyUtxoId(unspendableUtxos));
    return {
      total: totalUtxos,
      confirmed: confirmedUtxos,
      inbound: inboundUtxos,
      outbound: outboundUtxos,
      protected: protectedUtxos,
      uneconomical: uneconomicalUtxos,
      unspendable: unspendableUtxos,
      available: availableUtxos,
    };
  }

  /**
   * Retrieve protected UTXOs (w/ inscriptions or runes) for given Bitcoin taproot xpub descriptor.
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
