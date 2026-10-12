import { useCallback } from 'react';

import { matchInputsToWalletUtxos } from './match-wallet-utxos';
import { useCurrentUtxos } from './utxos.hooks';

type TransactionInputs = Parameters<typeof matchInputsToWalletUtxos>[0];

export function useMatchWalletUtxos() {
  const { utxos: walletUtxos } = useCurrentUtxos();

  return useCallback(
    (inputs: TransactionInputs) =>
      matchInputsToWalletUtxos(inputs, [
        ...walletUtxos.confirmed,
        ...walletUtxos.inbound,
        ...walletUtxos.available,
      ]),
    [walletUtxos]
  );
}
