import { Box, Flex, styled } from 'leather-styles/jsx';
import { ExternalLink } from '~/components/external-link';
import { formatCurrency } from '~/utils/currency-formatter';

import type { Money, MultisigTransaction, MultisigTransactionStatus } from '@leather.io/models';

import { Badge } from '../../components/badge';
import { CopyAddress } from '../../components/copy-address';
import { transactionStatusBadge } from '../../components/transaction-status';
import { collectingSignaturesGradient } from '../../multisig-tokens';
import { chainFromNetwork, transactionExplorerUrl } from '../../multisig.utils';
import { formatRelativeTime } from '../relative-time';

const pendingValue = '—';

interface TxDetailsTableProps {
  transaction: MultisigTransaction;
  status: MultisigTransactionStatus;
  proposerLabel: string;
  initiationDate: string;
  recipient?: string;
  amount?: Money;
  amountFiat?: Money;
  fee?: Money;
  feeFiat?: Money;
}

function moneyWithFiat(money: Money, fiat: Money | undefined): string {
  return fiat ? `${formatCurrency(money)} ≈ ${formatCurrency(fiat)}` : formatCurrency(money);
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
  status,
  proposerLabel,
  initiationDate,
  recipient,
  amount,
  amountFiat,
  fee,
  feeFiat,
}: TxDetailsTableProps) {
  const isBtc = chainFromNetwork(transaction.network) === 'btc';
  const mode = transaction.network.endsWith('mainnet') ? 'mainnet' : 'testnet';
  const statusDisplay = transactionStatusBadge(status);
  const isCollecting = status === 'pending';
  return (
    <Box
      borderRadius="md"
      borderWidth="1px"
      borderStyle="solid"
      borderColor="ink.border-default"
      overflow="hidden"
    >
      <Flex
        justifyContent="space-between"
        alignItems="center"
        px="space.04"
        py="space.03"
        bgImage={isCollecting ? collectingSignaturesGradient : undefined}
      >
        <styled.span
          textStyle="caption.01"
          color={isCollecting ? 'orange.text-primary' : 'ink.text-subdued'}
        >
          Status
        </styled.span>
        <Badge variant={statusDisplay.variant} label={statusDisplay.label} />
      </Flex>
      <Row label="Initiator">{proposerLabel}</Row>
      <Row label="Initiation date">{initiationDate}</Row>
      <Row label="Recipient">{recipient ? <CopyAddress addr={recipient} /> : pendingValue}</Row>
      <Row label="Amount">{amount ? moneyWithFiat(amount, amountFiat) : pendingValue}</Row>
      <Row label="Fee">{fee ? moneyWithFiat(fee, feeFiat) : pendingValue}</Row>
      <Row label="Broadcast date">
        {transaction.broadcastAt
          ? formatRelativeTime(new Date(transaction.broadcastAt))
          : pendingValue}
      </Row>
      <Row label="Network">{`${isBtc ? 'Bitcoin' : 'Stacks'} ${mode}`}</Row>
      <Row label="Transaction ID">
        {transaction.txId ? <CopyAddress addr={transaction.txId} /> : pendingValue}
      </Row>
      <Row label="Explorer">
        {transaction.txId ? (
          <ExternalLink
            href={transactionExplorerUrl(transaction.network, transaction.txId)}
            withIcon
          >
            View transaction
          </ExternalLink>
        ) : (
          pendingValue
        )}
      </Row>
      <Row label="Signature type">{isBtc ? 'PSBT (BIP-174)' : 'Standard multisig (SIP-005)'}</Row>
    </Box>
  );
}
