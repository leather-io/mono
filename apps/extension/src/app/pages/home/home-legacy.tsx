import { Route } from 'react-router';

import { HomePageSelectors } from '@tests/selectors/home.selectors';
import { Box, Stack } from 'leather-styles/jsx';

import { RouteUrls } from '@shared/route-urls';

import { formatCurrency } from '@app/common/currency-formatter';
import { whenPageMode } from '@app/common/utils';
import { emptyAmountPlaceholder } from '@app/components/balance/constants';
import { ActivityListLegacy } from '@app/features/activity-list/activity-list-legacy';
import { FeedbackButton } from '@app/features/feedback-button/feedback-button';
import { PromoBanner } from '@app/features/promo-banner/promo-banner';
import { AssetsLegacy } from '@app/pages/home/components/assets-legacy';
import { homePageModalRoutes } from '@app/routes/app-routes';
import { ModalBackgroundWrapper } from '@app/routes/components/modal-background-wrapper';
import { AccountCard } from '@app/ui/components/account/account.card';

import { AccountActions } from './components/account-actions';
import { HomeTabsLegacy } from './components/home-tabs-legacy';
import { useHomePageState } from './use-home-page-state';

export function HomeLegacy() {
  const {
    balance,
    isFetchingBnsName,
    isPrivateMode,
    name,
    togglePrivateMode,
    toggleSwitchAccount,
  } = useHomePageState();

  return (
    <Stack
      data-testid={HomePageSelectors.HomePageContainer}
      px={['0', 'space.05']}
      py={['0', 'space.07']}
      gap={['0', 'space.06']}
      width="100%"
      bg="ink.1"
      borderRadius="lg"
      animation="fadein"
      animationDuration="500ms"
    >
      <Box px={['space.05', 0]} pb={['space.05', 0]}>
        <AccountCard
          name={name}
          availableBalance={
            !balance.data ? emptyAmountPlaceholder : formatCurrency(balance.data)
          }
          totalBalance={
            !balance.data ? emptyAmountPlaceholder : formatCurrency(balance.data)
          }
          toggleSwitchAccount={() => toggleSwitchAccount()}
          isFetchingBnsName={isFetchingBnsName}
          isLoadingBalance={balance.isLoading}
          isLoadingAdditionalData={balance.isLoading}
          isBalancePrivate={isPrivateMode}
          onShowBalance={togglePrivateMode}
        >
          <AccountActions />
        </AccountCard>
        <PromoBanner />
      </Box>
      {whenPageMode({ full: <FeedbackButton />, popup: null })}
      <HomeTabsLegacy>
        <ModalBackgroundWrapper>
          <Route index element={<AssetsLegacy />} />
          <Route path={RouteUrls.Activity} element={<ActivityListLegacy />}>
            {homePageModalRoutes}
          </Route>
          {homePageModalRoutes}
        </ModalBackgroundWrapper>
      </HomeTabsLegacy>
    </Stack>
  );
}
