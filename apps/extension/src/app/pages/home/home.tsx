import { Route, useNavigate } from 'react-router';

import { HomePageSelectors } from '@tests/selectors/home.selectors';
import { Flex } from 'leather-styles/jsx';

import { RouteUrls } from '@shared/route-urls';

import { whenPageMode } from '@app/common/utils';
import { ActivityList } from '@app/features/activity-list/activity-list';
import { ActivityListLegacy } from '@app/features/activity-list/activity-list-legacy';
import { Collectibles } from '@app/features/collectibles/collectibles';
import { useFlags } from '@app/features/feature-flags';
import { MultiWalletIntroducer } from '@app/features/feature-introducer/implementations';
import { FeedbackButton } from '@app/features/feedback-button/feedback-button';
import { PromoBanner } from '@app/features/promo-banner/promo-banner';
import { NotFoundContent } from '@app/pages/not-found/not-found';
import { useAccountCollectibles } from '@app/query/collectibles/account-collectibles.query';
import { homePageModalRoutes } from '@app/routes/app-routes';
import { ModalBackgroundWrapper } from '@app/routes/components/modal-background-wrapper';
import { useAccountAddresses } from '@app/services/accounts/use-account-addresses';
import { useCurrentAccountId } from '@app/store/accounts/account';

import { AccountActions } from './components/account-actions-current/account-actions';
import { AccountCard } from './components/account-card';
import { HomeTabs } from './components/home-tabs';
import { Tokens } from './components/tokens';

function HomeNotFound() {
  const navigate = useNavigate();
  return <NotFoundContent onGoHome={() => navigate(RouteUrls.Home)} />;
}

const animationState = { hasPlayed: false };

interface HomeProps {
  isBackground?: boolean;
}

export function Home({ isBackground }: HomeProps) {
  console.log('home renders');
  const { activityRevamp } = useFlags();
  const accountId = useCurrentAccountId();
  const account = useAccountAddresses(accountId);
  useAccountCollectibles(account);

  const shouldAnimate = !isBackground && !animationState.hasPlayed;
  if (shouldAnimate) {
    animationState.hasPlayed = true;
  }

  return (
    <Flex
      direction="column"
      data-testid={HomePageSelectors.HomePageContainer}
      px={['0', 'space.05']}
      pt="space.04"
      width="100%"
      bg="ink.1"
      animation={shouldAnimate ? 'fadein' : undefined}
      animationDuration={shouldAnimate ? '500ms' : undefined}
    >
      <Flex px={['space.05', 0]} pb="space.05" gap="space.05" direction="column">
        <AccountCard />
        <AccountActions />
        <PromoBanner />
        <MultiWalletIntroducer />
      </Flex>
      {whenPageMode({ full: <FeedbackButton />, popup: null })}
      <HomeTabs>
        <ModalBackgroundWrapper>
          <Route index element={<Tokens />} />
          <Route
            path={RouteUrls.Activity}
            element={activityRevamp ? <ActivityList /> : <ActivityListLegacy />}
          />
          <Route path={RouteUrls.Collectibles} element={<Collectibles />} />
          {homePageModalRoutes}
          <Route path="*" element={<HomeNotFound />} />
        </ModalBackgroundWrapper>
      </HomeTabs>
    </Flex>
  );
}
