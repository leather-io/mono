import { useCallback, useState } from 'react';

import { delay } from '@leather.io/utils';

import { useBitcoinClient } from '../clients/bitcoin-client';

interface BroadcastCallbackArgs {
  tx: string;
  delayTime?: number;
  onResult?(txid: string): void;
  onError?(error: Error): void;
  onFinally?(): void;
}

export function useBitcoinBroadcastTransaction() {
  const client = useBitcoinClient();
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const broadcastTx = useCallback(
    async ({ tx, onResult, onError, onFinally, delayTime = 700 }: BroadcastCallbackArgs) => {
      try {
        setIsBroadcasting(true);
        const resp = await client.transactionsApi.broadcastTransaction(tx);
        // simulate slower broadcast time to allow mempool refresh
        await delay(delayTime);
        if (!resp.ok) throw new Error(await resp.text());
        const txid = await resp.text();
        onResult?.(txid);
        return txid;
      } catch (e) {
        onError?.(e as Error);
        return;
      } finally {
        setIsBroadcasting(false);
        onFinally?.();
      }
    },
    [client]
  );

  return { broadcastTx, isBroadcasting };
}
