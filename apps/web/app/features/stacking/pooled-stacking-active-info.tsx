import { StackingClient } from '@stacks/stacking';
import { VStack } from 'leather-styles/jsx';
import { StackingInfoGrid } from '~/features/stacking/components/stacking-info-grid';
import { useGetPoxInfoQuery } from '~/features/stacking/hooks/stacking.query';
import { useStackingClient } from '~/features/stacking/providers/stacking-client-provider';
import { poolRewardProtocol } from '~/features/stacking/start-pooled-stacking/components/preset-pools';
import { PoolSlug } from '~/features/stacking/start-pooled-stacking/utils/types-preset-pools';
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

// eslint-disable-next-line no-empty-pattern
function PooledStackingActiveInfoLayout({}: PooledStackingActiveInfoLayoutProps) {
  const poxInfoQuery = useGetPoxInfoQuery();

  if (poxInfoQuery.isLoading) return null;
  if (poxInfoQuery.isError || !poxInfoQuery.data) return <>Failed to load Pox data</>;

  return (
    <VStack alignItems="stretch" pt="12px">
      <StackingInfoGrid rewardProtocol={poolRewardProtocol} />
    </VStack>
  );
}
