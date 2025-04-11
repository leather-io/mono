import { StacksNetwork } from '@stacks/network';
import { StacksTransactionWire, broadcastTransaction } from '@stacks/transactions';
import { useMutation } from '@tanstack/react-query';

import { getErrorMessage } from '@leather.io/stacks';

export function useBroadcastStxTransaction() {
  return useMutation({
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

      return Promise.resolve(response);
    },
  });
}
