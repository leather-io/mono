import { type UseQueryOptions } from '@tanstack/react-query';

import { BitcoinAddress, type BitcoinNetworkModes } from '@leather.io/models';
import { oneWeekInMs } from '@leather.io/utils';

import { checkEntityAddressIsCompliant } from './compliance-checker';
import { ComplianceReport } from './compliance-checker.types';

interface MakeComplianceQueryProps {
  address: string | BitcoinAddress;
  networkMode: BitcoinNetworkModes;
}

export function makeComplianceQuery({
  address,
  networkMode,
}: MakeComplianceQueryProps): UseQueryOptions<ComplianceReport> {
  return {
    enabled: networkMode === 'mainnet',
    queryKey: ['address-compliance-check', address],
    async queryFn() {
      return checkEntityAddressIsCompliant({ address });
    },
    gcTime: Infinity,
    staleTime: oneWeekInMs,
    refetchInterval: oneWeekInMs,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  };
}
