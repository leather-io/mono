import { useNavigate } from 'react-router';

import { Box, Flex } from 'leather-styles/jsx';
import { useVaultActivity } from '~/features/multisig/activity/use-vault-activity';

import type { VaultAccountSummary } from '@leather.io/models';

import { ActivityEmptyState } from '../../components/activity-empty-state';
import { VaultActivityList } from '../../components/vault-activity-list';
import { multisigPaths } from '../../multisig.constants';

interface VaultTransactionsProps {
  accounts: VaultAccountSummary[] | undefined;
}

export function VaultTransactions({ accounts }: VaultTransactionsProps) {
  const navigate = useNavigate();
  const { items, isLoading } = useVaultActivity(accounts ?? []);
  const accountNamesById = new Map((accounts ?? []).map(account => [account.id, account.name]));

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
    return <ActivityEmptyState description="Transactions for this vault will appear here." />;
  }

  return (
    <VaultActivityList
      items={items}
      scale="compact"
      limit={10}
      accountNamesById={accountNamesById}
      onSelect={(targetVaultId, txId) => void navigate(multisigPaths.tx(targetVaultId, txId))}
    />
  );
}
