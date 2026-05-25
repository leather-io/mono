import { useCallback, useState } from 'react';

import { decodeBitcoinTx } from '@leather.io/bitcoin';
import { delay } from '@leather.io/utils';

import { useBitcoinClient } from '../clients/bitcoin-client';
import { useCheckTaprootUtxos } from './use-check-taproot-utxos';

interface BroadcastCallbackArgs {
  tx: string;
  skipTaprootWarning?: boolean;
  delayTime?: number;
  onSuccess?(txid: string): void;
  onError?(error: Error): void;
  onFinally?(): void;
}
export function useBitcoinBroadcastTransaction() {
  const client = useBitcoinClient();
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const { checkIfInputsIncludeTaproot } = useCheckTaprootUtxos();

  const broadcastTx = useCallback(
    async ({
      tx,
      skipTaprootWarning = false,
      onSuccess,
      onError,
      onFinally,
      delayTime = 700,
    }: BroadcastCallbackArgs) => {
      try {
        if (!skipTaprootWarning) {
          const inputs = decodeBitcoinTx(tx).inputs;
          const shouldHalt = await checkIfInputsIncludeTaproot(inputs);
          if (shouldHalt) return;
        }

        setIsBroadcasting(true);
        const resp = await client.transactionsApi.broadcastTransaction(tx);
        // simulate slower broadcast time to allow mempool refresh
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
    [checkIfInputsIncludeTaproot, client]
  );

  return { broadcastTx, isBroadcasting };
}
