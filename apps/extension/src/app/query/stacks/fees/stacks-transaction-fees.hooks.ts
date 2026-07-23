import type { StacksTransactionWire } from '@stacks/transactions';
import { useQuery } from '@tanstack/react-query';

import { createStacksTransactionFeesQueryConfig } from '@leather.io/queries';

import { useUserSettings } from '@app/hooks/use-user-settings';

export function useStacksTransactionFees(unsignedTx?: StacksTransactionWire, signerCount?: number) {
  const settings = useUserSettings();
  const config = unsignedTx
    ? createStacksTransactionFeesQueryConfig(unsignedTx, settings, signerCount)
    : {
        queryKey: ['stacks-transaction-fees-disabled'],
        queryFn: () => Promise.reject(new Error('No unsigned tx')),
      };
  return useQuery({
    ...config,
    enabled: !!unsignedTx,
  });
}
