import { Navigate } from 'react-router';

import { Flex, HStack, VStack, styled } from 'leather-styles/jsx';
import { usePoolInfo } from '~/features/stacking/hooks/use-pool-info';
import { PooledStackingActionButtons } from '~/features/stacking/pooled-stacking-info/pooled-stacking-action-buttons';
import { PooledStackingInfoGrid } from '~/features/stacking/pooled-stacking-info/pooled-stacking-info-grid';
import { useStackingClient } from '~/features/stacking/providers/stacking-client-provider';
import { PoolSlug } from '~/features/stacking/start-pooled-stacking/utils/stacking-pool-types';
import { useLeatherConnect } from '~/store/addresses';

import { LoadingSpinner } from '@leather.io/ui';

interface PooledStackingActiveInfoProps {
  poolSlug: PoolSlug;
}

export function PooledStackingActiveInfo({ poolSlug }: PooledStackingActiveInfoProps) {
  const { client } = useStackingClient();
  const { stacksAccount: stxAddress } = useLeatherConnect();

  if (!stxAddress || !client) return <Navigate to="/stacking" replace />;
  if (!client) return 'Expected client to be defined';

  return <PooledStackingActiveInfoLayout poolSlug={poolSlug} />;
}

interface PooledStackingActiveInfoLayoutProps {
  poolSlug: PoolSlug;
}
function PooledStackingActiveInfoLayout({ poolSlug }: PooledStackingActiveInfoLayoutProps) {
  const {
    isLoading,
    isError,
    stackingTrackerPool,
    poolRewardProtocolInfo,
    hardcodePoolRewardProtocolInfo,
  } = usePoolInfo(poolSlug);

  if (isLoading) {
    return (
      <Flex justifyContent="center" alignItems="center" h="100%">
        <LoadingSpinner fill="ink.text-subdued" />
      </Flex>
    );
  }

  // for use mocked data
  if (isError && stackingTrackerPool?.data) {
    return 'Failed to load Pox data';
  }

  const info = poolRewardProtocolInfo || hardcodePoolRewardProtocolInfo;

  return (
    <VStack
      flexDirection={['column-reverse', 'column-reverse', 'column']}
      alignItems="stretch"
      py="space.03"
    >
      <HStack justifyContent="space-between">
        <VStack display={['none', 'none', 'flex']} gap="space.05" alignItems="left" p="space.05">
          {info?.logo}
          <styled.h4 textDecoration="underline" textStyle="label.01">
            {info?.title}
          </styled.h4>
        </VStack>
        <PooledStackingActionButtons width={['100%', '100%', 'unset']} poolSlug={poolSlug} />
      </HStack>

      {info && (
        <PooledStackingInfoGrid poolIcon={info.logo} poolName={info.title} rewardProtocol={info} />
      )}
    </VStack>
  );
}
