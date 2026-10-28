import { useCallback, useState } from 'react';

import { getMempoolApiClient } from '@leather.io/services';
import { delay } from '@leather.io/utils';

interface BroadcastCallbackArgs {
  tx: string;
  delayTime?: number;
  onResult?(txid: string): void;
  onError?(error: unknown): void;
  onFinally?(): void;
}

export function useBitcoinBroadcastTransaction() {
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const broadcastTx = useCallback(
    async ({ tx, onResult, onError, onFinally, delayTime = 700 }: BroadcastCallbackArgs) => {
      try {
        setIsBroadcasting(true);
        const resp = await getMempoolApiClient().broadcastTransaction(tx);
        // simulate slower broadcast time to allow mempool refresh
        await delay(delayTime);
        if (!resp.ok) throw new Error(await resp.text());
        const txid = await resp.text();
        onResult?.(txid);
        return txid;
      } catch (e) {
        onError?.(e);
        return;
      } finally {
        setIsBroadcasting(false);
        onFinally?.();
      }
    },
    []
  );

  return { broadcastTx, isBroadcasting };
}
