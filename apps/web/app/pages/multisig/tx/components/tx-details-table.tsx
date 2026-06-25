import { Box, Flex, styled } from 'leather-styles/jsx';

import type { MultisigTransaction } from '@leather.io/models';

import { Badge } from '../../components/badge';
import { CopyAddress } from '../../components/copy-address';
import { transactionStatusBadge } from '../../components/transaction-status';
import { chainFromNetwork } from '../../multisig.utils';
import { formatRelativeTime } from '../relative-time';

// Placeholder until recipient / amount / fee are decoded from the proposal
// payload (pending backend-provided decoded fields).
const pendingValue = '—';

interface TxDetailsTableProps {
  transaction: MultisigTransaction;
  proposerLabel: string;
  initiationDate: string;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Flex
      justifyContent="space-between"
      alignItems="center"
      gap="space.04"
      px="space.04"
      py="space.03"
      borderTopWidth="1px"
      borderTopStyle="solid"
      borderTopColor="ink.border-default"
    >
      <styled.span textStyle="caption.01" color="ink.text-subdued" flexShrink={0}>
        {label}
      </styled.span>
      <Box textStyle="label.02" textAlign="right" minWidth={0}>
        {children}
      </Box>
    </Flex>
  );
}

export function TxDetailsTable({
  transaction,
  proposerLabel,
  initiationDate,
}: TxDetailsTableProps) {
  const isBtc = chainFromNetwork(transaction.network) === 'btc';
  const mode = transaction.network.endsWith('mainnet') ? 'mainnet' : 'testnet';
  const status = transactionStatusBadge(transaction.status);
  return (
    <Box
      borderRadius="md"
      borderWidth="1px"
      borderStyle="solid"
      borderColor="ink.border-default"
      overflow="hidden"
    >
      <Flex justifyContent="space-between" alignItems="center" px="space.04" py="space.03">
        <styled.span textStyle="caption.01" color="ink.text-subdued">
          Status
        </styled.span>
        <Badge variant={status.variant} label={status.label} />
      </Flex>
      <Row label="Initiator">{proposerLabel}</Row>
      <Row label="Initiation date">{initiationDate}</Row>
      <Row label="Recipient">{pendingValue}</Row>
      <Row label="Amount">{pendingValue}</Row>
      <Row label="Fee">{pendingValue}</Row>
      <Row label="Broadcast date">
        {transaction.broadcastAt
          ? formatRelativeTime(new Date(transaction.broadcastAt))
          : pendingValue}
      </Row>
      <Row label="Network">{`${isBtc ? 'Bitcoin' : 'Stacks'} ${mode}`}</Row>
      <Row label="Transaction ID">
        {transaction.txId ? <CopyAddress addr={transaction.txId} /> : pendingValue}
      </Row>
      <Row label="Signature type">{isBtc ? 'PSBT (BIP-174)' : 'Standard multisig (SIP-005)'}</Row>
    </Box>
  );
}
