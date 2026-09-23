import { type ReactNode, useState } from 'react';

import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import type { OnChainActivityStatus } from '@leather.io/models';
import { Avatar } from '@leather.io/ui';

import { DetailsPillButton } from '@app/components/details/details-pill-button';
import { Divider } from '@app/components/layout/divider';

import { ActivityDetailsHeader } from '../activity-details-header';
import { ActivityDetailsOverview } from '../activity-details-overview';
import { buildActivityDetailsSummary } from '../activity-details-summary';
import { ActivityDetailsTable } from '../activity-details-table';
import { ActivityAccountCluster } from '../components/activity-account-cluster';
import { ActivityContractCluster } from '../components/activity-contract-cluster';
import { ActivityExplorerLink } from '../components/activity-explorer-link';
import { ActivityRequester } from '../components/activity-requester';
import {
  type ActivityDetailsScenario,
  activityDetailsScenarios,
  createScenarioItem,
} from './activity-details-fixtures';

const previewWidth = '390px';
const previewHeight = '600px';
const accountAvatarSize = 40;

const statuses: OnChainActivityStatus[] = ['pending', 'success', 'failed'];

const statusLabels: Record<OnChainActivityStatus, string> = {
  pending: 'Pending',
  success: 'Confirmed',
  failed: 'Failed',
};

type PlaygroundGrouping = 'transaction' | 'status';

function PlaygroundAccount() {
  return (
    <ActivityAccountCluster
      avatar={
        <Avatar size="md" width={`${accountAvatarSize}px`} height={`${accountAvatarSize}px`} />
      }
      name="carey.btc"
      address="SP000000000000000000002Q6VF78ANYWAY0PLAY"
    />
  );
}

interface ScenarioActionsProps {
  status: OnChainActivityStatus;
}

function ScenarioActions({ status }: ScenarioActionsProps) {
  if (status !== 'pending') return null;
  return (
    <Flex gap="space.02" alignItems="center" pt="space.01" width="100%">
      <DetailsPillButton label="Increase fee" onClick={() => undefined} />
      <DetailsPillButton label="Cancel" onClick={() => undefined} />
    </Flex>
  );
}

interface OverviewPreviewProps {
  scenario: ActivityDetailsScenario;
  status: OnChainActivityStatus;
  caption: string;
}

function OverviewPreview({ scenario, status, caption }: OverviewPreviewProps) {
  const item = createScenarioItem(scenario.activity, status);
  const summary = buildActivityDetailsSummary(item, scenario.overlay);
  const { contract } = scenario.activity;
  const chainLabel = scenario.activity.chain === 'bitcoin' ? 'Bitcoin' : 'Stacks';
  return (
    <Stack gap="space.00" width={previewWidth} flexShrink={0}>
      <styled.span textStyle="caption.01" color="ink.text-subdued" pb="space.02">
        {caption}
      </styled.span>
      <Box
        border="default"
        borderRadius="md"
        overflow="hidden"
        bg="ink.background-primary"
        height={previewHeight}
        overflowY="auto"
      >
        <Stack gap="space.00" minHeight="100%">
          <ActivityDetailsHeader onBack={() => undefined} px="space.03" />
          <ActivityDetailsOverview
            summary={summary}
            requester={
              scenario.requesterOrigin ? (
                <ActivityRequester origin={scenario.requesterOrigin} />
              ) : undefined
            }
            note={
              status === 'pending'
                ? 'Your transaction is taking longer than usual. Increasing the fee can speed up confirmation.'
                : undefined
            }
            actions={<ScenarioActions status={status} />}
            contract={
              contract?.type === 'deploy' ? (
                <ActivityContractCluster contractId={contract.contractId} />
              ) : undefined
            }
            account={<PlaygroundAccount />}
          />
          <Divider />
          <ActivityDetailsTable
            item={item}
            networkLabel={`${chainLabel} mainnet`}
            {...(contract ? { contractHref: '#' } : {})}
          />
          <Box position="sticky" bottom={0} mt="auto">
            <ActivityExplorerLink onOpen={() => undefined} />
          </Box>
        </Stack>
      </Box>
    </Stack>
  );
}

interface PlaygroundGroupProps {
  id: string;
  title: string;
  children: ReactNode;
}

function PlaygroundGroup({ id, title, children }: PlaygroundGroupProps) {
  return (
    <Stack gap="space.04" width="100%" data-testid={`playground-group-${id}`}>
      <styled.h2 textStyle="heading.05">{title}</styled.h2>
      <Flex gap="space.04" flexWrap="wrap" alignItems="flex-start">
        {children}
      </Flex>
    </Stack>
  );
}

interface GroupingToggleProps {
  grouping: PlaygroundGrouping;
  onChange(grouping: PlaygroundGrouping): void;
}

function GroupingToggle({ grouping, onChange }: GroupingToggleProps) {
  return (
    <Flex gap="space.02" maxWidth="360px">
      <DetailsPillButton
        label="Group by transaction"
        onClick={() => onChange('transaction')}
        disabled={grouping === 'transaction'}
      />
      <DetailsPillButton
        label="Group by status"
        onClick={() => onChange('status')}
        disabled={grouping === 'status'}
      />
    </Flex>
  );
}

export function ActivityDetailsPlayground() {
  const [grouping, setGrouping] = useState<PlaygroundGrouping>('transaction');

  return (
    <Box bg="ink.background-secondary" width="100%">
      <Stack gap="space.06" px="space.05" py="space.05" maxWidth="1400px" margin="0 auto">
        <Stack gap="space.02">
          <styled.h1 textStyle="heading.03">Transaction details</styled.h1>
          <styled.p textStyle="label.02" color="ink.text-subdued" maxWidth="760px">
            The activity details screen across transaction shapes and states: status headline,
            status strip, pending actions, outcomes grouped by direction, the account the
            transaction was made with, the transaction table and the explorer link. The requester
            line shows on the two dapp-originated fixtures; the real screen only has that data once
            we record it at broadcast time. Every preview is a real action popup frame, 390 by 600,
            so each one scrolls exactly as it does in the extension.
          </styled.p>
        </Stack>

        <GroupingToggle grouping={grouping} onChange={setGrouping} />

        {grouping === 'transaction'
          ? activityDetailsScenarios.map(scenario => (
              <PlaygroundGroup key={scenario.id} id={scenario.id} title={scenario.label}>
                {statuses.map(status => (
                  <OverviewPreview
                    key={status}
                    scenario={scenario}
                    status={status}
                    caption={statusLabels[status]}
                  />
                ))}
              </PlaygroundGroup>
            ))
          : statuses.map(status => (
              <PlaygroundGroup key={status} id={status} title={statusLabels[status]}>
                {activityDetailsScenarios.map(scenario => (
                  <OverviewPreview
                    key={scenario.id}
                    scenario={scenario}
                    status={status}
                    caption={scenario.label}
                  />
                ))}
              </PlaygroundGroup>
            ))}
      </Stack>
    </Box>
  );
}
