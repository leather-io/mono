import { ReactElement } from 'react';
import { useWindowDimensions } from 'react-native';

import { ErrorFallbackTab } from '@/components/error/error';
import { Screen } from '@/components/screen/screen';
import { EmptyCollectiblesState } from '@/features/collectibles/components/empty-collectibles-state';
import { Loading } from '@/features/collectibles/components/loading';
import { RefreshControl } from '@/features/refresh-control/refresh-control';
import { useAccountCollectibles } from '@/queries/collectibles/account-collectibles.query';

import { AccountId } from '@leather.io/models';

import { renderCollectible } from './render-collectible';

interface CollectiblesListProps {
  currentAccount: AccountId;
  header: ReactElement;
}

export function useCollectibleHeight() {
  const { height } = useWindowDimensions();
  // Set height to 25% of screen, but clamp between 160 and 200
  // Going above 200px leaves visible gaps between some images
  const calculatedHeight = Math.round(Math.max(160, Math.min(height * 0.25, 200)));

  return calculatedHeight;
}

export function CollectiblesList({ currentAccount, header }: CollectiblesListProps) {
  const { fingerprint, accountIndex } = currentAccount;
  const { value: collectibles, state: collectiblesState } = useAccountCollectibles(
    fingerprint,
    accountIndex
  );
  const height = useCollectibleHeight();

  const isSuccess = collectiblesState === 'success';
  const isLoading = collectiblesState === 'loading';
  const isError = collectiblesState === 'error';

  return (
    <Screen.FlashList
      numColumns={2}
      data={collectibles}
      renderItem={isSuccess ? ({ item }) => renderCollectible({ item, height }) : undefined}
      getItemType={item => item.protocol}
      refreshControl={<RefreshControl />}
      ListHeaderComponent={
        <>
          {header}
          {isLoading && <Loading count={4} height={height} />}
          {isError && <ErrorFallbackTab />}
        </>
      }
      ListEmptyComponent={!isLoading && !isError ? <EmptyCollectiblesState /> : undefined}
    />
  );
}
