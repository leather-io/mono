import { useNavigate } from 'react-router';

import { Box, Flex, styled } from 'leather-styles/jsx';
import { useVaultAccountTransactions } from '~/features/multisig/vaults/use-vault-transactions';

import type { AuthNetworkId } from '@leather.io/models';

import { TransactionRow } from '../../components/transaction-row';
import { collectingSignaturesGradient } from '../../multisig-tokens';
import { multisigPaths } from '../../multisig.constants';

interface AccountTransactionsProps {
  network: AuthNetworkId;
  vaultId: string | undefined;
  accountId: string | undefined;
}

export function AccountTransactions({ network, vaultId, accountId }: AccountTransactionsProps) {
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
    <Box
      borderRadius="md"
      borderWidth="1px"
      borderStyle="solid"
      borderColor="ink.border-default"
      overflow="hidden"
    >
      {items.map((transaction, index) => (
        <styled.button
          key={transaction.id}
          type="button"
          onClick={() => vaultId && void navigate(multisigPaths.tx(vaultId, transaction.id))}
          display="block"
          width="100%"
          textAlign="left"
          cursor="pointer"
          bg="transparent"
          bgImage={transaction.status === 'pending' ? collectingSignaturesGradient : undefined}
          p="space.04"
          borderTopWidth={index === 0 ? '0' : '1px'}
          borderTopStyle="solid"
          borderTopColor="ink.border-default"
          _hover={{ bg: 'ink.component-background-hover' }}
        >
          <TransactionRow transaction={transaction} />
        </styled.button>
      ))}
    </Box>
  );
}
