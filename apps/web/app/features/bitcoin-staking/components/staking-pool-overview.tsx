import { css } from 'leather-styles/css';
import { Box, Flex, Stack, VStack, styled } from 'leather-styles/jsx';
import type { ColorToken } from 'leather-styles/tokens';
import { InfoGrid } from '~/components/info-grid/info-grid';
import { InfoTooltipIcon } from '~/components/info-tooltip-icon';
import { ValueDisplayer } from '~/components/value-displayer/default-value-displayer';
import { EM_DASH } from '~/constants/constants';
import { bitcoinStakingContent, bitcoinStakingLabels } from '~/content/bitcoin-staking-content';
import { BitcoinStakingPool } from '~/data/bitcoin-staking-data';
import { LearnMoreLink } from '~/layouts/page/page';
import { MEAN_BURN_BLOCK_SECONDS } from '~/pages/bitcoin-staking/bitcoin-staking.constants';
import { StakingPoolAvatar } from '~/pages/bitcoin-staking/components/staking-pool-avatar';
import { toHumanReadableMicroStx } from '~/utils/unit-convert';

import type { CycleClockInfo } from '../utils/pox5-cycle-clock';
import { PoolFeeValue } from './pool-fee-value';

const CLOSING_SOON_HOURS = 48;
const SECONDS_PER_HOUR = 3600;

type StakingCycleStatus =
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
  signerManagerContractId?: string;
  totalStakedMicroStx: bigint | null;
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

// Inline elements only: ValueDisplayer renders the name inside an h4, which
// takes phrasing content.
interface InfoLabelProps {
  label: string;
  explanation: string;
  learnMoreUrl?: string;
}

function InfoLabel({ label, explanation, learnMoreUrl }: InfoLabelProps) {
  return (
    <>
      {label}
      <InfoTooltipIcon
        title={label}
        explanation={explanation}
        learnMoreUrl={learnMoreUrl}
        ariaLabel={`About ${label}`}
      />
    </>
  );
}

function rewardsTokenExplanation(pool: BitcoinStakingPool): string {
  if (pool.operatorBtcPayout) {
    return bitcoinStakingContent.operatorPayout.rewardsTokenExplanation(
      pool.name,
      pool.operatorBtcPayout.cadence
    );
  }
  return bitcoinStakingContent.poolOverviewInfo.rewardsToken;
}

function feeExplanation(pool: BitcoinStakingPool): string {
  if (pool.operatorBtcPayout) return bitcoinStakingContent.operatorPayout.feeExplanation(pool.name);
  if (pool.requiresSelfClaim) return bitcoinStakingContent.selfClaim.explanation;
  return bitcoinStakingContent.poolOverviewInfo.fee;
}

function RewardsTokenValue({ pool }: { pool: BitcoinStakingPool }) {
  if (pool.operatorBtcPayout) {
    return (
      <>
        BTC
        <Box textStyle="label.03">
          {bitcoinStakingContent.operatorPayout.rewardsTokenCaption(pool.name)}
        </Box>
      </>
    );
  }
  return (
    <>
      sBTC
      <Box textStyle="label.03">{bitcoinStakingContent.heroYieldLabel}</Box>
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
  signerManagerContractId,
  totalStakedMicroStx,
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
              <StakingPoolAvatar providerId={pool.providerId} size="md" />
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
              explanation={rewardsTokenExplanation(pool)}
              learnMoreUrl={pool.operatorBtcPayout?.termsUrl}
            />
          }
          value={<RewardsTokenValue pool={pool} />}
        />
      </InfoGrid.Cell>
      <InfoGrid.Cell gridColumn={['2', '2', '3']} gridRow={['2', '2', '1']}>
        <ValueDisplayer
          name={
            <InfoLabel
              label={bitcoinStakingLabels.fee}
              explanation={feeExplanation(pool)}
              learnMoreUrl={pool.operatorBtcPayout?.termsUrl}
            />
          }
          value={<PoolFeeValue pool={pool} signerManagerContractId={signerManagerContractId} />}
        />
      </InfoGrid.Cell>
      <InfoGrid.Cell gridColumn={['1', '1', '2']} gridRow={['3', '3', '2']}>
        <ValueDisplayer
          name={
            <InfoLabel
              label={bitcoinStakingLabels.totalStaked}
              explanation={bitcoinStakingContent.poolOverviewInfo.totalStaked}
            />
          }
          value={
            totalStakedMicroStx === null ? (
              EM_DASH
            ) : (
              <span data-testid="pool-total-staked">
                {toHumanReadableMicroStx(totalStakedMicroStx, 0)}
              </span>
            )
          }
        />
      </InfoGrid.Cell>
      <InfoGrid.Cell gridColumn={['2', '2', '3']} gridRow={['3', '3', '2']}>
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
