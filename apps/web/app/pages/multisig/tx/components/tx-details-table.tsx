import { Box, Flex, styled } from 'leather-styles/jsx';
import { ExternalLink } from '~/components/external-link';
import { formatCurrency } from '~/utils/currency-formatter';

import type { Money, MultisigTransaction, MultisigTransactionStatus } from '@leather.io/models';

import type { BadgeVariant } from '../../components/badge';
import { CopyAddress } from '../../components/copy-address';
import { transactionStatusBadge } from '../../components/transaction-status';
import { collectingSignaturesGradient } from '../../multisig-tokens';
import { chainFromNetwork, transactionExplorerUrl } from '../../multisig.utils';
import { formatRelativeTime } from '../relative-time';

const pendingValue = '—';

// The Status row shows a plain coloured label with a leading dot (not a full
// chip), so each status maps to a dot colour and a readable text colour.
const statusTone: Record<BadgeVariant, { dot: string; text: string }> = {
  pending: { dot: 'orange.action-primary-default', text: 'orange.text-primary' },
  info: { dot: 'blue.action-primary-default', text: 'blue.action-primary-default' },
  success: { dot: 'green.action-primary-default', text: 'green.action-primary-default' },
  error: { dot: 'red.action-primary-default', text: 'red.action-primary-default' },
  warning: { dot: 'yellow.action-primary-default', text: 'yellow.action-primary-default' },
  default: { dot: 'ink.text-subdued', text: 'ink.text-subdued' },
};

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
        <Flex alignItems="center" gap="space.02">
          <styled.span
            aria-hidden
            width="8px"
            height="8px"
            borderRadius="round"
            flexShrink={0}
            bg={statusTone[statusDisplay.variant].dot}
          />
          <styled.span textStyle="label.02" color={statusTone[statusDisplay.variant].text}>
            {statusDisplay.label}
          </styled.span>
        </Flex>
      </Flex>
      <Row label="Initiator">{proposerLabel}</Row>
      <Row label="Initiation date">{initiationDate}</Row>
      <Box
        px="space.04"
        py="space.03"
        borderTopWidth="1px"
        borderTopStyle="solid"
        borderTopColor="ink.border-default"
      >
        <styled.span textStyle="caption.01" color="ink.text-subdued">
          Recipient
        </styled.span>
        <Box mt="space.01" textStyle="label.02">
          {recipient ? <CopyAddress addr={recipient} grouped /> : pendingValue}
        </Box>
      </Box>
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
