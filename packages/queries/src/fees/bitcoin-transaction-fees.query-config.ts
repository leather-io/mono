import type { QueryFunctionContext } from '@tanstack/react-query';

import type { Money } from '@leather.io/models';
import {
  type AccountRequest,
  type UserSettings,
  getBitcoinTransactionFeesService,
} from '@leather.io/services';
import { minutesInMs } from '@leather.io/utils';

import { createServiceQueryKey } from '../shared/query-key.factory';

interface BitcoinFeeRecipient {
  address: string;
  amount: Money;
}

export interface BitcoinTransactionFeesParams {
  account: AccountRequest;
  recipients: BitcoinFeeRecipient[];
  isMaxSpend?: boolean;
}

export function createBitcoinTransactionFeesQueryKey(
  params: BitcoinTransactionFeesParams,
  settings: UserSettings
) {
  const serializedParams = {
    fingerprint: params.account.account.id.fingerprint,
    accountIndex: params.account.account.id.accountIndex,
    recipients: params.recipients.map(r => ({
      address: r.address,
      amount: r.amount.amount.toString(),
    })),
    isMaxSpend: params.isMaxSpend ?? false,
  };
  return createServiceQueryKey(
    'bitcoin-transaction-fees-service--get-bitcoin-transaction-fees',
    [serializedParams],
    settings
  );
}

export function createBitcoinTransactionFeesQueryConfig(
  params: BitcoinTransactionFeesParams,
  settings: UserSettings
) {
  return {
    queryKey: createBitcoinTransactionFeesQueryKey(params, settings),
    queryFn: ({ signal }: QueryFunctionContext) =>
      getBitcoinTransactionFeesService().getBitcoinTransactionFees(
        params.account,
        params.recipients,
        params.isMaxSpend,
        signal
      ),
    refetchInterval: minutesInMs(2),
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  };
}
