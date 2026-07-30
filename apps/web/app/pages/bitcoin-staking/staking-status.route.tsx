import { MetaDescriptor, Navigate } from 'react-router';

import { Stack, styled } from 'leather-styles/jsx';
import { WhenClient } from '~/components/when-client';
import { bitcoinStakingContent } from '~/content/bitcoin-staking-content';
import { stakingProviderIdToSlug } from '~/data/bitcoin-staking-data';
import { usePox5Position } from '~/features/bitcoin-staking/hooks/use-pox5-position';
import { Page } from '~/layouts/page/page';
import { stakingPaths } from '~/pages/bitcoin-staking/bitcoin-staking.constants';
import { useLeatherConnect } from '~/store/addresses';

import { LoadingSpinner } from '@leather.io/ui';

export function meta() {
  return [{ title: 'Bitcoin Staking – Leather' }] satisfies MetaDescriptor[];
}

// Pool-agnostic entry point: support can hand out /staking/status without
// knowing which pool someone is staking with. The pool comes from the
// position's signer principal, so only a connected address is needed.
function StakingStatusResolver() {
  const { stacksAccount } = useLeatherConnect();
  const { isLoading, position } = usePox5Position();

  if (!stacksAccount) {
    return (
      <Stack gap="space.02" maxWidth="60ch" mt="space.05">
        <styled.h2 textStyle="heading.05">
          {bitcoinStakingContent.stakingStatus.connectTitle}
        </styled.h2>
        <styled.p textStyle="body.02" color="ink.text-subdued">
          {bitcoinStakingContent.stakingStatus.connectDescription}
        </styled.p>
      </Stack>
    );
  }

  if (isLoading) return <LoadingSpinner />;

  // A custom signer-manager has no pool page, and pending or absent positions
  // are both already represented on the overview, so everything else lands
  // there rather than 404ing on a pool slug we cannot resolve.
  if (position.status === 'active' && position.pool) {
    return (
      <Navigate
        replace
        to={stakingPaths.active(stakingProviderIdToSlug(position.pool.providerId))}
      />
    );
  }

  return <Navigate replace to={stakingPaths.index} />;
}

export default function StakingStatusRoute() {
  return (
    <Page>
      <Page.Header title="Your staking" backTo={stakingPaths.index} />
      <WhenClient>
        <StakingStatusResolver />
      </WhenClient>
    </Page>
  );
}
