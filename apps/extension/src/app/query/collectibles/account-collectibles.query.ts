import { useQuery } from '@tanstack/react-query';

import { type CollectibleView, createCollectibleView } from '@leather.io/features';
import { type AccountAddresses } from '@leather.io/models';
import {
  type UseAccountCollectiblesQueryOptions,
  createAccountCollectiblesQueryConfig,
} from '@leather.io/queries';

export function useAccountCollectibles(
  account: AccountAddresses,
  options: UseAccountCollectiblesQueryOptions<CollectibleView[]> = {}
) {
  const { select, ...rest } = options;

  return useQuery(
    createAccountCollectiblesQueryConfig(account, {
      ...rest,
      select: select ?? (collectibles => collectibles.map(createCollectibleView)),
    })
  );
}
