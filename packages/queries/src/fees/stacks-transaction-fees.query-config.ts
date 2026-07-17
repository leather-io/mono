import { type StacksTransactionWire, serializePayload } from '@stacks/transactions';
import type { QueryFunctionContext } from '@tanstack/react-query';

import { type UserSettings, getStacksTransactionFeesService } from '@leather.io/services';
import { minutesInMs } from '@leather.io/utils';

import { createServiceQueryKey } from '../shared/query-key.factory';

export function createStacksTransactionFeesQueryKey(
  unsignedTx: StacksTransactionWire,
  settings: UserSettings,
  signerCount?: number
) {
  const payloadHex = serializePayload(unsignedTx.payload);
  return createServiceQueryKey(
    'stacks-transaction-fees-service--get-stacks-transaction-fees',
    [payloadHex, signerCount ?? 1],
    settings
  );
}

export function createStacksTransactionFeesQueryConfig(
  unsignedTx: StacksTransactionWire,
  settings: UserSettings,
  signerCount?: number
) {
  return {
    queryKey: createStacksTransactionFeesQueryKey(unsignedTx, settings, signerCount),
    queryFn: ({ signal }: QueryFunctionContext) =>
      getStacksTransactionFeesService().getStacksTransactionFees(unsignedTx, signerCount, signal),
    refetchOnWindowFocus: false,
    refetchInterval: minutesInMs(2),
    refetchOnMount: true,
  };
}
