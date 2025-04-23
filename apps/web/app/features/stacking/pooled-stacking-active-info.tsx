import { StackingClient } from '@stacks/stacking';
import { HStack, VStack, styled } from 'leather-styles/jsx';
import { useGetPoxInfoQuery } from '~/features/stacking/hooks/stacking.query';
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

  if (poxInfoQuery.isLoading) return null;
  if (poxInfoQuery.isError || !poxInfoQuery.data) return <>Failed to load Pox data</>;

  const poolId = PoolSlugToIdMap[poolSlug];
  const poolName = PoolIdToDisplayNameMap[poolId];
  const pool = pools[poolName];

  return (
    <VStack alignItems="stretch" pt="12px">
      <HStack justifyContent="space-between">
        <VStack gap="space.05" alignItems="left" p="space.05">
          {pool.icon}
          <styled.h4 textStyle="label.01">{pool.name}</styled.h4>
        </VStack>
        <PooledStackingActionButtons poolSlug={poolSlug} />
      </HStack>

      <PooledStackingInfoGrid rewardProtocol={poolRewardProtocol} />
    </VStack>
  );
}
