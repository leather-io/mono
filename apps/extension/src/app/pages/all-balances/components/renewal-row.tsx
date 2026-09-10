import { BondsSelectors } from '@tests/selectors/bonds.selectors';
import { Stack, styled } from 'leather-styles/jsx';

import type { BtcStakingPosition } from '@leather.io/models';
import { Badge } from '@leather.io/ui';
import { truncateMiddle } from '@leather.io/utils';

import { formatBalance } from '../all-balances.utils';
import { formatBlockHeight, formatEstimatedDate } from '../bond-positions.utils';
import { BondDetailRow } from './bond-detail-row';
import { CollapsibleSection } from './collapsible-section';

const policyAddressOffset = 4;

interface RenewalRowProps {
  position: BtcStakingPosition;
  heldBy: string;
}

/** A registration for the next period, collapsed under the bond it follows. */
export function RenewalRow({ position, heldBy }: RenewalRowProps) {
  return (
    <CollapsibleSection
      dataTestId={BondsSelectors.DetailRenewalRow}
      defaultExpanded={false}
      header={
        <>
          <styled.span textStyle="label.01">Period {position.bondIndex}</styled.span>
          <Badge label="Renewal set" variant="info" />
        </>
      }
      subheader={
        <styled.span textStyle="caption.01" color="ink.text-subdued">
          Starts about {formatEstimatedDate(position.estimatedActivationAt)}
        </styled.span>
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
        <BondDetailRow
          label="Starts"
          value={`about ${formatEstimatedDate(position.estimatedActivationAt)} · ${formatBlockHeight(position.bond.activationBurnHeight)}`}
        />
        <BondDetailRow label="Held by" value={heldBy} />
      </Stack>
    </CollapsibleSection>
  );
}
