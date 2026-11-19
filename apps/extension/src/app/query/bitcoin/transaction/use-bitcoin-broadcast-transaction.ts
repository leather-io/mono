import { useCallback, useState } from 'react';

import { decodeBitcoinTx } from '@leather.io/bitcoin';
import { getMempoolApiClient } from '@leather.io/services';
import { delay } from '@leather.io/utils';

import { logger } from '@shared/logger';

import { useCheckTaprootUtxos } from './use-check-taproot-utxos';

interface BroadcastCallbackArgs {
  tx: string;
  skipTaprootWarning?: boolean;
  delayTime?: number;
  onSuccess?(txid: string): void | Promise<void>;
  onError?(error: Error): void;
  onFinally?(): void;
}

async function runSuccessHandler(onSuccess: BroadcastCallbackArgs['onSuccess'], txid: string) {
  try {
    await onSuccess?.(txid);
  } catch (error) {
    logger.error('Bitcoin transaction broadcast but the success handler failed', error);
  }
}

export function useBitcoinBroadcastTransaction() {
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
        const resp = await getMempoolApiClient().broadcastTransaction(tx);
        // simulate slower broadcast time to allow mempool refresh
        await delay(delayTime);
        if (!resp.ok) throw new Error(await resp.text());
        const txid = await resp.text();
        await runSuccessHandler(onSuccess, txid);
        return txid;
      } catch (e) {
        onError?.(e instanceof Error ? e : new Error(String(e)));
        return;
      } finally {
        setIsBroadcasting(false);
        onFinally?.();
      }
    },
    [checkIfInputsIncludeTaproot]
  );

  return { broadcastTx, isBroadcasting };
}
