import { Route } from 'react-router';

import { HomePageSelectors } from '@tests/selectors/home.selectors';
import { Box, Stack } from 'leather-styles/jsx';

import { RouteUrls } from '@shared/route-urls';

import { formatCurrency } from '@app/common/currency-formatter';
import { whenPageMode } from '@app/common/utils';
import { ActivityList } from '@app/features/activity-list/activity-list';
import { Collectibles } from '@app/features/collectibles/collectibles';
import { FeedbackButton } from '@app/features/feedback-button/feedback-button';
import { PromoBanner } from '@app/features/promo-banner/promo-banner';
import { AssetsV2 } from '@app/pages/home/components/assets-v2';
import { homePageModalRoutes } from '@app/routes/app-routes';
import { ModalBackgroundWrapper } from '@app/routes/components/modal-background-wrapper';
import { AccountCard } from '@app/ui/components/account/account.card';

import { AccountActions } from './components/account-actions';
import { HomeTabs } from './components/home-tabs';
import { useHomePageState } from './use-home-page-state';

const emptyBalanceDisplay = '-.--';

export function HomeV2() {
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
      px={{ base: 0, md: 'space.05' }}
      py={{ base: 0, md: 'space.07' }}
      gap={{ base: 0, md: 'space.06' }}
      width="100%"
      bg="ink.1"
      borderRadius="lg"
      animation="fadein"
      animationDuration="500ms"
    >
      <Box px={{ base: 'space.05', md: 0 }} pb={{ base: 'space.05', md: 0 }}>
        <AccountCard
          name={name}
          availableBalance={
            balance.state !== 'success' ? emptyBalanceDisplay : formatCurrency(balance.value)
          }
          totalBalance={
            balance.state !== 'success' ? emptyBalanceDisplay : formatCurrency(balance.value)
          }
          toggleSwitchAccount={() => toggleSwitchAccount()}
          isFetchingBnsName={isFetchingBnsName}
          isLoadingBalance={balance.state === 'loading'}
          isLoadingAdditionalData={balance.state === 'loading'}
          isBalancePrivate={isPrivateMode}
          onShowBalance={togglePrivateMode}
        >
          <AccountActions />
        </AccountCard>
        <PromoBanner />
      </Box>
      {whenPageMode({ full: <FeedbackButton />, popup: null })}
      <HomeTabs>
        <ModalBackgroundWrapper>
          <Route index element={<AssetsV2 />} />
          <Route path={RouteUrls.Activity} element={<ActivityList />}>
            {homePageModalRoutes}
          </Route>
          <Route path={RouteUrls.Collectibles} element={<Collectibles />}>
            {homePageModalRoutes}
          </Route>
          {homePageModalRoutes}
        </ModalBackgroundWrapper>
      </HomeTabs>
    </Stack>
  );
}
