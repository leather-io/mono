import { Screen } from '@/components/screen/screen';
import { HeaderSubtitle } from '@/components/screen/screen-header/components/header-title';
import { SummaryTableItem, SummaryTableRoot } from '@/components/summary-table';
import { NetworkBadge } from '@/features/settings/network-badge';
import { t } from '@lingui/core/macro';

import { NonFungibleCryptoAsset } from '@leather.io/models';
import { Box, Text } from '@leather.io/ui/native';

import { TokenDetailsCard } from './components/token-details-card';

interface CollectibleProps {
  collectible: NonFungibleCryptoAsset;
  children: React.ReactNode;
  name: string;
  description?: string;
  collection?: string;
}

export function Collectible({
  collectible,
  name,
  description,
  children,
  collection,
}: CollectibleProps) {
  const title = name;
  return (
    <Screen>
      <Screen.Header
        centerElement={
          <Box flexDirection="column" gap="1" alignItems="center">
            {/* 
            HeaderTitle extended to add ellipsis 
            could just ...props there 

            investigate inscription + stamp names
             */}
            <Text
              variant="heading05"
              color="ink.text-primary"
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{ maxWidth: '80%' }}
            >
              {title}
            </Text>

            {collection && <HeaderSubtitle title={collection} />}
          </Box>
        }
        rightElement={<NetworkBadge />}
      />
      <Screen.ScrollView>
        <Box p="5">{children}</Box>
        {/* </Box> */}
        {description && (
          <TokenDetailsCard title={t`Description`}>
            <Text variant="caption01">{description}</Text>
          </TokenDetailsCard>
        )}
        <TokenDetailsCard title={t`Details`}>
          <SummaryTableRoot>
            <SummaryTableItem label={t`Name`} value={name} />
          </SummaryTableRoot>
        </TokenDetailsCard>
      </Screen.ScrollView>
    </Screen>
  );
}

// >>> PETE - you made enough of a start here
// - revisit origial PR and
// -> roll back SIP-9 create changes
// -> ask for re-review and update of dynamic size in this PR
// -> try get that stuff merged first then continue on in smaller chunks
