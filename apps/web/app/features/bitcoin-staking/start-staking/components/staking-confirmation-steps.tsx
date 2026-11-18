import { Stack, styled } from 'leather-styles/jsx';
import { bitcoinStakingContent } from '~/content/bitcoin-staking-content';
import { type BitcoinStakingPool } from '~/data/bitcoin-staking-data';
import { toHumanReadableMicroStx } from '~/utils/unit-convert';

import { Button } from '@leather.io/ui';
import { stxToMicroStx } from '@leather.io/utils';

import { StakingAcknowledgment } from '../../components/staking-acknowledgment';
import { StakingConfirmMessage } from '../../components/staking-confirm-message';
import {
  shakeKeyframes,
  shakeTiming,
  useAttentionAnimation,
} from '../../hooks/use-attention-animation';
import { type StakingAcknowledgmentState } from '../../hooks/use-staking-acknowledgment';

interface StakingConfirmationStepsProps {
  pool: BitcoinStakingPool | null;
  stakeAmount: number | undefined;
  cycles: number | undefined;
  estimatedUnlockDate: Date | null;
  acknowledgment: StakingAcknowledgmentState;
  onConfirm(): void;
  isBusy?: boolean;
  isDisabled?: boolean;
}

export function StakingConfirmationSteps({
  pool,
  stakeAmount,
  cycles,
  estimatedUnlockDate,
  acknowledgment,
  onConfirm,
  isBusy = false,
  isDisabled = false,
}: StakingConfirmationStepsProps) {
  const stxAmount = stakeAmount === undefined ? undefined : stxToMicroStx(stakeAmount);
  const hasCycles = cycles !== undefined && Number.isInteger(cycles) && cycles > 0;
  const content = bitcoinStakingContent.acknowledgment;
  const buttonRef = useAttentionAnimation<HTMLDivElement>(
    acknowledgment.attemptCount,
    shakeKeyframes,
    shakeTiming
  );

  return (
    <Stack
      borderWidth={1}
      borderColor="ink.border-default"
      borderRadius="md"
      gap="0"
      bg="ink.background-primary"
    >
      <Stack p="space.05" gap="space.02" borderBottomWidth={1} borderColor="ink.border-default">
        <styled.h2 textStyle="label.01">You&apos;ll stake</styled.h2>
        <styled.span textStyle="heading.04">
          {stxAmount === undefined ? '—' : toHumanReadableMicroStx(stxAmount)}
        </styled.span>
        {hasCycles && (
          <styled.span textStyle="caption.01" color="ink.text-subdued">
            {cycles === 1 ? '1 cycle' : `${cycles} cycles`}
            {estimatedUnlockDate && (
              <>
                {' · '}
                {content.scheduledEnd.toLowerCase()} ~
                {estimatedUnlockDate.toLocaleDateString(undefined, {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </>
            )}
          </styled.span>
        )}
      </Stack>
      <Stack p="space.05" gap="space.05">
        <StakingAcknowledgment pool={pool} acknowledgment={acknowledgment} disabled={isBusy} />
        <Stack>
          <styled.div ref={buttonRef}>
            <Button
              fullWidth
              disabled={isBusy || isDisabled}
              aria-busy={isBusy || undefined}
              onClick={() => {
                if (acknowledgment.requireAccepted()) onConfirm();
              }}
              data-testid="confirmation-stake-button"
            >
              {content.confirmStake}
            </Button>
          </styled.div>
          <StakingConfirmMessage
            message={acknowledgment.isInvalid ? content.requiredMessage : undefined}
          />
        </Stack>
      </Stack>
    </Stack>
  );
}
