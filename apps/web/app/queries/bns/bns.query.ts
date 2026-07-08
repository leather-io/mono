import { useQueries, useQuery } from '@tanstack/react-query';
import { useUserSettings } from '~/hooks/use-user-settings';

import { createAccountBnsNamesQueryConfig, createBnsNameQueryConfig } from '@leather.io/queries';

export type BnsResolution =
  | { status: 'loading' }
  | { status: 'found'; owner: string }
  | { status: 'not-found' };

// Resolves a dynamic set of BNS names to their owning Stacks address, keyed by
// full name. Feeds the vault member fields, where the candidate names change as
// the user types. Callers pass only BNS-shaped strings so every query is enabled.
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

// The BNS name to display for a Stacks address: its primary name, else the first
// name it owns — matching how the wallet extension labels an account. (The extension
// can also apply a local custom rename, which the web app has no way to see.)
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
