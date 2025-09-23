import { useWindowDimensions } from 'react-native';

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

export function useCollectibleHeight() {
  const { height } = useWindowDimensions();
  // Set height to 25% of screen, but clamp between 200 and 350
  // Going above 200px leaves visible gaps between some images
  const calculatedHeight = Math.round(Math.max(200, Math.min(height * 0.25, 350)));

  return calculatedHeight;
}

export function Collectible({ name, description, children, collection }: CollectibleProps) {
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
