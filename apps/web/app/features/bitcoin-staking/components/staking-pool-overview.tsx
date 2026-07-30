import { css } from 'leather-styles/css';
import { Box, Flex, Stack, VStack, styled } from 'leather-styles/jsx';
import type { ColorToken } from 'leather-styles/tokens';
import { BasicHoverCard } from '~/components/basic-hover-card';
import { ProviderIcon } from '~/components/icons/provider-icon';
import { InfoGrid } from '~/components/info-grid/info-grid';
import { ValueDisplayer } from '~/components/value-displayer/default-value-displayer';
import { EM_DASH } from '~/constants/constants';
import { bitcoinStakingContent, bitcoinStakingLabels } from '~/content/bitcoin-staking-content';
import { BitcoinStakingPool } from '~/data/bitcoin-staking-data';
import { LearnMoreLink } from '~/layouts/page/page';
import { MEAN_BURN_BLOCK_SECONDS } from '~/pages/bitcoin-staking/bitcoin-staking.constants';

import { InfoCircleIcon } from '@leather.io/ui';

import type { CycleClockInfo } from '../utils/pox5-cycle-clock';
import { PoolFeeValue } from './pool-fee-value';

const CLOSING_SOON_HOURS = 48;
const SECONDS_PER_HOUR = 3600;

export type StakingCycleStatus =
  | { kind: 'open'; secondsUntilChangesClose: number }
  | { kind: 'paused'; secondsUntilStakingReopens: number };

export function cycleStatusFromClock(clock: CycleClockInfo): StakingCycleStatus {
  if (clock.isInPreparePhase) {
    return { kind: 'paused', secondsUntilStakingReopens: clock.secondsUntilStakingReopens };
  }
  return {
    kind: 'open',
    secondsUntilChangesClose: clock.blocksUntilPreparePhase * MEAN_BURN_BLOCK_SECONDS,
  };
}

interface StakingPoolOverviewProps {
  pool: BitcoinStakingPool;
  nextCycleNumber: number | null;
  daysUntilNextCycle: number | null;
  cycleStatus?: StakingCycleStatus | null;
}

// Hours read better than a rounded-down day count inside the last day, which is
// exactly when the number matters.
function humanizeSeconds(seconds: number) {
  const hours = Math.max(1, Math.ceil(seconds / SECONDS_PER_HOUR));
  if (hours < CLOSING_SOON_HOURS) return `${hours}h`;
  return `${Math.round(hours / 24)} days`;
}

interface InfoTooltipIconProps {
  title: string;
  explanation: string;
  ariaLabel: string;
  size?: number;
  color?: ColorToken;
}

// Kept in the text flow rather than made a flex sibling, so the icon follows the
// last word wherever the label wraps instead of detaching to the right. A flex
// parent would blockify HoverCard.Trigger's anchor and break that.
function InfoTooltipIcon({
  title,
  explanation,
  ariaLabel,
  size = 16,
  color = 'ink.text-subdued',
}: InfoTooltipIconProps) {
  return (
    <BasicHoverCard title={title} content={explanation}>
      <styled.span
        display="inline-flex"
        alignItems="center"
        height="1lh"
        verticalAlign="top"
        ml="space.01"
        cursor="help"
        aria-label={ariaLabel}
      >
        <InfoCircleIcon variant="small" width={size} height={size} color={color} />
      </styled.span>
    </BasicHoverCard>
  );
}

// Inline elements only: ValueDisplayer renders the name inside an h4, which
// takes phrasing content.
function InfoLabel({ label, explanation }: { label: string; explanation: string }) {
  return (
    <>
      {label}
      <InfoTooltipIcon title={label} explanation={explanation} ariaLabel={`About ${label}`} />
    </>
  );
}

function cycleStatusColor(cycleStatus: StakingCycleStatus): ColorToken {
  if (cycleStatus.kind === 'paused') return 'red.action-primary-default';
  if (cycleStatus.secondsUntilChangesClose < CLOSING_SOON_HOURS * SECONDS_PER_HOUR) {
    return 'orange.text-primary';
  }
  return 'ink.text-subdued';
}

function cycleStatusText(cycleStatus: StakingCycleStatus) {
  const { cycleStatus: copy } = bitcoinStakingContent;

  if (cycleStatus.kind === 'paused') {
    const remaining = cycleStatus.secondsUntilStakingReopens;
    if (remaining < SECONDS_PER_HOUR) return copy.pausedWithinHourLabel;
    return `${copy.pausedLabel} ${humanizeSeconds(remaining)}`;
  }

  const remaining = cycleStatus.secondsUntilChangesClose;
  if (remaining < SECONDS_PER_HOUR) return copy.closingWithinHourLabel;
  if (remaining < CLOSING_SOON_HOURS * SECONDS_PER_HOUR) {
    return `${copy.closingSoonLabel} · ${humanizeSeconds(remaining)} left`;
  }
  return `${copy.openLabel} ${humanizeSeconds(remaining)}`;
}

function CycleStatusLine({ cycleStatus }: { cycleStatus: StakingCycleStatus }) {
  const { cycleStatus: copy } = bitcoinStakingContent;

  const isPaused = cycleStatus.kind === 'paused';
  const color = cycleStatusColor(cycleStatus);

  return (
    <styled.span
      textStyle="label.03"
      color={color}
      data-testid={isPaused ? 'cycle-status-paused' : 'cycle-status-open'}
    >
      {cycleStatusText(cycleStatus)}
      <InfoTooltipIcon
        title={copy.explanationTitle}
        explanation={copy.explanation}
        ariaLabel="About staking windows"
        size={13}
        color={color}
      />
    </styled.span>
  );
}

export function StakingPoolOverview({
  pool,
  nextCycleNumber,
  daysUntilNextCycle,
  cycleStatus,
}: StakingPoolOverviewProps) {
  return (
    <InfoGrid
      width="100%"
      gridTemplateColumns={['repeat(2, 1fr)', 'repeat(2, 1fr)', 'repeat(3, 1fr)']}
      gridTemplateRows={['auto', 'auto', 'auto', 'auto', 'auto']}
      height="fit-content"
      className={css({ '& > *:not(:first-child)': { minHeight: ['120px', null, 'unset'] } })}
    >
      <InfoGrid.Cell gridColumn={['span 2', 'span 2', 'auto']} gridRow={['1', '1', 'span 2']}>
        <VStack
          gap="space.05"
          alignItems="left"
          justifyContent="space-between"
          height="100%"
          p="space.05"
        >
          <Flex alignItems="center" gap="space.02">
            <Box flexShrink={0}>
              <ProviderIcon providerId={pool.providerId} size="32" />
            </Box>
            <styled.h4 textStyle="label.01">{pool.name}</styled.h4>
          </Flex>
          <styled.div textStyle="caption.01">
            {pool.description}
            <LearnMoreLink destination={pool.url} />
          </styled.div>
        </VStack>
      </InfoGrid.Cell>
      <InfoGrid.Cell gridColumn={['1', '1', '2']} gridRow={['2', '2', '1']}>
        <ValueDisplayer
          name={
            <InfoLabel
              label={bitcoinStakingLabels.rewardsToken}
              explanation={bitcoinStakingContent.poolOverviewInfo.rewardsToken}
            />
          }
          value={
            <>
              sBTC
              <Box textStyle="label.03">{bitcoinStakingContent.heroYieldLabel}</Box>
            </>
          }
        />
      </InfoGrid.Cell>
      <InfoGrid.Cell gridColumn={['2', '2', '3']} gridRow={['2', '2', '1']}>
        <ValueDisplayer
          name={
            <InfoLabel
              label={bitcoinStakingLabels.fee}
              explanation={bitcoinStakingContent.poolOverviewInfo.fee}
            />
          }
          value={<PoolFeeValue pool={pool} />}
        />
      </InfoGrid.Cell>
      <InfoGrid.Cell
        gridColumn={['1 / span 2', '1 / span 2', '2 / span 2']}
        gridRow={['3', '3', '2']}
      >
        <ValueDisplayer
          name={
            <InfoLabel
              label="Next cycle"
              explanation={bitcoinStakingContent.poolOverviewInfo.nextCycle}
            />
          }
          value={
            daysUntilNextCycle === null ? (
              EM_DASH
            ) : (
              <Stack gap="space.01">
                <styled.span>
                  {daysUntilNextCycle} days
                  {nextCycleNumber !== null && (
                    <styled.span textStyle="label.03" color="ink.text-subdued">
                      {' '}
                      (Cycle {nextCycleNumber})
                    </styled.span>
                  )}
                </styled.span>
                {cycleStatus && <CycleStatusLine cycleStatus={cycleStatus} />}
              </Stack>
            )
          }
        />
      </InfoGrid.Cell>
    </InfoGrid>
  );
}
