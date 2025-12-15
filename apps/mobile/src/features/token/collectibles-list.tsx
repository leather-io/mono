import { ReactElement } from 'react';
import { useWindowDimensions } from 'react-native';

import { ErrorFallbackTab } from '@/components/error/error';
import { FetchState } from '@/components/loading/fetch-state';
import { Screen } from '@/components/screen/screen';
import { CollectibleTypeIconOverlay } from '@/features/collectibles/components';
import { RefreshControl } from '@/features/refresh-control/refresh-control';
import { CollectiblesListLoading } from '@/features/token/components/collectibles-list-loading';
import { EmptyCollectiblesState } from '@/features/token/components/empty-collectibles-state';

import { type CollectibleView, type TokenDetailsProps } from '@leather.io/features';
import { assertUnreachable } from '@leather.io/utils';

import { Inscription } from './bitcoin/inscription';
import { Stamp } from './bitcoin/stamp';
import { Sip9 } from './stacks/sip9';

interface RenderCollectibleProps {
  item: CollectibleView;
  height: number;
  onPress?(tokenDetails: TokenDetailsProps): void;
}
function renderCollectible({ item, height, onPress }: RenderCollectibleProps) {
  const asset = item.asset;
  const content = (() => {
    switch (asset.protocol) {
      case 'stamp':
        return <Stamp item={asset} height={height} onPress={onPress} />;
      case 'sip9':
        return <Sip9 item={asset} height={height} onPress={onPress} />;
      case 'inscription':
        return <Inscription item={asset} height={height} onPress={onPress} />;
      default:
        return assertUnreachable(asset);
    }
  })();

  return (
    <CollectibleTypeIconOverlay protocol={item.protocol}>{content}</CollectibleTypeIconOverlay>
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
  collectiblesState: FetchState<CollectibleView[]>;
  header: ReactElement;
  onPressToken?(tokenDetails: TokenDetailsProps): void;
}

export function CollectiblesList({
  collectiblesState,
  header,
  onPressToken,
}: CollectiblesListProps) {
  const collectibles = collectiblesState.state === 'success' ? collectiblesState.value : [];
  const height = useCollectibleListItemHeight();

  const isSuccess = collectiblesState.state === 'success';
  const isLoading = collectiblesState.state === 'loading';
  const isError = collectiblesState.state === 'error';

  return (
    <Screen.FlashList
      numColumns={2}
      data={collectibles}
      renderItem={
        isSuccess
          ? ({ item }) =>
              renderCollectible({
                item,
                height,
                onPress: onPressToken ? onPressToken : undefined,
              })
          : undefined
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
