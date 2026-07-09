import { useNavigate } from 'react-router';

import { Box, Flex, styled } from 'leather-styles/jsx';
import { useVaultAccountActivityFeed } from '~/features/multisig/activity/use-vault-account-activity-feed';

import type { VaultAccount } from '@leather.io/models';
import { Button } from '@leather.io/ui';

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
    return (
      <Box
        borderRadius="md"
        borderWidth="1px"
        borderStyle="dashed"
        borderColor="ink.border-default"
        p="space.05"
        textAlign="center"
      >
        <styled.span textStyle="caption.01" color="ink.text-subdued">
          No transactions yet.
        </styled.span>
      </Box>
    );
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
