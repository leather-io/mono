import { useRef } from 'react';

import { useQueries, useQuery } from '@tanstack/react-query';
import { useUserSettings } from '~/hooks/use-user-settings';

import { createAccountBnsNamesQueryConfig, createBnsNameQueryConfig } from '@leather.io/queries';
import type { AccountBnsName } from '@leather.io/services';

export type BnsResolution =
  | { status: 'loading' }
  | { status: 'found'; owner: string }
  | { status: 'not-found' };

function useStableMap<V>(entries: [string, V][]): Map<string, V> {
  const signature = entries.map(([key, value]) => `${key}=${JSON.stringify(value)}`).join('|');
  const cache = useRef<{ signature: string; map: Map<string, V> }>();
  const current = cache.current;
  if (!current || current.signature !== signature) {
    const map = new Map(entries);
    cache.current = { signature, map };
    return map;
  }
  return current.map;
}

export function useBnsNames(fullNames: string[]): Map<string, BnsResolution> {
  const settings = useUserSettings();
  const unique = [...new Set(fullNames)];

  const results = useQueries({
    queries: unique.map(name => createBnsNameQueryConfig(name, settings)),
  });

  const entries = unique.map<[string, BnsResolution]>((name, index) => {
    const result = results[index];
    if (result.isLoading) return [name, { status: 'loading' }];
    return [
      name,
      result.data ? { status: 'found', owner: result.data.owner } : { status: 'not-found' },
    ];
  });
  return useStableMap(entries);
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

  const entries = unique.map<[string, string | undefined]>((address, index) => [
    address,
    results[index].data,
  ]);
  return useStableMap(entries);
}
