import { AllBalancesSelectors } from '@tests/selectors/all-balances.selectors';
import { styled } from 'leather-styles/jsx';

import { ItemLayout, Pressable } from '@leather.io/ui';

import { type PastPositionsSummary, describePastPositions } from '../bond-positions.utils';

interface PastPeriodsRowProps {
  summary: PastPositionsSummary;
  onClick(): void;
}

export function PastPeriodsRow({ summary, onClick }: PastPeriodsRowProps) {
  return (
    <Pressable my="space.04" onClick={onClick} data-testid={AllBalancesSelectors.DetailPastPeriods}>
      <ItemLayout
        titleLeft={<styled.span textStyle="label.01">Past periods</styled.span>}
        titleRight={null}
        captionLeft={
          <styled.span textStyle="caption.01" color="ink.text-subdued">
            {describePastPositions(summary)}
          </styled.span>
        }
        captionRight={null}
        showChevron
        chevronDirection="right"
      />
    </Pressable>
  );
}
