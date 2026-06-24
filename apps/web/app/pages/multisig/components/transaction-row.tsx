import { Box, Flex, styled } from 'leather-styles/jsx';

import type { MultisigTransactionSummary } from '@leather.io/models';
import { ArrowTopRightIcon } from '@leather.io/ui';

import { chainFromNetwork } from '../multisig.utils';
import { Badge } from './badge';
import { transactionStatusBadge } from './transaction-status';
import { VaultListItem } from './vault-list-item';

interface TransactionRowProps {
  transaction: MultisigTransactionSummary;
}

export function TransactionRow({ transaction }: TransactionRowProps) {
  const asset = chainFromNetwork(transaction.network) === 'btc' ? 'BTC' : 'STX';
  const status = transactionStatusBadge(transaction.status);
  return (
    <VaultListItem
      tightLeading
      leading={
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          width="40px"
          height="40px"
          borderRadius="round"
          bg="ink.background-secondary"
        >
          <ArrowTopRightIcon variant="small" color="ink.text-subdued" />
        </Box>
      }
      title={
        <Flex alignItems="center" gap="space.02" pl="space.02">
          <styled.span textStyle="label.02">Send {asset}</styled.span>
          <Badge variant={status.variant} label={status.label} />
        </Flex>
      }
    />
  );
}
