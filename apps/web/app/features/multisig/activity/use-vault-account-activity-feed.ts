import { useInfiniteQuery } from '@tanstack/react-query';
import { useUserSettings } from '~/hooks/use-user-settings';
import { createBlockchainActivityViewsFeedQuery } from '~/queries/activity/blockchain-activity.query';

import type { VaultAccount } from '@leather.io/models';

import { getMultisigAccountAddresses } from '../vaults/multisig-account-addresses';
import { type VaultActivityItem, harmonizeVaultActivity } from './harmonize-vault-activity';
import { useMultisigActivityInputs } from './use-vault-activity';

const feedPageSize = 25;

interface UseVaultAccountActivityFeedResult {
  items: VaultActivityItem[];
  isLoading: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage(): void;
}

export function useVaultAccountActivityFeed(
  account: VaultAccount | undefined
): UseVaultAccountActivityFeedResult {
  const settings = useUserSettings();

  const feedQuery = useInfiniteQuery({
    ...createBlockchainActivityViewsFeedQuery(
      getMultisigAccountAddresses(account),
      settings,
      feedPageSize
    ),
    enabled: Boolean(account),
  });

  const onchain = feedQuery.data ?? [];
  const {
    multisigTransactions,
    payloadsById,
    marketData,
    classifyContract,
    isLoading: isLoadingInputs,
  } = useMultisigActivityInputs(account ? [account] : [], onchain);

  const oldestLoaded = onchain.length > 0 ? onchain[onchain.length - 1].timestamp : undefined;
  const frontier = feedQuery.hasNextPage ? oldestLoaded : undefined;

  const items = harmonizeVaultActivity({
    onchain,
    multisigTransactions,
    payloadsById,
    marketData,
    classifyContract,
    frontier,
  });

  const isAwaitingOnchain = Boolean(account) && feedQuery.data === undefined && !feedQuery.isError;

  return {
    items,
    isLoading: isAwaitingOnchain || isLoadingInputs,
    hasNextPage: feedQuery.hasNextPage,
    isFetchingNextPage: feedQuery.isFetchingNextPage,
    fetchNextPage: () => void feedQuery.fetchNextPage(),
  };
}
