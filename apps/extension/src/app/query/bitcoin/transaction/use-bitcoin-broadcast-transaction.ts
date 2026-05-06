import { useCallback, useState } from 'react';

import { decodeBitcoinTx } from '@leather.io/bitcoin';
import { delay } from '@leather.io/utils';

import { useBitcoinClient } from '../clients/bitcoin-client';
import { useCheckUnspendableUtxos } from './use-check-utxos';

interface BroadcastCallbackArgs {
  tx: string;
  skipTaprootCheck?: boolean;
  delayTime?: number;
  onSuccess?(txid: string): void;
  onError?(error: Error): void;
  onFinally?(): void;
}
export function useBitcoinBroadcastTransaction() {
  const client = useBitcoinClient();
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const { checkIfUtxosListIncludesTaproot } = useCheckUnspendableUtxos();

  const broadcastTx = useCallback(
    async ({
      tx,
      onSuccess,
      onError,
      onFinally,
      skipTaprootCheck = false,
      delayTime = 700,
    }: BroadcastCallbackArgs) => {
      try {
        if (!skipTaprootCheck) {
          const allInputs = decodeBitcoinTx(tx).inputs;
          const shouldHalt = await checkIfUtxosListIncludesTaproot(allInputs);
          if (shouldHalt) {
            return;
          }
        }

        setIsBroadcasting(true);
        const resp = await client.transactionsApi.broadcastTransaction(tx);
        await delay(delayTime);
        if (!resp.ok) throw new Error(await resp.text());
        const txid = await resp.text();
        onSuccess?.(txid);
        return txid;
      } catch (e) {
        onError?.(e as Error);
        return;
      } finally {
        setIsBroadcasting(false);
        onFinally?.();
      }
    },
    [checkIfUtxosListIncludesTaproot, client]
  );

  return { broadcastTx, isBroadcasting };
}
