import type { ClarityAbi } from '@stacks/transactions';
import type { QueryFunctionContext, UseQueryOptions } from '@tanstack/react-query';

import { type UserSettings, getHiroStacksApiClient } from '@leather.io/services';
import { minutesInMs } from '@leather.io/utils';

import { createServiceQueryKey } from '../shared/query-key.factory';

export function createStacksContractInterfaceQueryKey(
  contractAddress: string,
  contractName: string,
  settings: UserSettings
) {
  return createServiceQueryKey(
    'hiro-stacks-api-client--get-contract-interface',
    [contractAddress, contractName],
    settings
  );
}

export function createStacksContractInterfaceQueryConfig(
  contractAddress: string,
  contractName: string,
  settings: UserSettings
) {
  return {
    queryKey: createStacksContractInterfaceQueryKey(contractAddress, contractName, settings),
    queryFn: ({ signal }: QueryFunctionContext) =>
      getHiroStacksApiClient().getContractInterface(contractAddress, contractName, { signal }),
    staleTime: minutesInMs(30),
    refetchOnWindowFocus: false,
  } satisfies UseQueryOptions<ClarityAbi>;
}
