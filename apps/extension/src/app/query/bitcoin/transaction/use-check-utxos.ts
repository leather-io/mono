import { useCallback, useState } from 'react';

import { TransactionInput } from '@scure/btc-signer/psbt';
import { bytesToHex } from '@stacks/common';

import { BitcoinClient, getNumberOfInscriptionsOnUtxoUsingOrdinalsCom } from '@leather.io/query';
import { isUndefined } from '@leather.io/utils';

import { useFlags } from '@app/features/feature-flags';
import { useCurrentNetworkState, useIsLeatherTestingEnv } from '@app/query/leather-query-provider';

import { InscribedUtxoWarningDialog } from '../../../features/dialogs/inscribed-utxo-warning-dialog/inscribed-utxo-warning-dialog';
import { TaprootUtxoWarningDialog } from '../../../features/dialogs/taproot-utxo-warning-dialog/taproot-utxo-warning-dialog';
import { useBitcoinClient } from '../clients/bitcoin-client';
import { useCurrentUtxos } from '../utxos/utxos.hooks';

interface CheckInscribedUtxosByBestinslotArgs {
  inputs: TransactionInput[];
  txids: string[];
  client: BitcoinClient;
}

async function checkInscribedUtxosByBestinslot({
  inputs,
  txids,
  client,
}: CheckInscribedUtxosByBestinslotArgs): Promise<boolean> {
  /**
   * Get the list of inscriptions moving on a transaction
   * @see https://docs.bestinslot.xyz/reference/api-reference/ordinals-and-brc-20-and-bitmap-v3-api-mainnet+testnet/inscriptions
   */
  const inscriptionIdsList = await Promise.all(
    txids.map(id => client.BestInSlotApi.getInscriptionsByTransactionId(id))
  );

  const inscriptionIds = inscriptionIdsList.flatMap(inscription =>
    inscription.data.map(data => data.inscription_id)
  );

  const inscriptionsList = await Promise.all(
    inscriptionIds.map(id => client.BestInSlotApi.getInscriptionById(id))
  );

  const hasInscribedUtxos = inscriptionsList.some(resp => {
    return inputs.some(input => {
      if (!input.txid) throw new Error('Transaction ID is missing in the input');
      const idWithIndex = `${bytesToHex(input.txid)}:${input.index}`;
      return resp.data.satpoint.includes(idWithIndex);
    });
  });

  return hasInscribedUtxos;
}

function verifyUserConfirmsSpendingInscribedUtxos() {
  return InscribedUtxoWarningDialog.call();
}

const taprootAddressPrefixes = ['bc1p', 'tb1p', 'bcrt1p'];
const smallTaprootUtxoThreshold = 10_000;

function isTaprootAddress(address: string) {
  return taprootAddressPrefixes.some(prefix => address.startsWith(prefix));
}

export function useCheckUnspendableUtxos() {
  const client = useBitcoinClient();
  const [isLoading, setIsLoading] = useState(false);
  const { isTestnet } = useCurrentNetworkState();
  const isTestEnv = useIsLeatherTestingEnv();
  const { isOrdinalsActive, isRunesActive } = useFlags();
  const { utxos: walletUtxos } = useCurrentUtxos();

  const checkIfUtxosListIncludesInscribed = useCallback(
    async (inputs: TransactionInput[]) => {
      setIsLoading(true);

      const txids = inputs.map(input => {
        if (!input.txid) throw new Error('Transaction ID is missing in the input');
        return bytesToHex(input.txid);
      });

      function hasSmallTaprootUtxos() {
        const allWalletUtxos = [
          ...walletUtxos.confirmed,
          ...walletUtxos.protected,
          ...walletUtxos.inbound,
          ...walletUtxos.available,
        ];
        return inputs.some(input => {
          if (!input.txid) return false;
          const txid = bytesToHex(input.txid);
          const match = allWalletUtxos.find(u => u.txid === txid && u.vout === input.index);
          if (!match) return false;
          return isTaprootAddress(match.address) && match.value <= smallTaprootUtxoThreshold;
        });
      }

      async function warnIfSmallTaprootUtxos() {
        if (hasSmallTaprootUtxos()) {
          const { userAcceptedRisk } = await TaprootUtxoWarningDialog.call();
          return !userAcceptedRisk;
        }
        return false;
      }

      try {
        if (!isOrdinalsActive) {
          return await warnIfSmallTaprootUtxos();
        }

        // no need to check for inscriptions on testnet
        if (isTestnet && !isTestEnv) {
          return false;
        }

        if (txids.length === 0) {
          throw new Error('Utxos list cannot be empty');
        }

        const ordinalsComResponses = await Promise.all(
          txids.map(async (id, index) => {
            const inscriptionIndex = inputs[index].index;
            if (isUndefined(inscriptionIndex)) {
              throw new Error('Inscription index is missing in the input');
            }
            const num = await getNumberOfInscriptionsOnUtxoUsingOrdinalsCom(id, inscriptionIndex);
            return num > 0;
          })
        );

        const hasInscribedUtxo = ordinalsComResponses.some(resp => resp);

        if (hasInscribedUtxo) {
          const { userAcceptedRisk } = await verifyUserConfirmsSpendingInscribedUtxos();
          return !userAcceptedRisk;
        }

        if (!isRunesActive) {
          return await warnIfSmallTaprootUtxos();
        }

        return false;
      } catch {
        const hasInscribedUtxo = await checkInscribedUtxosByBestinslot({
          inputs,
          txids,
          client,
        });

        if (hasInscribedUtxo) {
          const { userAcceptedRisk } = await verifyUserConfirmsSpendingInscribedUtxos();
          return !userAcceptedRisk;
        }

        if (!isRunesActive) {
          return await warnIfSmallTaprootUtxos();
        }

        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [client, isOrdinalsActive, isRunesActive, isTestEnv, isTestnet, walletUtxos]
  );

  return {
    checkIfUtxosListIncludesInscribed,
    isLoading,
  };
}
