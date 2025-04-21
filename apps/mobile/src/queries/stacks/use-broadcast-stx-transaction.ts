import { StacksNetwork } from '@stacks/network';
import { StacksTransactionWire, broadcastTransaction } from '@stacks/transactions';
import { useMutation } from '@tanstack/react-query';

import { getErrorMessage } from '@leather.io/stacks';

export function useBroadcastStxTransaction() {
  return useMutation({
    mutationKey: ['broadcast-stx-transaction'],
    async mutationFn({
      tx,
      stacksNetwork,
    }: {
      tx: StacksTransactionWire;
      stacksNetwork: StacksNetwork;
    }) {
      const response = await broadcastTransaction({ transaction: tx, network: stacksNetwork });

      if ('error' in response) {
        return Promise.reject(new Error(getErrorMessage(response.reason)));
      }

      // Sometimes we might get "API rate limit exceeded" with no txid
      if (!response.txid) {
        return Promise.reject(new Error('Something went wrong'));
      }

      return Promise.resolve(response);
    },
  });
}
