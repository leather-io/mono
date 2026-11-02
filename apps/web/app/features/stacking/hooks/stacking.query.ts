import { useQuery } from '@tanstack/react-query';
import { useStackingClient } from '~/features/stacking/providers/stacking-client-provider';
import {
  createGetAccountExtendedBalancesQueryOptions,
  createGetStatusQueryOptions,
} from '~/features/stacking/queries/create-stacking-client-query-options';

export function useGetStatusQuery() {
  const { client } = useStackingClient();
  if (!client) throw new Error('Expected client to be defined.');
  return useQuery(createGetStatusQueryOptions({ client }));
}

export function useGetAccountExtendedBalancesQuery() {
  const { client } = useStackingClient();
  if (!client) throw new Error('Expected client to be defined.');
  return useQuery(createGetAccountExtendedBalancesQueryOptions({ client }));
}
