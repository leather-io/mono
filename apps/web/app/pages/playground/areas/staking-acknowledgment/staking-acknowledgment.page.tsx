import { useState } from 'react';
import { useSearchParams } from 'react-router';

import { PlaygroundSelectors } from '@tests/selectors/playground.selectors';
import { Box, Flex, Grid, Stack, styled } from 'leather-styles/jsx';
import { bitcoinStakingContent } from '~/content/bitcoin-staking-content';
import { type BitcoinStakingPool, getStakingPoolFromSlug } from '~/data/bitcoin-staking-data';
import { StakingAcknowledgment } from '~/features/bitcoin-staking/components/staking-acknowledgment';
import { useStakingAcknowledgment } from '~/features/bitcoin-staking/hooks/use-staking-acknowledgment';
import { StakingConfirmationSteps } from '~/features/bitcoin-staking/start-staking/components/staking-confirmation-steps';
import { SidebarSummaryCard } from '~/features/bitcoin-staking/update-staking/components/sidebar-summary-card';

import { Button, Input } from '@leather.io/ui';

const reviewPools = [
  getStakingPoolFromSlug('fast-pool'),
  getStakingPoolFromSlug('stacking-dao'),
  getStakingPoolFromSlug('planbetter'),
  getStakingPoolFromSlug('byosm'),
];

const sampleStartDate = new Date('2026-10-01T12:00:00Z');
const cycleMilliseconds = 14 * 24 * 60 * 60 * 1000;
const sampleCurrentPool = getStakingPoolFromSlug('xverse-pool');

interface StakingReviewSurfaceProps {
  pool: BitcoinStakingPool;
  isSwitching: boolean;
}

function getPayoutLabel(pool: BitcoinStakingPool) {
  if (pool.providerId === 'byosm') return 'Set by the custom contract';
  if (pool.operatorBtcPayout) return `BTC, paid by ${pool.name}`;
  if (pool.requiresSelfClaim) return 'sBTC, claim rewards yourself';
  return 'sBTC';
}

function StakingReviewSurface({ pool, isSwitching }: StakingReviewSurfaceProps) {
  const [amount, setAmount] = useState('3200');
  const [cycles, setCycles] = useState('12');
  const [confirmedContext, setConfirmedContext] = useState<string | null>(null);
  const context = JSON.stringify({ amount, cycles, providerId: pool.providerId, isSwitching });
  const acknowledgment = useStakingAcknowledgment(context);
  const amountNumber = Number(amount);
  const cycleNumber = Number(cycles);
  const isValid =
    Number.isFinite(amountNumber) &&
    amountNumber > 0 &&
    Number.isInteger(cycleNumber) &&
    cycleNumber >= 1 &&
    cycleNumber <= 96;
  const scheduledEnd = isValid
    ? new Date(sampleStartDate.getTime() + cycleNumber * cycleMilliseconds)
    : null;
  const isCustom = pool.providerId === 'byosm';
  const poolLabel = isCustom ? 'Custom signer manager' : pool.name;
  const payoutLabel = getPayoutLabel(pool);

  function confirmPreview() {
    if (isValid && acknowledgment.accepted) setConfirmedContext(context);
  }

  return (
    <Stack gap="space.06" data-testid={PlaygroundSelectors.StakingAcknowledgmentReview}>
      <Stack gap="space.02">
        <styled.h1 textStyle="heading.03">
          {isSwitching ? 'Switch pool' : `Stake with ${poolLabel}`}
        </styled.h1>
        <styled.p textStyle="body.02" color="ink.text-subdued">
          {isSwitching
            ? `Move your stake from ${sampleCurrentPool.name} to ${poolLabel}.`
            : 'Review your stake and acknowledge how staking works before confirming.'}
        </styled.p>
      </Stack>
      <Grid
        gridTemplateColumns={{ base: 'minmax(0, 1fr)', lg: 'minmax(0, 1fr) 320px' }}
        gap="space.07"
        alignItems="start"
      >
        <Stack gap="space.06" minWidth="0">
          <Stack gap="space.03">
            <styled.h2 textStyle="label.01">Amount</styled.h2>
            <Input.Root data-shrink>
              <Input.Label>
                {isSwitching ? 'Current stake (STX)' : 'Amount to stake (STX)'}
              </Input.Label>
              <Input.Field
                id="review-stake-amount"
                aria-label="Amount to stake (STX)"
                inputMode="decimal"
                value={amount}
                readOnly={isSwitching}
                onChange={event => setAmount(event.target.value)}
              />
            </Input.Root>
          </Stack>
          <Stack gap="space.03">
            <styled.h2 textStyle="label.01">Duration</styled.h2>
            <Input.Root data-shrink>
              <Input.Label>Cycles before scheduled end (1–96)</Input.Label>
              <Input.Field
                id="review-stake-cycles"
                aria-label="Staking duration in cycles"
                inputMode="numeric"
                value={cycles}
                readOnly={isSwitching}
                onChange={event => setCycles(event.target.value.replace(/\D/g, ''))}
              />
            </Input.Root>
            <styled.p textStyle="caption.01" color="ink.text-secondary">
              {bitcoinStakingContent.chooseDuration.exitDescription}
            </styled.p>
          </Stack>
          <Stack gap="space.03">
            <styled.h2 textStyle="label.01">Rewards payout</styled.h2>
            <Box p="space.04" borderWidth={1} borderColor="ink.border-default" borderRadius="sm">
              <styled.p textStyle="body.02">{payoutLabel}</styled.p>
            </Box>
          </Stack>
          <Stack gap="space.02">
            <styled.h2 textStyle="label.01">{isCustom ? 'Signer manager' : 'Pool'}</styled.h2>
            <styled.p textStyle="body.02">{poolLabel}</styled.p>
            {isCustom && (
              <styled.p textStyle="caption.01" color="ink.text-subdued">
                Custom contract selected for this preview.
              </styled.p>
            )}
          </Stack>
        </Stack>
        <Stack gap="space.03" minWidth="0">
          {isSwitching ? (
            <SidebarSummaryCard
              rows={[
                { kind: 'diff', label: 'Pool', from: sampleCurrentPool.name, to: poolLabel },
                { kind: 'value', label: 'Amount staked', value: '3,200 STX, moves in full' },
                { kind: 'value', label: 'Rewards payout', value: payoutLabel },
                { kind: 'value', label: 'Scheduled end', value: 'Unchanged' },
                { kind: 'value', label: 'Effective', value: 'Next cycle' },
              ]}
              acknowledgment={<StakingAcknowledgment pool={pool} acknowledgment={acknowledgment} />}
              confirmLabel="Confirm switch"
              confirmAttemptCount={acknowledgment.attemptCount}
              confirmError={
                acknowledgment.isInvalid
                  ? bitcoinStakingContent.acknowledgment.requiredMessage
                  : undefined
              }
              confirmTestId="review-confirm-switch"
              onConfirm={() => {
                if (acknowledgment.requireAccepted()) confirmPreview();
              }}
            />
          ) : (
            <StakingConfirmationSteps
              pool={pool}
              stakeAmount={Number.isFinite(amountNumber) ? amountNumber : undefined}
              cycles={cycleNumber}
              estimatedUnlockDate={scheduledEnd}
              acknowledgment={acknowledgment}
              onConfirm={confirmPreview}
              isDisabled={!isValid}
            />
          )}
          {confirmedContext === context && acknowledgment.accepted && (
            <styled.p role="status" textStyle="caption.01" color="ink.text-subdued">
              Preview confirmed. No transaction was sent.
            </styled.p>
          )}
        </Stack>
      </Grid>
    </Stack>
  );
}

export function StakingAcknowledgmentPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const pool =
    reviewPools.find(candidate => candidate.providerId === searchParams.get('pool')) ??
    getStakingPoolFromSlug('fast-pool');
  const isSwitching = searchParams.get('flow') === 'switch';

  function selectScenario(providerId: string, flow: string) {
    setSearchParams({ pool: providerId, flow });
  }

  return (
    <Stack gap="space.07" pb="space.10">
      <Stack gap="space.03" pb="space.05" borderBottomWidth={1} borderColor="ink.border-default">
        <styled.p textStyle="caption.01" color="ink.text-subdued">
          Local review only. Sample amounts and dates. No transaction will be sent.
        </styled.p>
        <Flex gap="space.03" flexWrap="wrap" alignItems="center">
          <Button
            size="sm"
            variant={isSwitching ? 'outline' : 'solid'}
            aria-pressed={!isSwitching}
            onClick={() => selectScenario(pool.providerId, 'start')}
          >
            Start staking
          </Button>
          <Button
            size="sm"
            variant={isSwitching ? 'solid' : 'outline'}
            aria-pressed={isSwitching}
            onClick={() => selectScenario(pool.providerId, 'switch')}
          >
            Switch pool
          </Button>
          <styled.select
            aria-label="Review pool"
            value={pool.providerId}
            onChange={event => selectScenario(event.target.value, isSwitching ? 'switch' : 'start')}
            minHeight="40px"
            maxWidth="100%"
            px="space.03"
            borderWidth={1}
            borderColor="ink.border-default"
            borderRadius="sm"
            bg="ink.background-primary"
            textStyle="label.03"
          >
            {reviewPools.map(candidate => (
              <option key={candidate.providerId} value={candidate.providerId}>
                {candidate.providerId === 'byosm' ? 'Custom signer manager' : candidate.name}
              </option>
            ))}
          </styled.select>
        </Flex>
      </Stack>
      <StakingReviewSurface
        key={`${pool.providerId}-${isSwitching}`}
        pool={pool}
        isSwitching={isSwitching}
      />
    </Stack>
  );
}
