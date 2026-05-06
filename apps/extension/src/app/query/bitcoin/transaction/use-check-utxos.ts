import { useCallback, useState } from 'react';

import { TransactionInput } from '@scure/btc-signer/psbt';
import { bytesToHex } from '@stacks/common';

import { TaprootUtxoWarningDialog } from '../../../features/dialogs/taproot-utxo-warning-dialog/taproot-utxo-warning-dialog';
import { useCurrentUtxos } from '../utxos/utxos.hooks';

const taprootAddressPrefixes = ['bc1p', 'tb1p', 'bcrt1p'];

function isTaprootAddress(address: string) {
  return taprootAddressPrefixes.some(prefix => address.startsWith(prefix));
}

export function useCheckUnspendableUtxos() {
  const [isLoading, setIsLoading] = useState(false);
  const { utxos: walletUtxos } = useCurrentUtxos();

  const checkIfUtxosListIncludesTaproot = useCallback(
    async (inputs: TransactionInput[]) => {
      setIsLoading(true);
      try {
        const allWalletUtxos = [
          ...walletUtxos.confirmed,
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

        if (hasTaprootUtxos) {
          const { userAcceptedRisk } = await TaprootUtxoWarningDialog.call();
          return !userAcceptedRisk;
        }

        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [walletUtxos]
  );

  return {
    checkIfUtxosListIncludesTaproot,
    isLoading,
  };
}
