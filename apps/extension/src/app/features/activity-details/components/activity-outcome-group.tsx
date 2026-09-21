import { Flex, HStack, Stack, styled } from 'leather-styles/jsx';

import { ArrowDownIcon, BlockchainActivityIndicatorIcon } from '@leather.io/ui';
import { getAssetId, serializeAssetId } from '@leather.io/utils';

import type {
  ActivityCounterparty,
  ActivityOutcomeGroup,
  ActivityStatusTone,
} from '../activity-details-summary';
import { ActivityOutcomeRow, outcomeAvatarSize } from './activity-outcome-row';

const headingIndicatorSize = 16;

function resolveExchangePair(outcomes: ActivityOutcomeGroup[]) {
  if (outcomes.length !== 2) return undefined;
  const [sent, received] = outcomes;
  if (sent?.changes.length !== 1 || received?.changes.length !== 1) return undefined;
  const [from] = sent.changes;
  const [to] = received.changes;
  if (!from || !to) return undefined;
  return { from, to };
}

interface ActivityOutcomeGroupsProps {
  outcomes: ActivityOutcomeGroup[];
  tone: ActivityStatusTone;
  counterparty?: ActivityCounterparty;
}

export function ActivityOutcomeGroups({
  outcomes,
  tone,
  counterparty,
}: ActivityOutcomeGroupsProps) {
  const pair = resolveExchangePair(outcomes);

  if (pair) {
    return (
      <Stack gap="space.03" bg="ink.background-primary" px="space.05" py="space.04">
        <ActivityOutcomeRow change={pair.from} tone={tone} counterparty={counterparty} />
        <Flex width={`${outcomeAvatarSize}px`} justifyContent="center">
          <ArrowDownIcon variant="small" color="ink.text-subdued" />
        </Flex>
        <ActivityOutcomeRow change={pair.to} tone={tone} counterparty={counterparty} />
      </Stack>
    );
  }

  return (
    <Stack gap="space.06" bg="ink.background-primary" px="space.05" py="space.04">
      {outcomes.map(group => (
        <Stack key={group.direction} gap="space.03">
          <HStack gap="space.02" alignItems="center">
            <BlockchainActivityIndicatorIcon
              indicator={tone === 'error' ? 'failed' : group.direction}
              size={headingIndicatorSize}
            />
            <styled.span textStyle="label.02">
              {group.direction === 'received' ? 'Received' : 'Sent'}
            </styled.span>
          </HStack>
          {group.changes.map(change => (
            <ActivityOutcomeRow
              key={serializeAssetId(getAssetId(change.asset))}
              change={change}
              tone={tone}
              counterparty={counterparty}
            />
          ))}
        </Stack>
      ))}
    </Stack>
  );
}
