import type { ReactNode } from 'react';

import { Flex } from 'leather-styles/jsx';
import { CopyAddress } from '~/components/copy-address';
import { ExternalLink } from '~/components/external-link';
import { getActivityActionLine } from '~/features/multisig/activity/activity-action-line';

import {
  type BlockchainActivityView,
  getBitcoinExplorerLink,
  getStacksExplorerLink,
} from '@leather.io/features';
import type {
  BlockchainActivity,
  CryptoAssetChain,
  Money,
  MultisigTransactionStatus,
  NetworkConfiguration,
  OnChainActivityStatus,
} from '@leather.io/models';
import { BlockchainActivityAvatarIcon, BlockchainActivityIndicatorIcon } from '@leather.io/ui';
import { truncateMiddle } from '@leather.io/utils';

import { formatRelativeTime } from '../tx/relative-time';
import { type BadgeVariant } from './badge';
import {
  DetailLocationRow,
  DetailRow,
  DetailStatusRow,
  DetailTable,
  balanceChangeValue,
  moneyWithFiat,
  pendingValue,
} from './detail-table';
import { MultisigHero } from './multisig-hero';
import { SectionLabel } from './section-label';
import { transactionStatusBadge } from './transaction-status';

const onChainStatusDisplay: Record<
  OnChainActivityStatus,
  { label: string; variant: BadgeVariant }
> = {
  success: { label: 'Confirmed', variant: 'success' },
  pending: { label: 'Pending', variant: 'pending' },
  failed: { label: 'Failed', variant: 'error' },
};

function explorerLink(
  chain: CryptoAssetChain,
  txid: string,
  network: NetworkConfiguration
): string | null {
  if (chain === 'bitcoin') {
    return getBitcoinExplorerLink({
      networkPreference: network.chain.bitcoin.bitcoinNetwork,
      id: txid,
      type: 'tx',
    });
  }
  return getStacksExplorerLink({
    mode: network.chain.bitcoin.mode,
    type: 'txid',
    value: txid,
  });
}

interface VaultActivityDetailItem {
  view: BlockchainActivityView;
  activity?: BlockchainActivity;
}

interface VaultActivityDetailProposal {
  status: MultisigTransactionStatus;
  txId: string | null;
  proposerLabel: string;
  initiationDate: string;
  broadcastDate?: string;
  memo?: string;
}

interface VaultActivityDetailProps {
  item: VaultActivityDetailItem;
  themeId: number;
  network: NetworkConfiguration;
  vaultLink?: { name: string; to: string };
  accountLink?: { name: string; to: string };
  feeFiat?: Money;
  caption?: ReactNode;
  proposal?: VaultActivityDetailProposal;
}

export function VaultActivityDetail({
  item,
  themeId,
  network,
  vaultLink,
  accountLink,
  feeFiat,
  caption,
  proposal,
}: VaultActivityDetailProps) {
  const { view, activity } = item;
  const actionLine = getActivityActionLine(view);
  const subtitle = actionLine ? actionLine.viaProtocol : view.subtitle;
  const status = proposal
    ? transactionStatusBadge(proposal.status)
    : onChainStatusDisplay[view.status];
  const statusHighlight = proposal
    ? proposal.status === 'pending' || proposal.status === 'queued'
    : view.status === 'pending';
  const txid = proposal ? proposal.txId : view.txid;
  const link = txid ? explorerLink(view.chain, txid, network) : null;
  const mode = network.chain.bitcoin.mode;
  const balanceChanges = activity?.balanceChanges ?? [];
  const counterpartyLabel = activity?.initiatedByUser ? 'To' : 'From';
  const relativeTime = formatRelativeTime(new Date(view.timestamp * 1000));

  return (
    <>
      <MultisigHero
        variant="balance"
        themeId={themeId}
        media={
          <BlockchainActivityAvatarIcon
            size={48}
            avatar={view.avatar}
            indicator={<BlockchainActivityIndicatorIcon indicator={view.indicator} size={16} />}
          />
        }
        primary={actionLine?.actionTitle || view.title || '—'}
        secondary={
          <Flex direction="column" gap="space.01">
            {subtitle ? <span>{subtitle}</span> : null}
            {caption ?? <span>{relativeTime}</span>}
          </Flex>
        }
      />

      <SectionLabel>Transaction details</SectionLabel>
      <DetailTable>
        <DetailStatusRow
          label={status.label}
          variant={status.variant}
          highlight={statusHighlight}
        />
        <DetailLocationRow vault={vaultLink} account={accountLink} />
        {proposal ? (
          <>
            <DetailRow label="Initiator">{proposal.proposerLabel}</DetailRow>
            <DetailRow label="Initiation date">{proposal.initiationDate}</DetailRow>
          </>
        ) : null}
        {activity?.contract ? (
          <DetailRow label="Contract">
            <ExternalLink
              href={getStacksExplorerLink({
                mode,
                type: 'address',
                value: activity.contract.contractId,
              })}
              withIcon
            >
              {truncateMiddle(activity.contract.contractId)}
            </ExternalLink>
          </DetailRow>
        ) : null}
        {view.protocolName ? <DetailRow label="Protocol">{view.protocolName}</DetailRow> : null}
        {activity?.contract?.type === 'call' ? (
          <DetailRow label="Function">{activity.contract.functionName}</DetailRow>
        ) : null}
        {balanceChanges.length === 1 ? (
          <DetailRow label="Amount">{balanceChangeValue(balanceChanges[0])}</DetailRow>
        ) : (
          balanceChanges.map(change => (
            <DetailRow
              key={`${change.direction}-${change.amount.crypto.symbol}`}
              label={change.direction === 'sent' ? 'Sent' : 'Received'}
            >
              {balanceChangeValue(change)}
            </DetailRow>
          ))
        )}
        {activity?.counterparty ? (
          <DetailRow label={counterpartyLabel}>
            <CopyAddress addr={activity.counterparty} emphasis />
          </DetailRow>
        ) : null}
        {proposal?.memo && proposal.memo.trim() ? (
          <DetailRow label="Memo">{proposal.memo}</DetailRow>
        ) : null}
        {activity?.fee ? (
          <DetailRow label="Network fee">{moneyWithFiat(activity.fee, feeFiat)}</DetailRow>
        ) : null}
        {activity && view.chain === 'stacks' ? (
          <DetailRow label="Nonce">{activity.nonce ?? pendingValue}</DetailRow>
        ) : null}
        {proposal?.broadcastDate ? (
          <DetailRow label="Broadcast date">{proposal.broadcastDate}</DetailRow>
        ) : null}
        {!proposal ? <DetailRow label="Date">{relativeTime}</DetailRow> : null}
        <DetailRow label="Network">{`${view.chain === 'bitcoin' ? 'Bitcoin' : 'Stacks'} ${mode}`}</DetailRow>
        {txid ? (
          <DetailRow label="Transaction ID">
            <CopyAddress addr={txid} emphasis />
          </DetailRow>
        ) : null}
        {txid ? (
          <DetailRow label="Inputs and Outputs">
            {link ? (
              <ExternalLink href={link} withIcon>
                Explorer
              </ExternalLink>
            ) : (
              pendingValue
            )}
          </DetailRow>
        ) : null}
        {proposal ? (
          <DetailRow label="Signature type">
            {view.chain === 'bitcoin' ? 'PSBT (BIP-174)' : 'Standard multisig (SIP-005)'}
          </DetailRow>
        ) : null}
      </DetailTable>
    </>
  );
}
