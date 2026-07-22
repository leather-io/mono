import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';
import { useUserSettings } from '~/hooks/use-user-settings';

import type { VaultAccount, VaultAccountSummary } from '@leather.io/models';
import { createAssetListQueryConfig } from '@leather.io/queries';
import type { AssetListRequest } from '@leather.io/services';

import { getMultisigAccountAddresses } from '../vaults/multisig-account-addresses';
import { type VaultAssetItem, buildVaultAssetItems } from './vault-asset-items';

const assetListCacheOptions = {
  refetchOnMount: true,
  staleTime: 30_000,
  gcTime: 300_000,
} as const;

export interface VaultAccountAssets {
  items: VaultAssetItem[];
  isPending: boolean;
}

export function useVaultAccountAssets(
  account?: VaultAccount | VaultAccountSummary
): VaultAccountAssets {
  const settings = useUserSettings();
  const isBitcoin = account?.network.startsWith('btc') ?? false;

  const request: AssetListRequest = {
    filters: { chain: isBitcoin ? 'bitcoin' : 'stacks' },
    includes: { balance: true },
    accountContext: { account: getMultisigAccountAddresses(account) },
  };

  const query = useQuery({
    ...createAssetListQueryConfig(request, settings),
    ...assetListCacheOptions,
    enabled: Boolean(account),
  });

  const items = useMemo<VaultAssetItem[]>(
    () => (query.data ? buildVaultAssetItems(query.data.items, settings.quoteCurrency) : []),
    [query.data, settings.quoteCurrency]
  );

  return { items, isPending: query.isPending };
}
