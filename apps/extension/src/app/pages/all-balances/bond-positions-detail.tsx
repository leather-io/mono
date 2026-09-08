import { useNavigate } from 'react-router';

import { AllBalancesSelectors } from '@tests/selectors/all-balances.selectors';
import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import { BtcAvatarIcon, ExternalLinkIcon, Flag, InfoCircleIcon } from '@leather.io/ui';

import { BITCOIN_STAKING_URL } from '@shared/constants';
import { RouteUrls } from '@shared/route-urls';

import { useViewportMinWidth } from '@app/common/hooks/use-media-query';
import { openInNewTab } from '@app/common/utils/open-in-new-tab';
import { Content } from '@app/components/layout';
import { Divider } from '@app/components/layout/divider';
import { Header } from '@app/components/layout/headers/header';
import { HeaderBackButton } from '@app/components/layout/headers/header-back-button';
import { HeaderGrid } from '@app/components/layout/headers/header-grid';
import { useCurrentBtcBalanceWithFallback } from '@app/query/bitcoin/balance/btc-balance.hooks';
import {
  useBtcBondEnrollmentWindow,
  useCurrentBtcStakingPositions,
} from '@app/query/bitcoin/staking/bitcoin-staking.hooks';
import { useCurrentAccountAddresses } from '@app/services/accounts/use-account-addresses';
import { BasicTooltip } from '@app/ui/components/tooltip/basic-tooltip';

import { btcBalanceCategoryMap, formatBalance } from './all-balances.utils';
import {
  describeHeldBy,
  getRenewalOpensAt,
  isPastPosition,
  summarizePastPositions,
} from './bond-positions.utils';
import { BalanceAmount } from './components/balance-amount';
import { BondPositionSection } from './components/bond-position-section';
import { PastPeriodsRow } from './components/past-periods-row';
import { UpcomingBondSection } from './components/upcoming-bond-section';

export function BondPositionsDetail() {
  const { title, tooltipText } = btcBalanceCategoryMap.bonded;
  const navigate = useNavigate();
  const isMd = useViewportMinWidth('md');
  const balance = useCurrentBtcBalanceWithFallback();
  const positions = useCurrentBtcStakingPositions({ includeSpent: true });
  const enrollmentWindow = useBtcBondEnrollmentWindow();
  const account = useCurrentAccountAddresses();

  const isLoading = balance.isLoading || positions.state === 'loading';
  const positionList = positions.state === 'success' ? positions.value : [];
  const currentPositions = positionList.filter(position => !isPastPosition(position));
  const pastSummary = summarizePastPositions(positionList);
  const enrollmentWindowValue =
    enrollmentWindow.state === 'success' ? enrollmentWindow.value : null;
  const upcomingWindow =
    enrollmentWindowValue &&
    !positionList.some(position => position.bondIndex === enrollmentWindowValue.bondIndex)
      ? enrollmentWindowValue
      : null;

  const endToEndDivider = (
    <Box mx={isMd ? 'space.00' : '-space.05'}>
      <Divider />
    </Box>
  );

  return (
    <Flex
      height="100vh"
      direction="column"
      data-testid={AllBalancesSelectors.AllBalancesDetailPage}
    >
      <Header px="space.04">
        <HeaderGrid
          leftCol={<HeaderBackButton />}
          centerCol={<styled.span textStyle="heading.05">All balances</styled.span>}
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
          <Flex
            justifyContent="space-between"
            alignItems="flex-start"
            pt="space.04"
            pb="space.04"
            data-testid={AllBalancesSelectors.DetailTotal}
          >
            <Stack gap="space.02">
              <BasicTooltip label={tooltipText} side="top">
                <Flag
                  reverse
                  spacing="space.01"
                  img={<InfoCircleIcon color="ink.text-subdued" display="inline" variant="small" />}
                >
                  <styled.h2 textStyle="label.02">{title}</styled.h2>
                </Flag>
              </BasicTooltip>
              <BalanceAmount
                textStyle="heading.03"
                value={formatBalance(balance.quote.lockedBalance)}
                isLoading={isLoading}
                skeletonWidth="140px"
                skeletonHeight="32px"
              />
              <BalanceAmount
                textStyle="caption.01"
                color="ink.text-subdued"
                value={formatBalance(balance.btc.lockedBalance)}
                isLoading={isLoading}
                skeletonWidth="60px"
                skeletonHeight="16px"
              />
            </Stack>
            <BtcAvatarIcon />
          </Flex>

          {positions.state === 'error' && (
            <styled.span
              textStyle="caption.01"
              color="ink.text-subdued"
              py="space.05"
              data-testid={AllBalancesSelectors.DetailEmpty}
            >
              Bond details are unavailable right now
            </styled.span>
          )}

          {positions.state === 'success' && positionList.length === 0 && (
            <styled.span
              textStyle="caption.01"
              color="ink.text-subdued"
              py="space.05"
              data-testid={AllBalancesSelectors.DetailEmpty}
            >
              No bonds for this account
            </styled.span>
          )}

          {currentPositions.map(position => (
            <Box key={`${position.bondIndex}:${position.stxAddress}`}>
              {endToEndDivider}
              <BondPositionSection position={position} heldBy={describeHeldBy(account)} />
            </Box>
          ))}

          {upcomingWindow && (
            <>
              {endToEndDivider}
              <UpcomingBondSection
                window={upcomingWindow}
                opensAt={getRenewalOpensAt(positionList)}
              />
            </>
          )}

          {pastSummary.count > 0 && (
            <>
              {endToEndDivider}
              <PastPeriodsRow
                summary={pastSummary}
                onClick={() => navigate(RouteUrls.AllBalancesBondHistory)}
              />
            </>
          )}

          {endToEndDivider}
          <styled.button
            type="button"
            display="inline-flex"
            alignItems="center"
            gap="space.01"
            py="space.04"
            textStyle="label.02"
            color="ink.text-primary"
            _hover={{ cursor: 'pointer', textDecoration: 'underline' }}
            onClick={() => openInNewTab(BITCOIN_STAKING_URL)}
            data-testid={AllBalancesSelectors.DetailManageLink}
          >
            Manage in Bitcoin Staking
            <ExternalLinkIcon variant="small" />
          </styled.button>
        </Flex>
      </Content>
    </Flex>
  );
}
