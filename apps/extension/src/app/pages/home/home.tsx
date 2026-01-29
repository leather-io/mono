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

import { AccountActions } from './components/account-actions-current/account-actions';
import { AccountCard } from './components/account-card';
import { Assets } from './components/assets';
import { HomeTabs } from './components/home-tabs';

export function Home() {
  const { activityRevamp } = useFlags();

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
        <AccountCard />
        <AccountActions />
        <PromoBanner />
      </Flex>
      {whenPageMode({ full: <FeedbackButton />, popup: null })}
      <HomeTabs>
        <ModalBackgroundWrapper>
          <Route index element={<Assets />} />
          <Route
            path={RouteUrls.Activity}
            element={activityRevamp ? <ActivityList /> : <ActivityListLegacy />}
          />
          <Route path={RouteUrls.Collectibles} element={<Collectibles />} />
          {homePageModalRoutes}
        </ModalBackgroundWrapper>
      </HomeTabs>
    </Flex>
  );
}
