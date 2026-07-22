import { useNavigate } from 'react-router';

import { Box, Flex } from 'leather-styles/jsx';
import { useVaultAccountActivityFeed } from '~/features/multisig/activity/use-vault-account-activity-feed';

import type { VaultAccount } from '@leather.io/models';
import { Button } from '@leather.io/ui';

import { ActivityEmptyState } from '../../components/activity-empty-state';
import { VaultActivityList } from '../../components/vault-activity-list';
import { multisigPaths } from '../../multisig.constants';

interface AccountTransactionsProps {
  account: VaultAccount | undefined;
}

export function AccountTransactions({ account }: AccountTransactionsProps) {
  const navigate = useNavigate();
  const { items, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useVaultAccountActivityFeed(account);

  if (isLoading) {
    return (
      <Flex direction="column" gap="space.03">
        {[0, 1].map(index => (
          <Box
            key={index}
            height="56px"
            borderRadius="md"
            bg="ink.component-background-default"
            opacity={0.6}
          />
        ))}
      </Flex>
    );
  }

  if (items.length === 0) {
    return <ActivityEmptyState description="Transactions for this account will appear here." />;
  }

  return (
    <Flex direction="column" gap="space.04">
      <VaultActivityList
        items={items}
        onSelect={(targetVaultId, txId) => void navigate(multisigPaths.tx(targetVaultId, txId))}
      />
      {hasNextPage && (
        <Flex justifyContent="center">
          <Button
            variant="outline"
            disabled={isFetchingNextPage}
            aria-busy={isFetchingNextPage}
            onClick={fetchNextPage}
          >
            {isFetchingNextPage ? 'Loading…' : 'Load more'}
          </Button>
        </Flex>
      )}
    </Flex>
  );
}
