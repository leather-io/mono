import { type ReactElement } from 'react';
import { useWindowDimensions } from 'react-native';

import { ErrorFallbackTab } from '@/components/error/error';
import { RefreshControl } from '@/components/refresh-control/refresh-control';
import { Screen } from '@/components/screen/screen';
import { CollectiblesListLoading } from '@/features/token/components/collectibles-list-loading';
import { EmptyCollectiblesContent } from '@/features/token/components/empty-collectibles-content';
import { type FetchState } from '@/queries/fetch-state';
import { useCollectibleDetailsFlag } from '@/shared/feature-flags';
import { useRouter } from 'expo-router';

import { type NonFungibleCryptoAsset } from '@leather.io/models';
import { getAssetId, serializeAssetId } from '@leather.io/utils';

import { Sip9 } from './stacks/sip9';

interface RenderCollectibleProps {
  item: NonFungibleCryptoAsset;
  height: number;
  onPress?(): void;
}
function renderCollectible({ item, height, onPress }: RenderCollectibleProps) {
  if (item.protocol !== 'sip9') return null;
  return <Sip9 item={item} height={height} onPress={onPress} />;
}

function useCollectibleListItemHeight() {
  const { height } = useWindowDimensions();
  // Set height to 25% of screen, but clamp between 160 and 200
  // Going above 200px leaves visible gaps between some images
  const calculatedHeight = Math.round(Math.max(160, Math.min(height * 0.25, 200)));

  return calculatedHeight;
}

interface CollectiblesListProps {
  collectiblesState: FetchState<NonFungibleCryptoAsset[]>;
  header: ReactElement;
}

export function CollectiblesList({ collectiblesState, header }: CollectiblesListProps) {
  const collectibles = collectiblesState.state === 'success' ? collectiblesState.value : [];
  const height = useCollectibleListItemHeight();
  const router = useRouter();
  const collectiblesDetailsFlag = useCollectibleDetailsFlag();

  const isLoading = collectiblesState.state === 'loading';
  const isError = collectiblesState.state === 'error';

  return (
    <Screen.FlashList
      numColumns={2}
      data={collectibles}
      renderItem={({ item }) =>
        renderCollectible({
          item,
          height,
          onPress: collectiblesDetailsFlag
            ? () =>
                router.navigate({
                  pathname: '/(tabs)/(index)/[assetId]',
                  params: { assetId: serializeAssetId(getAssetId(item)) },
                })
            : undefined,
        })
      }
      getItemType={item => item.protocol}
      refreshControl={<RefreshControl />}
      ListHeaderComponent={
        <>
          {header}
          {isLoading && <CollectiblesListLoading count={4} height={height} />}
          {isError && <ErrorFallbackTab />}
        </>
      }
      ListEmptyComponent={!isLoading && !isError ? <EmptyCollectiblesContent /> : undefined}
    />
  );
}
