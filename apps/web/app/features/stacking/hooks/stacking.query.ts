import { useQuery } from '@tanstack/react-query';
import { useStackingClient } from '~/features/stacking/providers/stacking-client-provider';

import {
  createGetAccountExtendedBalancesQueryOptions,
  createGetAllowanceContractCallersQueryOptions,
  createGetCoreInfoQueryOptions,
  createGetCycleDurationQueryOptions,
  createGetPoxInfoQueryOptions,
  createGetPoxOperationInfoQueryOptions,
  createGetSecondsUntilNextCycleQueryOptions,
  createGetStatusQueryOptions,
} from '@leather.io/query';

export function useGetAllowanceContractCallersQuery(
  ...params: Parameters<typeof createGetAllowanceContractCallersQueryOptions>
) {
  return useQuery(createGetAllowanceContractCallersQueryOptions(...params));
}

export function useGetCycleDurationQuery() {
  const { client } = useStackingClient();
  if (!client) throw new Error('Expected client to be defined.');
  return useQuery(createGetCycleDurationQueryOptions({ client }));
}

export function useGetStatusQuery() {
  const { client } = useStackingClient();
  if (!client) throw new Error('Expected client to be defined.');
  return useQuery(createGetStatusQueryOptions({ client }));
}

export function useGetPoxOperationInfoQuery() {
  const { client } = useStackingClient();
  if (!client) throw new Error('Expected client to be defined.');
  return useQuery(createGetPoxOperationInfoQueryOptions({ client }));
}

export function useGetCoreInfoQuery() {
  const { client } = useStackingClient();
  if (!client) throw new Error('Expected client to be defined.');
  return useQuery(createGetCoreInfoQueryOptions({ client }));
}

export function useGetSecondsUntilNextCycleQuery() {
  const { client } = useStackingClient();
  if (!client) throw new Error('Expected client to be defined.');
  return useQuery(createGetSecondsUntilNextCycleQueryOptions({ client }));
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
