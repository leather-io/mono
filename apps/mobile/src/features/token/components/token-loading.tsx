import { Screen } from '@/components/screen/screen';
import { NetworkBadge } from '@/features/settings/network-badge';
import { TokenActivity } from '@/features/token/components/token-activity';
import { TokenDetailsTable } from '@/features/token/components/token-details-table';
import { TokenOverview } from '@/features/token/components/token-overview';

import { Box, SkeletonLoader } from '@leather.io/ui/native';

import { TokenDescriptionLoading } from './token-description';

function LoadingItem() {
  return <SkeletonLoader height={24} width={80} isLoading={true} />;
}

export function TokenLoading() {
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
                    <SkeletonLoader borderRadius="round" height={48} width={48} isLoading={true} />
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
            <TokenDescriptionLoading />
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
