import { useWindowDimensions } from 'react-native';

import { Screen } from '@/components/screen/screen';
import { HeaderSubtitle } from '@/components/screen/screen-header/components/header-title';
import { SummaryTableItem, SummaryTableRoot } from '@/components/summary-table';
import { NetworkBadge } from '@/features/settings/network-badge';
import { t } from '@lingui/core/macro';

import { Sip9Collection } from '@leather.io/models';
import { Box, Text } from '@leather.io/ui/native';

import { TokenDetailsCard } from './components/token-details-card';

interface CollectibleProps {
  children: React.ReactNode;
  name?: string;
  description?: string;
  collection?: Sip9Collection;
}

export function useCollectibleHeight() {
  const { height } = useWindowDimensions();
  // Set height to 50% of screen, but clamp between 200 and 342
  // Going above 200px leaves visible gaps between some images
  const calculatedHeight = Math.round(Math.max(200, Math.min(height * 0.5, 342)));

  return calculatedHeight;
}

export function Collectible({ name, description, collection, children }: CollectibleProps) {
  return (
    <Screen>
      <Screen.Header
        centerElement={
          <Box flexDirection="column" gap="1" alignItems="center">
            <Text
              variant="heading05"
              color="ink.text-primary"
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{ maxWidth: '100%' }}
            >
              {name}
            </Text>

            {collection && <HeaderSubtitle title={collection.name} />}
          </Box>
        }
        rightElement={<NetworkBadge />}
      />
      <Screen.ScrollView>
        <Box gap="1" backgroundColor="ink.background-secondary">
          <Box p="5" backgroundColor="ink.background-primary">
            {children}
          </Box>
          {description && (
            <TokenDetailsCard title={t`Description`}>
              <Text variant="caption01">{description}</Text>
            </TokenDetailsCard>
          )}
          <TokenDetailsCard title={t`Details`}>
            <SummaryTableItem label={t`Name`} value={name} />
            <SummaryTableRoot>
              {collection &&
                Object.entries(collection).map(([key, value]) => (
                  <SummaryTableItem
                    key={key}
                    label={`${key.charAt(0).toUpperCase() + key.slice(1)}`}
                    value={
                      typeof value === 'object' && value !== null
                        ? JSON.stringify(value)
                        : String(value)
                    }
                  />
                ))}
            </SummaryTableRoot>
          </TokenDetailsCard>
        </Box>
      </Screen.ScrollView>
    </Screen>
  );
}
