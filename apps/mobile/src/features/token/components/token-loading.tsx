import { Screen } from '@/components/screen/screen';
import { NetworkBadge } from '@/features/settings/network-badge';
import { TokenActivity } from '@/features/token/components/token-activity';
import { TokenDetailsTable } from '@/features/token/components/token-details-table';
import { TokenOverview } from '@/features/token/components/token-overview';
import { t } from '@lingui/core/macro';

import { Box, SkeletonLoader } from '@leather.io/ui/native';

import { TokenDetailsCard } from './token-details-card';

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
              availableBalance={<LoadingItem />}
              quoteBalance={<></>}
              actionButtons={<></>}
            />
            <TokenDetailsCard title={t`Description`}>
              <SkeletonLoader height={24} width="100%" isLoading={true} />
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
