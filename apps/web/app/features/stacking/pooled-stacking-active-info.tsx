import { StackingClient } from '@stacks/stacking';
import { HStack, VStack, styled } from 'leather-styles/jsx';
import { ProviderIcon } from '~/components/icons/provider-icon';
import { useGetPoxInfoQuery } from '~/features/stacking/hooks/stacking.query';
import { PooledStackingActionButtons } from '~/features/stacking/pooled-stacking-info/pooled-stacking-action-buttons';
import { PooledStackingInfoGrid } from '~/features/stacking/pooled-stacking-info/pooled-stacking-info-grid';
import { useStackingClient } from '~/features/stacking/providers/stacking-client-provider';
import { dummyPoolRewardProtocol } from '~/features/stacking/start-pooled-stacking/components/preset-pools';
import {
  PoolSlug,
  getPoolFromSlug,
} from '~/features/stacking/start-pooled-stacking/utils/stacking-pool-types';
import { useLeatherConnect } from '~/store/addresses';

interface PooledStackingActiveInfoProps {
  poolSlug: PoolSlug;
}

export function PooledStackingActiveInfo({ poolSlug }: PooledStackingActiveInfoProps) {
  const { client } = useStackingClient();
  const { stacksAccount: stxAddress } = useLeatherConnect();

  if (!stxAddress || !client) return 'You should connect STX wallet';
  if (!client) return 'Expected client to be defined';

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

  const pool = getPoolFromSlug(poolSlug);

  return (
    <VStack
      flexDirection={['column-reverse', 'column-reverse', 'column']}
      alignItems="stretch"
      py="space.03"
    >
      <HStack justifyContent="space-between">
        <VStack display={['none', 'none', 'flex']} gap="space.05" alignItems="left" p="space.05">
          <ProviderIcon providerId={pool.providerId} />
          <styled.h4 textDecoration="underline" textStyle="label.01">
            {pool.name}
          </styled.h4>
        </VStack>
        <PooledStackingActionButtons width={['100%', '100%', 'unset']} poolSlug={poolSlug} />
      </HStack>

      <PooledStackingInfoGrid
        poolIcon={<ProviderIcon providerId={pool.providerId} />}
        poolName={pool.name}
        rewardProtocol={dummyPoolRewardProtocol}
      />
    </VStack>
  );
}
