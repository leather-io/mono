import { Route } from 'react-router';

import { HomePageSelectors } from '@tests/selectors/home.selectors';
import { Flex } from 'leather-styles/jsx';

import { RouteUrls } from '@shared/route-urls';

import { formatCurrency } from '@app/common/currency-formatter';
import { whenPageMode } from '@app/common/utils';
import { emptyAmountPlaceholder } from '@app/components/balance/constants';
import { ActivityList } from '@app/features/activity-list/activity-list';
import { Collectibles } from '@app/features/collectibles/collectibles';
import { FeedbackButton } from '@app/features/feedback-button/feedback-button';
import { PromoBanner } from '@app/features/promo-banner/promo-banner';
import { Assets } from '@app/pages/home/components/assets';
import { homePageModalRoutes } from '@app/routes/app-routes';
import { ModalBackgroundWrapper } from '@app/routes/components/modal-background-wrapper';
import { AccountCard } from '@app/ui/components/account/account-current.card';

import { AccountActions } from './components/account-actions-current/account-actions';
import { HomeTabs } from './components/home-tabs';
import { useHomePageState } from './use-home-page-state';

export function Home() {
  const { totalBalance, availableBalance, isPrivateMode, togglePrivateMode, stxAccountBalance } =
    useHomePageState();

  const isLoadingBalance = totalBalance.state === 'loading' || availableBalance.state === 'loading';

  return (
    <Flex
      direction="column"
      data-testid={HomePageSelectors.HomePageContainer}
      px={['0', 'space.05']}
      pt="space.05"
      width="100%"
      bg="ink.1"
      animation="fadein"
      animationDuration="500ms"
    >
      <Flex px={['space.05', 0]} pb="space.05" gap="space.05" direction="column">
        <AccountCard
          totalBalance={
            totalBalance.state !== 'success'
              ? emptyAmountPlaceholder
              : formatCurrency(totalBalance.value)
          }
          lockedBalanceMoney={stxAccountBalance.value?.quote.lockedBalance}
          totalBalanceMoney={totalBalance.value}
          isLoadingBalance={isLoadingBalance}
          isLoadingAdditionalData={isLoadingBalance}
          isBalancePrivate={isPrivateMode}
          onShowBalance={togglePrivateMode}
        />
        <AccountActions />
        <PromoBanner />
      </Flex>
      {whenPageMode({ full: <FeedbackButton />, popup: null })}
      <HomeTabs>
        <ModalBackgroundWrapper>
          <Route index element={<Assets />} />
          <Route path={RouteUrls.Activity} element={<ActivityList />}>
            {homePageModalRoutes}
          </Route>
          <Route path={RouteUrls.Collectibles} element={<Collectibles />}>
            {homePageModalRoutes}
          </Route>
          {homePageModalRoutes}
        </ModalBackgroundWrapper>
      </HomeTabs>
    </Flex>
  );
}
