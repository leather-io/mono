import { type StacksTransactionWire, serializePayload } from '@stacks/transactions';
import type { QueryFunctionContext } from '@tanstack/react-query';

import { type UserSettings, getStacksTransactionFeesService } from '@leather.io/services';
import { minutesInMs } from '@leather.io/utils';

import { createServiceQueryKey } from '../shared/query-key.factory';

export function createStacksTransactionFeesQueryKey(
  unsignedTx: StacksTransactionWire,
  settings: UserSettings
) {
  const payloadHex = serializePayload(unsignedTx.payload);
  return createServiceQueryKey(
    'stacks-transaction-fees-service--get-stacks-transaction-fees',
    [payloadHex],
    settings
  );
}

export function createStacksTransactionFeesQueryConfig(
  unsignedTx: StacksTransactionWire,
  settings: UserSettings
) {
  return {
    queryKey: createStacksTransactionFeesQueryKey(unsignedTx, settings),
    queryFn: ({ signal }: QueryFunctionContext) =>
      getStacksTransactionFeesService().getStacksTransactionFees(unsignedTx, signal),
    refetchOnWindowFocus: false,
    refetchInterval: minutesInMs(2),
    refetchOnMount: true,
  };
}
