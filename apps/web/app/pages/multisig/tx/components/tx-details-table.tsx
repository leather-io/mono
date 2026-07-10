import { ExternalLink } from '~/components/external-link';

import { getStacksExplorerLink } from '@leather.io/features';
import type {
  BlockchainActivityBalanceChange,
  Money,
  MultisigTransaction,
  MultisigTransactionStatus,
} from '@leather.io/models';
import { truncateMiddle } from '@leather.io/utils';

import { CopyAddress } from '../../components/copy-address';
import {
  DetailAddressRow,
  DetailLocationRow,
  DetailRow,
  DetailStatusRow,
  DetailTable,
  balanceChangeValue,
  moneyWithFiat,
  pendingValue,
} from '../../components/detail-table';
import { transactionStatusBadge } from '../../components/transaction-status';
import { chainFromNetwork, transactionExplorerUrl } from '../../multisig.utils';
import { formatRelativeTime } from '../relative-time';

interface TxDetailsTableProps {
  transaction: MultisigTransaction;
  status: MultisigTransactionStatus;
  vaultLink?: { name: string; to: string };
  accountLink?: { name: string; to: string };
  proposerLabel: string;
  initiationDate: string;
  recipient?: string;
  amount?: Money;
  amountFiat?: Money;
  fee?: Money;
  feeFiat?: Money;
  contractId?: string;
  functionName?: string;
  protocolName?: string;
  balanceChanges?: BlockchainActivityBalanceChange[];
  memo?: string;
}

export function TxDetailsTable({
  transaction,
  status,
  vaultLink,
  accountLink,
  proposerLabel,
  initiationDate,
  recipient,
  amount,
  amountFiat,
  fee,
  feeFiat,
  contractId,
  functionName,
  protocolName,
  balanceChanges,
  memo,
}: TxDetailsTableProps) {
  const isBtc = chainFromNetwork(transaction.network) === 'btc';
  const mode = transaction.network.endsWith('mainnet') ? 'mainnet' : 'testnet';
  const statusDisplay = transactionStatusBadge(status);
  const isCollecting = status === 'pending';
  return (
    <DetailTable>
      <DetailStatusRow
        label={statusDisplay.label}
        variant={statusDisplay.variant}
        highlight={isCollecting}
      />
      <DetailLocationRow vault={vaultLink} account={accountLink} />
      <DetailRow label="Initiator">{proposerLabel}</DetailRow>
      <DetailRow label="Initiation date">{initiationDate}</DetailRow>
      {contractId ? (
        <>
          <DetailRow label="Contract">
            <ExternalLink
              href={getStacksExplorerLink({ mode, type: 'address', value: contractId })}
              withIcon
            >
              {truncateMiddle(contractId)}
            </ExternalLink>
          </DetailRow>
          {protocolName ? <DetailRow label="Protocol">{protocolName}</DetailRow> : null}
          {functionName ? <DetailRow label="Function">{functionName}</DetailRow> : null}
          {(balanceChanges ?? []).map(change => (
            <DetailRow
              key={`${change.direction}-${change.amount.crypto.symbol}`}
              label={change.direction === 'sent' ? 'Sent' : 'Received'}
            >
              {balanceChangeValue(change)}
            </DetailRow>
          ))}
        </>
      ) : (
        <>
          <DetailAddressRow label="Recipient">
            {recipient ? <CopyAddress addr={recipient} grouped /> : pendingValue}
          </DetailAddressRow>
          <DetailRow label="Amount">
            {amount ? moneyWithFiat(amount, amountFiat) : pendingValue}
          </DetailRow>
          {memo && memo.trim() ? <DetailRow label="Memo">{memo}</DetailRow> : null}
        </>
      )}
      <DetailRow label="Fee">{fee ? moneyWithFiat(fee, feeFiat) : pendingValue}</DetailRow>
      {transaction.broadcastAt ? (
        <DetailRow label="Broadcast date">
          {formatRelativeTime(new Date(transaction.broadcastAt))}
        </DetailRow>
      ) : null}
      <DetailRow label="Network">{`${isBtc ? 'Bitcoin' : 'Stacks'} ${mode}`}</DetailRow>
      {transaction.txId ? (
        <DetailRow label="Transaction ID">
          <CopyAddress addr={transaction.txId} emphasis />
        </DetailRow>
      ) : null}
      {transaction.txId ? (
        <DetailRow label="Inputs and Outputs">
          <ExternalLink
            href={transactionExplorerUrl(transaction.network, transaction.txId)}
            withIcon
          >
            Explorer
          </ExternalLink>
        </DetailRow>
      ) : null}
      <DetailRow label="Signature type">
        {isBtc ? 'PSBT (BIP-174)' : 'Standard multisig (SIP-005)'}
      </DetailRow>
    </DetailTable>
  );
}
