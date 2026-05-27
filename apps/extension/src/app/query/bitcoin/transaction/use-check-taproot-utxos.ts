import { useCallback, useState } from 'react';

import { TransactionInput } from '@scure/btc-signer/psbt';
import { bytesToHex } from '@stacks/common';

import { TaprootUtxoWarningDialog } from '../../../features/dialogs/taproot-utxo-warning-dialog/taproot-utxo-warning-dialog';
import { useCurrentUtxos } from '../utxos/utxos.hooks';

const taprootAddressPrefixes = ['bc1p', 'tb1p', 'bcrt1p'];

function isTaprootAddress(address: string) {
  return taprootAddressPrefixes.some(prefix => address.startsWith(prefix));
}

export function useCheckTaprootUtxos() {
  const [isLoading, setIsLoading] = useState(false);
  const { utxos: walletUtxos } = useCurrentUtxos();

  const checkIfInputsIncludeTaproot = useCallback(
    async (inputs: TransactionInput[]) => {
      setIsLoading(true);

      try {
        const allWalletUtxos = [
          ...walletUtxos.confirmed,
          ...walletUtxos.protected,
          ...walletUtxos.inbound,
          ...walletUtxos.available,
        ];
        const hasTaprootUtxos = inputs.some(input => {
          if (!input.txid) return false;
          const txid = bytesToHex(input.txid);
          const match = allWalletUtxos.find(u => u.txid === txid && u.vout === input.index);
          if (!match) return false;
          return isTaprootAddress(match.address);
        });

        if (!hasTaprootUtxos) return false;

        const { userAcceptedRisk } = await TaprootUtxoWarningDialog.call();
        return !userAcceptedRisk;
      } finally {
        setIsLoading(false);
      }
    },
    [walletUtxos]
  );

  return { checkIfInputsIncludeTaproot, isLoading };
}
