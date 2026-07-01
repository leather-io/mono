import { useNavigate } from 'react-router';

import { Box, Flex, styled } from 'leather-styles/jsx';
import { useVaultAccountTransactions } from '~/features/multisig/vaults/use-vault-transactions';

import type { AuthNetworkId } from '@leather.io/models';

import { TransactionList } from '../../components/transaction-list';
import { multisigPaths } from '../../multisig.constants';

interface AccountTransactionsProps {
  network: AuthNetworkId;
  vaultId: string | undefined;
  accountId: string | undefined;
  threshold: number;
}

export function AccountTransactions({
  network,
  vaultId,
  accountId,
  threshold,
}: AccountTransactionsProps) {
  const navigate = useNavigate();
  const transactions = useVaultAccountTransactions(network, accountId);
  const items = transactions.data?.data ?? [];

  if (transactions.isLoading) {
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
    <TransactionList
      items={items.map(transaction => ({ transaction, vaultId: vaultId ?? '', threshold }))}
      onSelect={(targetVaultId, txId) =>
        targetVaultId && void navigate(multisigPaths.tx(targetVaultId, txId))
      }
    />
  );
}
