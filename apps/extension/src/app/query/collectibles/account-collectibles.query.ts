import { type UseQueryOptions, useQuery } from '@tanstack/react-query';

import { type CollectibleView, createCollectibleView } from '@leather.io/features';
import { type AccountAddresses, type NonFungibleCryptoAsset } from '@leather.io/models';
import { createAccountCollectiblesQueryConfig } from '@leather.io/queries';

import { useFlags } from '@app/features/feature-flags';
import { useUserSettings } from '@app/hooks/use-user-settings';

function useAccountCollectiblesQuery(
  account: AccountAddresses,
  options: Partial<UseQueryOptions<NonFungibleCryptoAsset[], Error, CollectibleView[]>> = {}
) {
  const settings = useUserSettings();
  const { isOrdinalsActive } = useFlags();
  const { select, ...rest } = options;

  return useQuery<NonFungibleCryptoAsset[], Error, CollectibleView[]>({
    ...createAccountCollectiblesQueryConfig(
      { account, protections: { isOrdinalsActive } },
      settings
    ),
    ...rest,
    select: select ?? (collectibles => collectibles.map(createCollectibleView)),
  });
}

export function useAccountCollectibles(
  account: AccountAddresses,
  options?: Partial<UseQueryOptions<NonFungibleCryptoAsset[], Error, CollectibleView[]>>
) {
  return useAccountCollectiblesQuery(account, options);
}
