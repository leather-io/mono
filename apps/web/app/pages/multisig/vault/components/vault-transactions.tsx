import { useNavigate } from 'react-router';

import { Box, Flex, styled } from 'leather-styles/jsx';
import { useVaultActivity } from '~/features/multisig/activity/use-vault-activity';

import type { VaultAccountSummary } from '@leather.io/models';

import { VaultActivityList } from '../../components/vault-activity-list';
import { multisigPaths } from '../../multisig.constants';

interface VaultTransactionsProps {
  accounts: VaultAccountSummary[] | undefined;
}

export function VaultTransactions({ accounts }: VaultTransactionsProps) {
  const navigate = useNavigate();
  const { items, isLoading } = useVaultActivity(accounts ?? []);

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
    <VaultActivityList
      items={items}
      scale="compact"
      onSelect={(targetVaultId, txId) => void navigate(multisigPaths.tx(targetVaultId, txId))}
    />
  );
}
