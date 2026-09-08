import { AllBalancesSelectors } from '@tests/selectors/all-balances.selectors';
import { Flex, Stack, styled } from 'leather-styles/jsx';

import type { BtcStakingPosition } from '@leather.io/models';
import { Badge } from '@leather.io/ui';
import { truncateMiddle } from '@leather.io/utils';

import { emptyAmountPlaceholder } from '@app/components/balance/constants';

import { formatBalance } from '../all-balances.utils';
import { formatBlockHeight, formatEstimatedDate, getPositionBadge } from '../bond-positions.utils';
import { BondDetailRow } from './bond-detail-row';

const policyAddressOffset = 4;

interface BondPositionSectionProps {
  position: BtcStakingPosition;
  heldBy: string;
}

export function BondPositionSection({ position, heldBy }: BondPositionSectionProps) {
  const badge = getPositionBadge(position);
  const paidOut = position.rewardsClaimed
    ? `+${formatBalance(position.rewardsClaimed)}`
    : emptyAmountPlaceholder;

  return (
    <Stack gap="space.03" py="space.04" data-testid={AllBalancesSelectors.DetailBondSection}>
      <Flex justifyContent="space-between" alignItems="center">
        <styled.span textStyle="label.01">Period {position.bondIndex}</styled.span>
        <Badge label={badge.label} variant={badge.variant} />
      </Flex>
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
            label="Unlocks"
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
    </Stack>
  );
}
