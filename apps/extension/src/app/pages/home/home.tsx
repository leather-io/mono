import { Route } from 'react-router';

import { HomePageSelectors } from '@tests/selectors/home.selectors';
import { Flex } from 'leather-styles/jsx';

import { RouteUrls } from '@shared/route-urls';

import { whenPageMode } from '@app/common/utils';
import { ActivityList } from '@app/features/activity-list/activity-list';
import { ActivityListLegacy } from '@app/features/activity-list/activity-list-legacy';
import { Collectibles } from '@app/features/collectibles/collectibles';
import { useFlags } from '@app/features/feature-flags';
import { FeedbackButton } from '@app/features/feedback-button/feedback-button';
import { PromoBanner } from '@app/features/promo-banner/promo-banner';
import { homePageModalRoutes } from '@app/routes/app-routes';
import { ModalBackgroundWrapper } from '@app/routes/components/modal-background-wrapper';

import { AccountActionsSwitch } from './components/account-actions-switch';
import { AccountCardSwitch } from './components/account-card-switch';
import { AssetsSwitch } from './components/assets-switch';
import { HomeTabsSwitch } from './components/home-tabs-switch';

export function Home() {
  const { accountRevamp, homeTabsRevamp, activityRevamp } = useFlags();

  return (
    <Flex
      direction="column"
      data-testid={HomePageSelectors.HomePageContainer}
      px={['0', 'space.05']}
      pt="space.04"
      width="100%"
      bg="ink.1"
      animation="fadein"
      animationDuration="500ms"
    >
      <Flex px={['space.05', 0]} pb="space.05" gap="space.05" direction="column">
        <AccountCardSwitch />
        {accountRevamp && <AccountActionsSwitch />}
        <PromoBanner />
      </Flex>
      {whenPageMode({ full: <FeedbackButton />, popup: null })}
      <HomeTabsSwitch>
        <ModalBackgroundWrapper>
          <Route index element={<AssetsSwitch />} />
          <Route
            path={RouteUrls.Activity}
            element={activityRevamp ? <ActivityList /> : <ActivityListLegacy />}
          >
            {homePageModalRoutes}
          </Route>
          {homeTabsRevamp && (
            <Route path={RouteUrls.Collectibles} element={<Collectibles />}>
              {homePageModalRoutes}
            </Route>
          )}
          {homePageModalRoutes}
        </ModalBackgroundWrapper>
      </HomeTabsSwitch>
    </Flex>
  );
}
