import type { ReactNode } from 'react';

import { SbtcAvatarIcon, StxAvatarIcon, UsdcxAvatarIcon } from '@leather.io/ui';

import { whatMovedLabel } from '../pattern/approval-direction';
import {
  ApprovalHistoryHeader,
  ApprovalHistoryShell,
  ApprovalHistoryStatus,
} from '../pattern/approval-history';
import { ApprovalAssetRow, ApprovalFeeRow, ApprovalRow } from '../pattern/approval-rows';
import { ApprovalSection } from '../pattern/approval-shell';
import { type ActivityListExample, activityListExamples } from './activity-list-fixtures';
import { account1 } from './fixtures';
import type { Scenario } from './scenario';

const historyTitles: Record<string, string> = {
  'activity-row-nft-mint': 'Minted City Coins #184',
  'activity-row-send-many': 'Received STX and USDCx',
  'activity-row-reward': 'Claimed staking rewards',
  'activity-row-swap': 'Swapped STX for sBTC',
  'activity-row-payout': 'Received three assets',
  'activity-row-pending': 'Mint pending',
  'activity-row-failed': 'Mint failed',
};

const assetIcons: Record<string, ReactNode> = {
  sBTC: <SbtcAvatarIcon size="md" />,
  USDCx: <UsdcxAvatarIcon size="md" />,
};

function ActivityListDetails({ example }: { example: ActivityListExample }) {
  return (
    <ApprovalHistoryShell state={example.state}>
      <ApprovalHistoryHeader account={account1} />
      <ApprovalHistoryStatus
        title={historyTitles[example.id] ?? example.label}
        date="21 Oct 2026, 12:00"
        note={example.note}
      />
      <ApprovalSection
        label={example.state === 'pending' ? 'Awaiting confirmation' : whatMovedLabel}
      >
        {example.balances.map(balance => (
          <ApprovalAssetRow
            key={balance.symbol}
            icon={
              balance.symbol === 'STX' ? <StxAvatarIcon size="md" /> : assetIcons[balance.symbol]
            }
            label={balance.direction === 'in' ? 'You received' : 'You spent'}
            amount={`${balance.amount} ${balance.symbol}`}
            fiat={balance.fiat}
            direction={balance.direction}
          />
        ))}
        {example.nft && <ApprovalRow label="NFT minted" value={example.nft} />}
        {example.state === 'pending' && (
          <ApprovalRow label="Balance changes" value="Available after confirmation" />
        )}
        {example.state === 'failed' && (
          <ApprovalFeeRow
            icon={<StxAvatarIcon size="md" />}
            label="Fee paid"
            amount="0.003 STX"
            fiat="< $0.01"
          />
        )}
      </ApprovalSection>
      <ApprovalSection label="Details" divided>
        <ApprovalRow label="Account" value={account1.name} />
        <ApprovalRow label="Network" value="Stacks mainnet" />
        <ApprovalRow label="Function" value={example.functionName} />
        <ApprovalRow label="Contract" value={example.contractName} />
        <ApprovalRow label="Data" value="Illustrative playground fixture" />
      </ApprovalSection>
    </ApprovalHistoryShell>
  );
}

export const activityListScenarios: Scenario[] = activityListExamples.map(example => ({
  id: example.id,
  family: 'contract-call',
  label: example.label,
  method: 'Activity details',
  note: example.note,
  refs: ['#2692'],
  render() {
    return <ActivityListDetails example={example} />;
  },
}));
