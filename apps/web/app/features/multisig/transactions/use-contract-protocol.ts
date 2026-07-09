import { useQuery } from '@tanstack/react-query';
import { useUserSettings } from '~/hooks/use-user-settings';

import { getStacksProtocolService } from '@leather.io/services';

const protocolRegistryCacheOptions = { staleTime: 300_000, gcTime: 300_000 } as const;

// Resolves a contract's protocol name (e.g. "Zest"), sharing the feed's registry cache key.
export function useContractProtocolName(contractId: string | undefined): string | undefined {
  const settings = useUserSettings();
  const address = contractId?.split('.')[0];
  const query = useQuery({
    queryKey: ['stacks-protocol-by-address', settings.network.id, address],
    queryFn: ({ signal }: { signal: AbortSignal }) =>
      getStacksProtocolService().getProtocolByAddress(address ?? '', signal),
    enabled: Boolean(address),
    ...protocolRegistryCacheOptions,
  });
  return query.data?.name;
}
