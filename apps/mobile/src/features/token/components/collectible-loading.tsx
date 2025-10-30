import { Screen } from '@/components/screen/screen';
import { SummaryTableItem, SummaryTableRoot } from '@/components/summary-table';
import { NetworkBadge } from '@/features/settings/network-badge';
import { t } from '@lingui/core/macro';

import { Box, SkeletonLoader } from '@leather.io/ui/native';

import { TokenDetailsCard } from './token-details-card';

function LoadingItem() {
  return <SkeletonLoader height={24} width={160} isLoading={true} />;
}

export function CollectibleLoading({ height }: { height: number }) {
  return (
    <Screen>
      <Screen.Header rightElement={<NetworkBadge />} />
      <Screen.ScrollView>
        <Box gap="1" backgroundColor="ink.background-secondary">
          <Box p="5" backgroundColor="ink.background-primary">
            <SkeletonLoader height={height} width="100%" isLoading={true} />
          </Box>
          <TokenDetailsCard title={t`Description`}>
            <SkeletonLoader height={24} width="100%" isLoading={true} />
          </TokenDetailsCard>
          <TokenDetailsCard title={t`Collectible Info`}>
            <SummaryTableRoot>
              <SummaryTableItem label={t`Name`} value={<LoadingItem />} />
              <SummaryTableItem label={t`Collection`} value={<LoadingItem />} />
              <SummaryTableItem label={t`Protocol`} value={<LoadingItem />} />
            </SummaryTableRoot>
          </TokenDetailsCard>
        </Box>
      </Screen.ScrollView>
    </Screen>
  );
}
