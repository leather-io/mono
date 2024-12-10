import { StacksNetwork } from '@stacks/network';
import { StacksTransaction, broadcastTransaction } from '@stacks/transactions';
import { useMutation } from '@tanstack/react-query';

export function useBroadcastStxTransaction() {
  return useMutation({
    mutationFn: ({ tx, stacksNetwork }: { tx: StacksTransaction; stacksNetwork: StacksNetwork }) =>
      broadcastTransaction(tx, stacksNetwork),
  });
}
