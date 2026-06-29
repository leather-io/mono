import { useNavigate } from 'react-router';

import { Box, Flex, styled } from 'leather-styles/jsx';
import { useVaultTransactions } from '~/features/multisig/vaults/use-vault-transactions';

import type { AuthNetworkId, VaultAccountSummary } from '@leather.io/models';

import { TransactionList } from '../../components/transaction-list';
import { multisigPaths } from '../../multisig.constants';

interface VaultTransactionsProps {
  network: AuthNetworkId;
  vaultId: string;
  accounts: VaultAccountSummary[] | undefined;
}

export function VaultTransactions({ network, vaultId, accounts }: VaultTransactionsProps) {
  const navigate = useNavigate();
  const { transactions, isLoading } = useVaultTransactions(network, accounts);

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

  if (transactions.length === 0) {
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

  const thresholdByAccount = new Map(
    (accounts ?? []).map(account => [account.id, account.threshold])
  );

  return (
    <TransactionList
      scale="compact"
      items={transactions.map(transaction => ({
        transaction,
        vaultId,
        threshold: thresholdByAccount.get(transaction.vaultAccountId),
      }))}
      onSelect={(targetVaultId, txId) => void navigate(multisigPaths.tx(targetVaultId, txId))}
    />
  );
}
