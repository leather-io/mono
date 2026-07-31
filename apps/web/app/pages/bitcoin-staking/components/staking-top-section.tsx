import { styled } from 'leather-styles/jsx';
import { ApyRewardHeroCard } from '~/components/apy-hero-card';
import { SectionHeading } from '~/components/section-heading';
import { bitcoinStakingContent } from '~/content/bitcoin-staking-content';
import { usePox5NeedsRestake } from '~/features/bitcoin-staking/hooks/use-pox5-needs-restake';
import { usePox5Position } from '~/features/bitcoin-staking/hooks/use-pox5-position';
import { Page } from '~/layouts/page/page';
import { useStacksAccount } from '~/store/addresses';

import { StakingUserPosition } from './staking-user-position';

function DiscoveryIntro() {
  return (
    <>
      <Page.Heading
        title="Earn Bitcoin yield with your STX"
        subtitle={
          <>
            {bitcoinStakingContent.pageSubtitle}
            <styled.p textStyle="caption.01" color="ink.text-subdued" mt="space.02">
              Leather does not operate or manage any staking pools. Users are responsible for
              evaluating the risks, terms, and smart contracts involved in any third-party options
              they access through Leather.
            </styled.p>
          </>
        }
      />

      <ApyRewardHeroCard
        apyRange={bitcoinStakingContent.heroYieldLabel}
        backgroundImage="url(/images/stacking-hero.png)"
        backgroundRepeat="no-repeat"
        backgroundSize="contain"
        backgroundPosition="right"
      />
    </>
  );
}

function PositionIntro() {
  return (
    <>
      <SectionHeading
        title={bitcoinStakingContent.yourPosition.title}
        sentence={bitcoinStakingContent.yourPosition.sentence}
        mt="space.07"
      />
      <StakingUserPosition />
    </>
  );
}

// Someone who already stakes comes here to check on it, not to be sold the idea,
// so their position replaces the pitch entirely rather than sitting below it.
// While the scan is still resolving the discovery layout stays put and the
// progress is reported next to the wallet control instead.
function ConnectedTopSection() {
  const { isLoading, position } = usePox5Position();
  const needsRestake = usePox5NeedsRestake();

  if (isLoading) return <DiscoveryIntro />;

  const hasPositionToShow = position.status !== 'none' || needsRestake === true;

  return hasPositionToShow ? <PositionIntro /> : <DiscoveryIntro />;
}

export function StakingTopSection() {
  const stacksAccount = useStacksAccount();

  if (!stacksAccount) return <DiscoveryIntro />;

  return <ConnectedTopSection />;
}
