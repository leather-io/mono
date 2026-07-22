import { css } from 'leather-styles/css';
import { Box, VStack, styled } from 'leather-styles/jsx';
import { InfoGrid } from '~/components/info-grid/info-grid';
import { ValueDisplayer } from '~/components/value-displayer/default-value-displayer';
import { EM_DASH } from '~/constants/constants';
import { bitcoinStakingContent, bitcoinStakingLabels } from '~/content/bitcoin-staking-content';
import { BitcoinStakingPool } from '~/data/bitcoin-staking-data';
import { LearnMoreLink } from '~/layouts/page/page';
import { toHumanReadableMicroStx } from '~/utils/unit-convert';

interface StakingPoolOverviewProps {
  pool: BitcoinStakingPool;
  nextCycleNumber: number | null;
  daysUntilNextCycle: number | null;
}

export function StakingPoolOverview({
  pool,
  nextCycleNumber,
  daysUntilNextCycle,
}: StakingPoolOverviewProps) {
  return (
    <InfoGrid
      width="100%"
      gridTemplateColumns={['repeat(2, 1fr)', 'repeat(2, 1fr)', 'repeat(4, 1fr)']}
      gridTemplateRows={['auto', 'auto', 'auto', 'auto', 'auto']}
      height="fit-content"
      className={css({ '& > *:not(:first-child)': { height: ['120px', null, 'unset'] } })}
      borderTop="0px"
      borderLeft="0px"
      borderRight="0px"
      borderRadius="0px"
    >
      <InfoGrid.Cell gridColumn={['span 2', 'span 2', 'auto']} gridRow={['1', '1', 'span 2']}>
        <VStack gap="space.05" alignItems="left" p="space.05">
          <styled.h4 textDecoration="underline" textStyle="label.01">
            {pool.name}
          </styled.h4>
          <styled.div textStyle="caption.01">
            {pool.description}
            <LearnMoreLink destination={pool.url} />
          </styled.div>
        </VStack>
      </InfoGrid.Cell>
      <InfoGrid.Cell gridColumn={['1', '1', '2']} gridRow={['2', '2', '1']}>
        <ValueDisplayer
          name={bitcoinStakingLabels.rewardsToken}
          value={
            <>
              sBTC
              <Box textStyle="label.03">{bitcoinStakingContent.heroYieldLabel}</Box>
            </>
          }
        />
      </InfoGrid.Cell>
      <InfoGrid.Cell gridColumn={['2', '2', '2']} gridRow={['2', '2', '2']}>
        <ValueDisplayer
          name={bitcoinStakingLabels.minimumCommitment}
          value={toHumanReadableMicroStx(pool.minimumStakeAmount)}
        />
      </InfoGrid.Cell>
      <InfoGrid.Cell gridColumn={['1', '1', '3']} gridRow={['3', '3', '1']}>
        <ValueDisplayer name={bitcoinStakingLabels.fee} value={pool.fee} />
      </InfoGrid.Cell>
      <InfoGrid.Cell gridColumn={['2', '2', '3']} gridRow={['3', '3', '2']}>
        <ValueDisplayer
          name="Next cycle"
          value={
            daysUntilNextCycle === null ? (
              EM_DASH
            ) : (
              <>
                {daysUntilNextCycle} days
                {nextCycleNumber !== null && (
                  <Box textStyle="label.03">(Cycle {nextCycleNumber})</Box>
                )}
              </>
            )
          }
        />
      </InfoGrid.Cell>
    </InfoGrid>
  );
}
