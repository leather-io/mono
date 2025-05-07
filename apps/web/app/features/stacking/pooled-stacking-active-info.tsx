import { StackingClient } from '@stacks/stacking';
import { Flex, HStack, VStack, styled } from 'leather-styles/jsx';
import {
  useGetCoreInfoQuery,
  useGetPoxInfoQuery,
  useGetStatusQuery,
} from '~/features/stacking/hooks/stacking.query';
import { PooledStackingActionButtons } from '~/features/stacking/pooled-stacking-info/pooled-stacking-action-buttons';
import { PooledStackingInfoGrid } from '~/features/stacking/pooled-stacking-info/pooled-stacking-info-grid';
import { useStackingClient } from '~/features/stacking/providers/stacking-client-provider';
import {
  poolRewardProtocol,
  pools,
} from '~/features/stacking/start-pooled-stacking/components/preset-pools';
import {
  PoolIdToDisplayNameMap,
  PoolSlug,
  PoolSlugToIdMap,
} from '~/features/stacking/start-pooled-stacking/utils/types-preset-pools';
import { useLeatherConnect } from '~/store/addresses';
import { useStacksNetwork } from '~/store/stacks-network';
import { formatPoxAddressToNetwork } from '~/utils/stacking-pox';

import { Money } from '@leather.io/models';
import { LoadingSpinner } from '@leather.io/ui';
import { createMoney } from '@leather.io/utils';

import { useDelegationStatusQuery } from './pooled-stacking-info/use-delegation-status-query';
import { useGetPoolAddress } from './pooled-stacking-info/use-get-pool-address-query';

interface PooledStackingActiveInfoProps {
  poolSlug: PoolSlug;
}

export function PooledStackingActiveInfo({ poolSlug }: PooledStackingActiveInfoProps) {
  const { client } = useStackingClient();
  const { stacksAccount: stxAddress } = useLeatherConnect();

  if (!stxAddress || !client) {
    return 'You should connect STX wallet';
  }
  if (!client) {
    return 'Expected client to be defined';
  }

  return <PooledStackingActiveInfoLayout client={client} poolSlug={poolSlug} />;
}

interface PooledStackingActiveInfoLayoutProps {
  poolSlug: PoolSlug;
  client: StackingClient;
}

function PooledStackingActiveInfoLayout({ poolSlug }: PooledStackingActiveInfoLayoutProps) {
  const poxInfoQuery = useGetPoxInfoQuery();
  const delegationStatusQuery = useDelegationStatusQuery();
  const getStatusQuery = useGetStatusQuery();
  const getCoreInfoQuery = useGetCoreInfoQuery();
  const getPoolAddressQuery = useGetPoolAddress();
  const { network } = useStacksNetwork();

  if (
    poxInfoQuery.isLoading ||
    getPoolAddressQuery.isLoading ||
    delegationStatusQuery.isLoading ||
    getStatusQuery.isLoading ||
    getCoreInfoQuery.isLoading
  ) {
    return (
      <Flex justifyContent="center" alignItems="center" h="100%">
        <LoadingSpinner fill="ink.text-subdued" />
      </Flex>
    );
  }

  if (
    poxInfoQuery.isError ||
    !poxInfoQuery.data ||
    delegationStatusQuery.isError ||
    !delegationStatusQuery.data
  )
    return <>Failed to load Pox data</>;

  const poolId = PoolSlugToIdMap[poolSlug];
  const poolName = PoolIdToDisplayNameMap[poolId];
  const pool = pools[poolName];

  console.log('pool', pool);
  console.log('poxInfoQuery.data', poxInfoQuery.data);
  console.log('delegationStatusQuery.data', delegationStatusQuery.data);
  console.log('getStatusQuery.data', getStatusQuery.data);
  console.log('getCoreInfoQuery.data', getCoreInfoQuery.data);
  console.log('getPoolAddressQuery.data', getPoolAddressQuery.data);

  const poxAddress = getStatusQuery.data?.stacked ? getStatusQuery.data.details.pox_address : null;

  const pooledStackingInfo = {
    status: getStatusQuery.data?.stacked ? 'Active' : 'Waiting on pool',
    tvl: createMoney(poxInfoQuery.data.current_cycle.stacked_ustx, 'STX'),
    poolAddress: getPoolAddressQuery.data?.poolAddress,
    rewardsToken: 'STX',
    minLockupPeriodCycles: 15,
    rewardAddress: poxAddress ? formatPoxAddressToNetwork(network, poxAddress) : null,
  };

  // console.log('pooledStackingInfo', pooledStackingInfo);

  return (
    <VStack alignItems="stretch" pt="12px">
      <HStack justifyContent="space-between">
        <VStack gap="space.05" alignItems="left" p="space.05">
          {pool.icon}
          <styled.h4 textStyle="label.01">{pool.name}</styled.h4>
        </VStack>
        <PooledStackingActionButtons poolSlug={poolSlug} />
      </HStack>

      <PooledStackingInfoGrid rewardProtocol={pooledStackingInfo} />
    </VStack>
  );
}
