import { Navigate } from 'react-router';

import { Flex, VStack } from 'leather-styles/jsx';
import { usePoolInfo } from '~/features/stacking/hooks/use-pool-info';
import { PooledStackingActionButtons } from '~/features/stacking/pooled-stacking-info/pooled-stacking-action-buttons';
import { PooledStackingInfoGrid } from '~/features/stacking/pooled-stacking-info/pooled-stacking-info-grid';
import { useDelegationStatusQuery } from '~/features/stacking/pooled-stacking-info/use-delegation-status-query';
import { useStackingClient } from '~/features/stacking/providers/stacking-client-provider';
import {
  PoolSlug,
  getPoolFromSlug,
} from '~/features/stacking/start-pooled-stacking/utils/stacking-pool-types';
import { useLeatherConnect } from '~/store/addresses';
import { useStacksNetwork } from '~/store/stacks-network';
import { formatPoxAddressToNetwork } from '~/utils/stacking-pox';

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
  const { isLoading, isError, stackingTrackerPool, poolRewardProtocolInfo } = usePoolInfo(poolSlug);
  const { btcAddressP2wpkh, stacksAccount } = useLeatherConnect();
  const delegationStatusQuery = useDelegationStatusQuery();
  const { network } = useStacksNetwork();

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

  const info = poolRewardProtocolInfo;
  const pool = getPoolFromSlug(poolSlug);

  function getUserRewardAddress(): string | undefined {
    if (pool.payout === 'STX') {
      return stacksAccount?.address;
    }
    if (delegationStatusQuery.data?.delegated && delegationStatusQuery.data.details.pox_address) {
      return formatPoxAddressToNetwork(network, delegationStatusQuery.data.details.pox_address);
    }
    return btcAddressP2wpkh?.address;
  }

  const userRewardAddress = getUserRewardAddress();

  return (
    <VStack alignItems="stretch" py="space.03">
      <Flex display={['flex', 'flex', 'none']}>
        <PooledStackingActionButtons width="100%" poolSlug={poolSlug} />
      </Flex>

      {info && (
        <PooledStackingInfoGrid
          poolIcon={info.logo}
          poolName={info.title}
          poolSlug={poolSlug}
          rewardProtocol={info}
          userRewardAddress={userRewardAddress}
        />
      )}
    </VStack>
  );
}
