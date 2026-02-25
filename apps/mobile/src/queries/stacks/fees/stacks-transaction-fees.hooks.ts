import { useUserSettings } from '@/hooks/use-user-settings';
import type { StacksTransactionWire } from '@stacks/transactions';
import { useQuery } from '@tanstack/react-query';

import { createStacksTransactionFeesQueryConfig } from '@leather.io/queries';

export function useStacksTransactionFees(unsignedTx?: StacksTransactionWire) {
  const settings = useUserSettings();
  const config = unsignedTx
    ? createStacksTransactionFeesQueryConfig(unsignedTx, settings)
    : {
        queryKey: ['stacks-transaction-fees-disabled'],
        queryFn: () => Promise.reject(new Error('No unsigned tx')),
      };
  return useQuery({
    ...config,
    enabled: !!unsignedTx,
  });
}
