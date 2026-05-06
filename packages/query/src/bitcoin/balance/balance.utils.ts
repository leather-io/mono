import { createMoney, sumNumbers } from '@leather.io/utils';

import { UtxoWithDerivationPath } from '../../types/utxo';

export function utxosToBalance(utxos: UtxoWithDerivationPath[]) {
  return createMoney(sumNumbers(utxos.map(utxo => Number(utxo.value))), 'BTC');
}
