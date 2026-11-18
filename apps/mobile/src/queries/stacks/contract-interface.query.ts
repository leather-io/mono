import { useUserSettings } from '@/hooks/use-user-settings';
import type { ClarityAbi } from '@stacks/transactions';
import { type UseQueryResult, useQuery } from '@tanstack/react-query';

import { createStacksContractInterfaceQueryConfig } from '@leather.io/queries';

export function useGetContractInterface(
  contractAddress: string,
  contractName: string
): UseQueryResult<ClarityAbi> {
  const settings = useUserSettings();
  return useQuery(
    createStacksContractInterfaceQueryConfig(contractAddress, contractName, settings)
  );
}
