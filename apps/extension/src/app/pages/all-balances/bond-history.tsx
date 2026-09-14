import { AllBalancesSelectors } from '@tests/selectors/all-balances.selectors';
import { Box, Flex, styled } from 'leather-styles/jsx';

import type { BtcStakingPosition } from '@leather.io/models';

import { useViewportMinWidth } from '@app/common/hooks/use-media-query';
import { Content } from '@app/components/layout';
import { Divider } from '@app/components/layout/divider';
import { Header } from '@app/components/layout/headers/header';
import { HeaderBackButton } from '@app/components/layout/headers/header-back-button';
import { HeaderGrid } from '@app/components/layout/headers/header-grid';
import { useCurrentBtcStakingPositions } from '@app/query/bitcoin/staking/bitcoin-staking.hooks';
import { useCurrentAccountAddresses } from '@app/services/accounts/use-account-addresses';

import {
  describeHeldBy,
  describePastPositions,
  isPastPosition,
  summarizePastPositions,
} from './bond-positions.utils';
import { BondPositionSection } from './components/bond-position-section';

function sortMostRecentFirst(a: BtcStakingPosition, b: BtcStakingPosition) {
  return b.bondIndex - a.bondIndex;
}

export function BondHistoryPage() {
  const isMd = useViewportMinWidth('md');
  const account = useCurrentAccountAddresses();
  const positions = useCurrentBtcStakingPositions({ includeSpent: true });

  const positionList = positions.state === 'success' ? positions.value : [];
  const pastPositions = positionList.filter(isPastPosition).sort(sortMostRecentFirst);
  const summary = summarizePastPositions(positionList);

  const endToEndDivider = (
    <Box mx={isMd ? 'space.00' : '-space.05'}>
      <Divider />
    </Box>
  );

  return (
    <Flex height="100vh" direction="column" data-testid={AllBalancesSelectors.BondHistoryPage}>
      <Header px="space.04">
        <HeaderGrid
          leftCol={<HeaderBackButton />}
          centerCol={<styled.span textStyle="heading.05">Past periods</styled.span>}
        />
      </Header>
      <Content>
        <Flex
          direction="column"
          width="100%"
          height="100%"
          overflowY="auto"
          px="space.05"
          pb="space.05"
        >
          {positions.state === 'success' && (
            <styled.span textStyle="caption.01" color="ink.text-subdued" py="space.04">
              {describePastPositions(summary)}
            </styled.span>
          )}

          {positions.state === 'success' && pastPositions.length === 0 && (
            <styled.span
              textStyle="caption.01"
              color="ink.text-subdued"
              py="space.05"
              data-testid={AllBalancesSelectors.BondHistoryEmpty}
            >
              No past periods for this account
            </styled.span>
          )}

          {pastPositions.map(position => (
            <Box key={`${position.bondIndex}:${position.stxAddress}`}>
              {endToEndDivider}
              <BondPositionSection position={position} heldBy={describeHeldBy(account)} />
            </Box>
          ))}
        </Flex>
      </Content>
    </Flex>
  );
}
