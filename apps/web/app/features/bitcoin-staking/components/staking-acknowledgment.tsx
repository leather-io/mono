import { useId } from 'react';

import { Stack, styled } from 'leather-styles/jsx';
import { RotatedArrow } from '~/components/icons/rotated-icon';
import { bitcoinStakingContent } from '~/content/bitcoin-staking-content';
import { type BitcoinStakingPool } from '~/data/bitcoin-staking-data';

import { Link } from '@leather.io/ui';

import { type StakingAcknowledgmentState } from '../hooks/use-staking-acknowledgment';

interface StakingAcknowledgmentProps {
  pool: BitcoinStakingPool | null;
  acknowledgment: StakingAcknowledgmentState;
  disabled?: boolean;
}

function getPayoutCopy(pool: BitcoinStakingPool | null) {
  const content = bitcoinStakingContent.acknowledgment;
  if (!pool || pool.providerId === 'byosm') return content.customPayout;
  if (pool.operatorBtcPayout) {
    return content.operatorPayout(pool.name, pool.operatorBtcPayout.cadence);
  }
  if (pool.requiresSelfClaim) return content.selfClaimPayout(pool.name);
  return content.contractPayout(pool.name);
}

export function StakingAcknowledgment({
  pool,
  acknowledgment,
  disabled = false,
}: StakingAcknowledgmentProps) {
  const detailsId = useId();
  const checkboxId = useId();
  const content = bitcoinStakingContent.acknowledgment;
  const payout = getPayoutCopy(pool);

  return (
    <Stack gap="space.04">
      <Stack id={detailsId} gap="space.03">
        <Stack gap="space.01">
          <styled.p textStyle="label.02">{content.lockTitle}</styled.p>
          <styled.p textStyle="caption.01" color="ink.text-secondary">
            {content.lockDescription}
          </styled.p>
        </Stack>
        <Stack gap="space.01">
          <styled.p textStyle="label.02">{content.payoutTitle}</styled.p>
          <styled.p textStyle="caption.01" color="ink.text-secondary">
            {payout}
          </styled.p>
        </Stack>
      </Stack>
      <styled.div
        display="flex"
        gap="space.02"
        alignItems="flex-start"
        mx="-space.03"
        px="space.03"
        my="-space.02"
        py="space.02"
        borderRadius="sm"
        bg={acknowledgment.isInvalid ? 'red.background-primary' : 'transparent'}
        transition="background-color 200ms ease-out"
      >
        <styled.label
          display="flex"
          alignItems="center"
          justifyContent="center"
          width="24px"
          height="24px"
          flexShrink={0}
          cursor="pointer"
        >
          <styled.input
            id={checkboxId}
            type="checkbox"
            checked={acknowledgment.accepted}
            disabled={disabled}
            onChange={event => acknowledgment.setAccepted(event.target.checked)}
            aria-describedby={detailsId}
            aria-invalid={acknowledgment.isInvalid || undefined}
            data-testid="staking-acknowledgment-checkbox"
            width="16px"
            height="16px"
            accentColor="ink.action-primary-default"
            cursor="pointer"
            _focusVisible={{ outline: '2px solid', outlineOffset: '3px' }}
          />
        </styled.label>
        <styled.p textStyle="body.02" color="ink.text-primary">
          <styled.label htmlFor={checkboxId} cursor="pointer">
            {content.label}
          </styled.label>{' '}
          See{' '}
          <Link
            href="/posts/terms-of-service"
            target="_blank"
            rel="noopener noreferrer"
            textStyle="body.02"
            pt={0}
            mb={0}
            aria-label={content.termsAccessibleLabel}
          >
            {content.termsLabel}
            <RotatedArrow ml="space.01" />
          </Link>
        </styled.p>
      </styled.div>
    </Stack>
  );
}
