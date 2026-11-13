import { useQuery } from '@tanstack/react-query';
import { useStackingClient } from '~/features/stacking/providers/stacking-client-provider';
import { createGetLockedStxQueryOptions } from '~/features/stacking/queries/create-get-locked-stx-query-options';
import { createGetStatusQueryOptions } from '~/features/stacking/queries/create-stacking-client-query-options';
import { createStacksApiClient } from '~/utils/stacks-api-client';

export function useGetStatusQuery() {
  const { client } = useStackingClient();
  if (!client) throw new Error('Expected client to be defined.');
  return useQuery(createGetStatusQueryOptions({ client }));
}

export function useGetLockedStxQuery() {
  const { client } = useStackingClient();
  if (!client) throw new Error('Expected client to be defined.');
  return useQuery(
    createGetLockedStxQueryOptions({
      address: client.address,
      apiUrl: client.baseUrl,
      client: createStacksApiClient(client.baseUrl),
    })
  );
}
