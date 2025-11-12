import { Screen } from '@/components/screen/screen';
import { SummaryTableItem, SummaryTableRoot } from '@/components/summary-table';
import { NetworkBadge } from '@/features/settings/network-badge';
import { TokenActivity } from '@/features/token/components/token-activity';
import { TokenDetailsTable } from '@/features/token/components/token-details-table';
import { TokenOverview } from '@/features/token/components/token-overview';
import { t } from '@lingui/core/macro';

import { Box, SkeletonLoader } from '@leather.io/ui/native';

import { useCollectibleHeight } from '../collectible';
import { TokenDescriptionLoading } from './token-description';
import { TokenDetailsCard } from './token-details-card';

function LoadingItem() {
  return <SkeletonLoader height={14} width={80} isLoading />;
}

function TokenLoadingCollectible() {
  const height = useCollectibleHeight();
  return (
    <Screen>
      <Screen.Header rightElement={<NetworkBadge />} />

      <Screen.ScrollView>
        <Box gap="1" backgroundColor="ink.background-secondary">
          <Box p="5" backgroundColor="ink.background-primary">
            <SkeletonLoader height={height} width="100%" isLoading />
          </Box>
          <TokenDetailsCard title={t`Description`}>
            <TokenDescriptionLoading />
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

function TokenLoadingToken() {
  return (
    <Screen>
      <Screen.Header rightElement={<NetworkBadge />} />

      <TokenActivity
        activity={{ state: 'loading' }}
        // All other content is in the Activity ListHeader to avoid nested scrolling errors
        ListHeader={
          <>
            <TokenOverview
              heading={
                <Box flexDirection="column" justifyContent="space-between" gap="4">
                  <Box alignItems="center" height={48} width={48}>
                    <SkeletonLoader borderRadius="round" height={48} width={48} isLoading />
                  </Box>
                </Box>
              }
              availableBalance={
                <Box flexDirection="row" alignItems="center" gap="1">
                  <SkeletonLoader height={23} maxWidth={120} isLoading />

                  <SkeletonLoader height={23} maxWidth={60} isLoading />
                </Box>
              }
              quoteBalance={
                <Box flexDirection="row" alignItems="center" gap="1" pt="1">
                  <SkeletonLoader height={14} maxWidth={62} isLoading />
                </Box>
              }
              actionButtons={<></>}
            />
            <TokenDetailsCard title={t`Description`}>
              <TokenDescriptionLoading />
            </TokenDetailsCard>
            <TokenDetailsTable
              name={<LoadingItem />}
              layer={<LoadingItem />}
              price={<LoadingItem />}
              priceChange={<LoadingItem />}
            />
          </>
        }
      />
    </Screen>
  );
}
interface TokenLoadingProps {
  variant?: 'token' | 'collectible';
}

export function TokenLoading({ variant = 'token' }: TokenLoadingProps) {
  if (variant === 'collectible') {
    return <TokenLoadingCollectible />;
  }
  return <TokenLoadingToken />;
}
