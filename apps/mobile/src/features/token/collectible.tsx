import { useWindowDimensions } from 'react-native';

import { Screen } from '@/components/screen/screen';
import { HeaderSubtitle } from '@/components/screen/screen-header/components/header-title';
import { NetworkBadge } from '@/features/settings/network-badge';
import { useSettings } from '@/store/settings/settings';
import { ChainId } from '@stacks/network';

import { NonFungibleCryptoAsset } from '@leather.io/models';
import { Box, Text } from '@leather.io/ui/native';


import { renderCollectibleDetailsRecursively } from './utils/render-collectible-details';

interface CollectibleProps {
  children: React.ReactNode;
  name?: string;
  description?: string;
  details?: NonFungibleCryptoAsset;
}

export function useCollectibleHeight() {
  const { height } = useWindowDimensions();
  // Set height to 50% of screen, but clamp between 200 and 342
  // Going above 200px leaves visible gaps between some images
  const calculatedHeight = Math.round(Math.max(200, Math.min(height * 0.5, 342)));

  return calculatedHeight;
}

export function Collectible({
  name,
  details,
  children,
}: CollectibleProps) {
  const collection = details && 'collection' in details ? details.collection : undefined;
  // TODO: add chain name to the collectible - make a component for this to update the link
  const { networkPreference } = useSettings();
  const chainName = networkPreference.chain.stacks.chainId === ChainId.Mainnet ? 'mainnet' : 'testnet';

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
            {children}
           {/* {description && (
            <TokenDetailsCard title={t`Description`}>
              <Text variant="caption01">{description}</Text>
            </TokenDetailsCard>
          )} */}
          {details && renderCollectibleDetailsRecursively(details, chainName)}
        </Box>
      </Screen.ScrollView>
    </Screen>
  );
}
