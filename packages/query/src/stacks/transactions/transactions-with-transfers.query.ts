import { AddressTransactionsWithTransfersListResponse } from '@stacks/stacks-blockchain-api-types';
import { type QueryFunctionContext } from '@tanstack/react-query';

import { StacksQueryPrefixes } from '../../query-prefixes';
import { StacksClient } from '../stacks-client';

const queryOptions = {
  staleTime: 60 * 1000,
  refetchInterval: 30_000,
  refetchOnMount: false,
  refetchOnReconnect: false,
  refetchOnWindowFocus: true,
} as const;

export function filterVerboseUnusedTransactionWithTransferData(
  resp: AddressTransactionsWithTransfersListResponse
) {
  const parsedResults = resp.results.map(result => {
    if (result.tx.tx_type === 'smart_contract')
      result.tx.smart_contract = { ...result.tx.smart_contract, source_code: 'redacted' };

    if (result.tx.tx_type === 'contract_call' && result.tx.contract_call.function_args) {
      result.tx.contract_call.function_args = result.tx.contract_call.function_args.map(fnArgs => ({
        ...fnArgs,
        hex: 'redacted',
        repr: 'redacted',
      }));
      result.tx.tx_result = { ...result.tx.tx_result, hex: 'redacted', repr: 'redacted' };
    }
    return result;
  });
  return { ...resp, results: parsedResults };
}

interface CreateGetAccountTransactionsWithTransfersQueryOptionsArgs {
  address: string;
  client: StacksClient;
  network: string;
}
export function createGetAccountTransactionsWithTransfersQueryOptions({
  address,
  client,
  network,
}: CreateGetAccountTransactionsWithTransfersQueryOptionsArgs) {
  return {
    enabled: !!address && !!network,
    queryKey: [StacksQueryPrefixes.GetAccountTxsWithTransfers, address, network],
    queryFn: async ({ signal }: QueryFunctionContext) => {
      const resp = await client.getAccountTransactionsWithTransfers(address, signal);
      // transactions_with_transfers is deprecated. When removing this **make
      // sure that the filtering is used on the new endpoints**
      return filterVerboseUnusedTransactionWithTransferData(resp);
    },
    ...queryOptions,
  } as const;
}
