import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';
import { useUserSettings } from '~/hooks/use-user-settings';
import { formatActivityMoney } from '~/queries/activity/blockchain-activity.query';

import { type BlockchainActivityView, createBlockchainActivityView } from '@leather.io/features';
import type { FungibleCryptoAsset, VaultAccount } from '@leather.io/models';
import { createBlockchainActivityByAssetIdQueryConfig } from '@leather.io/queries';
import { getAssetId } from '@leather.io/utils';

import { getMultisigAccountAddresses } from '../vaults/multisig-account-addresses';

export interface VaultAssetActivity {
  views: BlockchainActivityView[];
  isPending: boolean;
}

export function useVaultAssetActivity(
  account: VaultAccount,
  asset: FungibleCryptoAsset
): VaultAssetActivity {
  const settings = useUserSettings();

  const query = useQuery(
    createBlockchainActivityByAssetIdQueryConfig(
      getMultisigAccountAddresses(account),
      getAssetId(asset),
      settings
    )
  );

  const views = useMemo(
    () =>
      (query.data ?? []).map(item =>
        createBlockchainActivityView(item, { formatMoney: formatActivityMoney })
      ),
    [query.data]
  );

  return { views, isPending: query.isPending };
}
