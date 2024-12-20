import { StacksNetwork } from '@stacks/network';
import { StacksTransactionWire, broadcastTransaction } from '@stacks/transactions';
import { useMutation } from '@tanstack/react-query';

export function useBroadcastStxTransaction() {
  return useMutation({
    mutationFn: ({
      tx,
      stacksNetwork,
    }: {
      tx: StacksTransactionWire;
      stacksNetwork: StacksNetwork;
    }) => broadcastTransaction({ transaction: tx, network: stacksNetwork }),
  });
}
