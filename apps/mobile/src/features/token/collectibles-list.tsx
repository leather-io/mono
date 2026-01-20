import { ReactElement } from 'react';
import { useWindowDimensions } from 'react-native';

import { ErrorFallbackTab } from '@/components/error/error';
import { FetchState } from '@/components/loading/fetch-state';
import { Screen } from '@/components/screen/screen';
import { RefreshControl } from '@/features/refresh-control/refresh-control';
import { CollectiblesListLoading } from '@/features/token/components/collectibles-list-loading';
import { EmptyCollectiblesState } from '@/features/token/components/empty-collectibles-state';
import { useRouter } from 'expo-router';

import { NonFungibleCryptoAsset } from '@leather.io/models';
import { CollectibleTypeIconOverlay } from '@leather.io/ui/native';
import { assertUnreachable, getAssetId, serializeAssetId } from '@leather.io/utils';

import { useCollectibleDetailsFlag } from '../feature-flags';
import { Inscription } from './bitcoin/inscription';
import { Stamp } from './bitcoin/stamp';
import { Sip9 } from './stacks/sip9';

interface RenderCollectibleProps {
  item: NonFungibleCryptoAsset;
  height: number;
  onPress?(): void;
}
function renderCollectible({ item, height, onPress }: RenderCollectibleProps) {
  const collectible = (() => {
    switch (item.protocol) {
      case 'stamp':
        return <Stamp item={item} height={height} onPress={onPress} />;
      case 'sip9':
        return <Sip9 item={item} height={height} onPress={onPress} />;
      case 'inscription':
        return <Inscription item={item} height={height} onPress={onPress} />;
      default:
        return assertUnreachable(item);
    }
  })();

  return (
    <CollectibleTypeIconOverlay protocol={item.protocol}>{collectible}</CollectibleTypeIconOverlay>
  );
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
      ListEmptyComponent={!isLoading && !isError ? <EmptyCollectiblesState /> : undefined}
    />
  );
}
