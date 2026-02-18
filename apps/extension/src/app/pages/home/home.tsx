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
import { useLocation } from '@app/routes/compat';
import { useBackgroundLocation } from '@app/routes/hooks/use-background-location';

import { AccountActions } from './components/account-actions-current/account-actions';
import { AccountCard } from './components/account-card';
import { HomeTabs } from './components/home-tabs';
import { Tokens } from './components/tokens';

function HomeTabContent() {
  const location = useLocation();
  const backgroundLocation = useBackgroundLocation();
  const { activityRevamp } = useFlags();
  const pathname = backgroundLocation?.pathname ?? location.pathname;

  if (pathname.startsWith(RouteUrls.Activity))
    return activityRevamp ? <ActivityList /> : <ActivityListLegacy />;
  if (pathname.startsWith(RouteUrls.Collectibles)) return <Collectibles />;
  return <Tokens />;
}

const animationState = { hasPlayed: false };

interface HomeProps {
  isBackground?: boolean;
}

export function Home({ isBackground }: HomeProps) {
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
      </Flex>
      {whenPageMode({ full: <FeedbackButton />, popup: null })}
      <HomeTabs>
        <HomeTabContent />
      </HomeTabs>
    </Flex>
  );
}
