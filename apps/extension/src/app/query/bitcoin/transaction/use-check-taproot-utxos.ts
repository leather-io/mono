import { useCallback, useState } from 'react';

import { TransactionInput } from '@scure/btc-signer/psbt';

import { TaprootUtxoWarningDialog } from '../../../features/dialogs/taproot-utxo-warning-dialog/taproot-utxo-warning-dialog';
import { useMatchWalletUtxos } from '../utxos/use-match-wallet-utxos';

const taprootAddressPrefixes = ['bc1p', 'tb1p', 'bcrt1p'];

function isTaprootAddress(address: string) {
  return taprootAddressPrefixes.some(prefix => address.startsWith(prefix));
}

export function useCheckTaprootUtxos() {
  const [isLoading, setIsLoading] = useState(false);
  const matchWalletUtxos = useMatchWalletUtxos();

  const checkIfInputsIncludeTaproot = useCallback(
    async (inputs: TransactionInput[]) => {
      setIsLoading(true);

      try {
        const hasTaprootUtxos = matchWalletUtxos(inputs).some(utxo =>
          isTaprootAddress(utxo.address)
        );

        if (!hasTaprootUtxos) return false;

        const { userAcceptedRisk } = await TaprootUtxoWarningDialog.call();
        return !userAcceptedRisk;
      } finally {
        setIsLoading(false);
      }
    },
    [matchWalletUtxos]
  );

  return { checkIfInputsIncludeTaproot, isLoading };
}
