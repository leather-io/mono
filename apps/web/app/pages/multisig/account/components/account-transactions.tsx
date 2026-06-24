import { Box, Flex, styled } from 'leather-styles/jsx';
import { useVaultAccountTransactions } from '~/features/multisig/vaults/use-vault-transactions';

import type { AuthNetworkId } from '@leather.io/models';

import { TransactionRow } from '../../components/transaction-row';

interface AccountTransactionsProps {
  network: AuthNetworkId;
  accountId: string | undefined;
}

export function AccountTransactions({ network, accountId }: AccountTransactionsProps) {
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
    <Box
      borderRadius="md"
      borderWidth="1px"
      borderStyle="solid"
      borderColor="ink.border-default"
      overflow="hidden"
    >
      {items.map((transaction, index) => (
        <Box
          key={transaction.id}
          p="space.04"
          borderTopWidth={index === 0 ? '0' : '1px'}
          borderTopStyle="solid"
          borderTopColor="ink.border-default"
        >
          <TransactionRow transaction={transaction} />
        </Box>
      ))}
    </Box>
  );
}
