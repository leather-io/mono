import { Inscription } from '@leather.io/models';
import { createMoney, sumNumbers } from '@leather.io/utils';

import { UtxoWithDerivationPath } from '../../../types/utxo';
import { filterUtxosWithInscriptions } from '../address/address.utils';

const RETRIEVE_UTXO_DUST_AMOUNT = 10000;

export function filterUninscribedUtxosToRecoverFromTaproot(
  utxos: UtxoWithDerivationPath[],
  inscriptions: Inscription[]
) {
  const filteredUtxosList = utxos
    .filter(utxo => utxo.status.confirmed)
    .filter(utxo => utxo.value > RETRIEVE_UTXO_DUST_AMOUNT);

  return filteredUtxosList.filter(filterUtxosWithInscriptions(inscriptions));
}

export function utxosToBalance(utxos: UtxoWithDerivationPath[]) {
  return createMoney(sumNumbers(utxos.map(utxo => Number(utxo.value))), 'BTC');
}
