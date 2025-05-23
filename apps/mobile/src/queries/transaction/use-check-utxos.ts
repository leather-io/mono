import { useCallback, useState } from 'react';

import { TransactionInput } from '@scure/btc-signer/psbt';
import { bytesToHex } from '@stacks/common';

import { BitcoinError } from '@leather.io/bitcoin';
import { BitcoinClient, getNumberOfInscriptionsOnUtxoUsingOrdinalsCom } from '@leather.io/query';
import { isUndefined } from '@leather.io/utils';

import { useBitcoinClient } from '../clients/bitcoin-client';
import { useCurrentNetworkState, useIsLeatherTestingEnv } from '../leather-query-provider';

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

export function useCheckUnspendableUtxos(blockTxAction?: () => void) {
  const client = useBitcoinClient();
  const [isLoading, setIsLoading] = useState(false);
  const { isTestnet } = useCurrentNetworkState();
  const isTestEnv = useIsLeatherTestingEnv();

  const preventTransaction = useCallback(() => {
    if (blockTxAction) return blockTxAction();
    throw new BitcoinError('InscribedUtxos');
  }, [blockTxAction]);

  const checkIfUtxosListIncludesInscribed = useCallback(
    async (inputs: TransactionInput[]) => {
      setIsLoading(true);
      const txids = inputs.map(input => {
        if (!input.txid) throw new Error('Transaction ID is missing in the input');
        return bytesToHex(input.txid);
      });

      try {
        // no need to check for inscriptions on testnet
        if (isTestnet && !isTestEnv) {
          return false;
        }

        if (txids.length === 0) {
          throw new Error('Utxos list cannot be empty');
        }

        const ordinalsComResponses = await Promise.all(
          txids.map(async (id, index) => {
            const inscriptionIndex = inputs[index]?.index;
            if (isUndefined(inscriptionIndex)) {
              throw new Error('Inscription index is missing in the input');
            }
            const num = await getNumberOfInscriptionsOnUtxoUsingOrdinalsCom(id, inscriptionIndex);
            return num > 0;
          })
        );

        const hasInscribedUtxo = ordinalsComResponses.some(resp => resp);

        // if there are inscribed utxos in the transaction, and no error => prevent the transaction
        if (hasInscribedUtxo) {
          preventTransaction();
          return true;
        }

        // if there are no inscribed utxos in the transaction => allow the transaction
        return false;
      } catch (e) {
        if (e instanceof BitcoinError) {
          throw e;
        }

        const hasInscribedUtxo = await checkInscribedUtxosByBestinslot({
          inputs,
          txids,
          client,
        });

        if (hasInscribedUtxo) {
          preventTransaction();
          return true;
        }

        // if there are no inscribed utxos in the transaction => allow the transaction
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [client, isTestEnv, isTestnet, preventTransaction]
  );

  return {
    checkIfUtxosListIncludesInscribed,
    isLoading,
  };
}
