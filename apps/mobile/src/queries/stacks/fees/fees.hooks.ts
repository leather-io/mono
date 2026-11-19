import { useUserSettings } from '@/hooks/use-user-settings';
import type { StacksTransactionWire } from '@stacks/transactions';
import { useQuery } from '@tanstack/react-query';

import { createStacksTransactionFeesQueryConfig } from '@leather.io/queries';

export function useCalculateStacksTxFees(unsignedTx: StacksTransactionWire) {
  const settings = useUserSettings();
  return useQuery(createStacksTransactionFeesQueryConfig(unsignedTx, settings));
}
