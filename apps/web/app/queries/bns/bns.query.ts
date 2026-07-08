import { useQueries, useQuery } from '@tanstack/react-query';
import { useUserSettings } from '~/hooks/use-user-settings';

import { createAccountBnsNamesQueryConfig, createBnsNameQueryConfig } from '@leather.io/queries';
import type { AccountBnsName } from '@leather.io/services';

export type BnsResolution =
  | { status: 'loading' }
  | { status: 'found'; owner: string }
  | { status: 'not-found' };

export function useBnsNames(fullNames: string[]): Map<string, BnsResolution> {
  const settings = useUserSettings();
  const unique = [...new Set(fullNames)];

  const results = useQueries({
    queries: unique.map(name => createBnsNameQueryConfig(name, settings)),
  });

  const resolutions = new Map<string, BnsResolution>();
  unique.forEach((name, index) => {
    const result = results[index];
    if (result.isLoading) {
      resolutions.set(name, { status: 'loading' });
      return;
    }
    resolutions.set(
      name,
      result.data ? { status: 'found', owner: result.data.owner } : { status: 'not-found' }
    );
  });
  return resolutions;
}

export function useAddressBnsName(
  stxAddress: string | undefined,
  enabled: boolean
): string | undefined {
  const settings = useUserSettings();
  const query = useQuery({
    ...createAccountBnsNamesQueryConfig(
      {
        account: {
          id: { fingerprint: 'multisig:me', accountIndex: 0 },
          stacks: { stxAddress: stxAddress ?? '' },
        },
      },
      settings
    ),
    enabled: enabled && Boolean(stxAddress),
    select: names => names.find(name => name.isPrimary)?.fullName ?? names[0]?.fullName,
  });
  return query.data;
}

export function useBnsPrimaryNames(addresses: string[]): Map<string, string | undefined> {
  const settings = useUserSettings();
  const unique = [...new Set(addresses)];

  const results = useQueries({
    queries: unique.map(address => ({
      ...createAccountBnsNamesQueryConfig(
        {
          account: {
            id: { fingerprint: 'multisig:member', accountIndex: 0 },
            stacks: { stxAddress: address },
          },
        },
        settings
      ),
      select: (names: AccountBnsName[]) =>
        names.find(name => name.isPrimary)?.fullName ?? names[0]?.fullName,
    })),
  });

  const names = new Map<string, string | undefined>();
  unique.forEach((address, index) => names.set(address, results[index].data));
  return names;
}
