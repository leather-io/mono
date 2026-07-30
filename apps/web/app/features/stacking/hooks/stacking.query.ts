import { useQuery } from '@tanstack/react-query';
import { useStackingClient } from '~/features/stacking/providers/stacking-client-provider';

import {
  createGetAccountExtendedBalancesQueryOptions,
  createGetPoxInfoQueryOptions,
  createGetStatusQueryOptions,
} from '@leather.io/query';

export function useGetStatusQuery() {
  const { client } = useStackingClient();
  if (!client) throw new Error('Expected client to be defined.');
  return useQuery(createGetStatusQueryOptions({ client }));
}

export function useGetPoxInfoQuery() {
  const { client } = useStackingClient();
  if (!client) throw new Error('Expected client to be defined.');
  return useQuery(createGetPoxInfoQueryOptions({ client }));
}

export function useGetAccountExtendedBalancesQuery() {
  const { client } = useStackingClient();
  if (!client) throw new Error('Expected client to be defined.');
  return useQuery(createGetAccountExtendedBalancesQueryOptions({ client }));
}
