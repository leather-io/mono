import { AllBalancesSelectors } from '@tests/selectors/all-balances.selectors';
import { Flex, Stack, styled } from 'leather-styles/jsx';

import type { BtcBondEnrollmentWindow } from '@leather.io/models';
import { Badge } from '@leather.io/ui';

import { formatEstimatedDate } from '../bond-positions.utils';
import { BondDetailRow } from './bond-detail-row';

interface UpcomingBondSectionProps {
  window: BtcBondEnrollmentWindow;
  opensAt?: Date;
}

export function UpcomingBondSection({ window, opensAt }: UpcomingBondSectionProps) {
  const closesAt = formatEstimatedDate(window.estimatedClosesAt);
  const badgeLabel = opensAt ? `Opens ${formatEstimatedDate(opensAt)}` : 'Open now';
  const windowLabel = opensAt
    ? `${formatEstimatedDate(opensAt)} to ${closesAt}`
    : `until ${closesAt}`;

  return (
    <Stack gap="space.03" py="space.04" data-testid={AllBalancesSelectors.DetailUpcomingBond}>
      <Flex justifyContent="space-between" alignItems="center">
        <styled.span textStyle="label.01">Period {window.bondIndex}</styled.span>
        <Badge label={badgeLabel} variant={opensAt ? 'default' : 'info'} />
      </Flex>
      <Stack gap="space.02">
        <BondDetailRow label="Window" value={windowLabel} />
        <BondDetailRow label="Your bonds" value="None yet" />
      </Stack>
    </Stack>
  );
}
