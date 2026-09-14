import { AllBalancesSelectors } from '@tests/selectors/all-balances.selectors';
import { Box, Stack, styled } from 'leather-styles/jsx';

import type { BtcStakingPosition } from '@leather.io/models';
import { Badge, Spinner } from '@leather.io/ui';
import { truncateMiddle } from '@leather.io/utils';

import { emptyAmountPlaceholder } from '@app/components/balance/constants';

import { formatBalance } from '../all-balances.utils';
import { formatBlockHeight, formatEstimatedDate, getPositionBadge } from '../bond-positions.utils';
import { BondDetailRow } from './bond-detail-row';
import { CollapsibleSection } from './collapsible-section';

const policyAddressOffset = 4;

const waitingIcon = (
  <Box transform="scale(0.65) translateY(2px)" display="inline-block">
    <Spinner />
  </Box>
);

interface BondPositionSectionProps {
  position: BtcStakingPosition;
  heldBy: string;
  defaultExpanded?: boolean;
}

export function BondPositionSection({
  position,
  heldBy,
  defaultExpanded = true,
}: BondPositionSectionProps) {
  const badge = getPositionBadge(position);
  const paidOut = position.rewardsClaimed
    ? `+${formatBalance(position.rewardsClaimed)}`
    : emptyAmountPlaceholder;

  return (
    <CollapsibleSection
      dataTestId={AllBalancesSelectors.DetailBondSection}
      defaultExpanded={defaultExpanded}
      header={
        <>
          <styled.span textStyle="label.01">Period {position.bondIndex}</styled.span>
          <Badge
            label={badge.label}
            variant={badge.variant}
            icon={badge.isWaiting ? waitingIcon : undefined}
          />
        </>
      }
      collapsedSummary={
        <styled.span textStyle="label.02">{formatBalance(position.amount)}</styled.span>
      }
    >
      <Stack gap="space.02">
        <BondDetailRow label="Amount" value={formatBalance(position.amount)} />
        <BondDetailRow
          label="STX stacked"
          value={formatBalance(position.stxStacked ?? undefined)}
        />
        <BondDetailRow
          label="Policy"
          value={truncateMiddle(position.stakerAddress, policyAddressOffset)}
        />
        {position.bond.status === 'upcoming' ? (
          <BondDetailRow
            label="Starts"
            value={`about ${formatEstimatedDate(position.estimatedActivationAt)} · ${formatBlockHeight(position.bond.activationBurnHeight)}`}
          />
        ) : (
          <BondDetailRow
            label={position.status === 'matured' ? 'Unlocked' : 'Unlocks'}
            value={`about ${formatEstimatedDate(position.estimatedUnlockAt)} · ${formatBlockHeight(position.unlockBurnHeight)}`}
          />
        )}
        <BondDetailRow label="Held by" value={heldBy} />
        <BondDetailRow
          label="Paid out"
          value={paidOut}
          valueColor={position.rewardsClaimed ? 'green.action-primary-default' : undefined}
        />
      </Stack>
    </CollapsibleSection>
  );
}
